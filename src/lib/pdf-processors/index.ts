import { PDFDocument, rgb, StandardFonts, degrees, BlendMode } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import PptxGenJS from 'pptxgenjs';
import { ProcessingOptions, ProcessedFile, PDFPageInfo } from '../types';
import { fileUtils, errorUtils } from '../utils';

// PDF Processing Base Class
abstract class PDFProcessor {
  protected options: ProcessingOptions;
  
  constructor(options: ProcessingOptions = {}) {
    this.options = {
      quality: 'medium',
      compression: 0.8,
      ...options
    };
  }

  abstract process(file: File): Promise<ProcessedFile | ProcessedFile[]>;

    protected parseColor(hex: string) {
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      return rgb(r, g, b);
    }

    protected async loadPDF(file: File): Promise<PDFDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await PDFDocument.load(arrayBuffer);
    } catch (error) {
      throw errorUtils.createError(
        'CORRUPTED_FILE',
        'Failed to load PDF file. The file may be corrupted or password protected.',
        error
      );
    }
  }

  protected async savePDF(pdfDoc: PDFDocument, filename: string, saveOptions?: any): Promise<ProcessedFile> {
    try {
      const pdfBytes = await pdfDoc.save(saveOptions);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        originalName: filename,
        size: blob.size,
        type: 'application/pdf',
        data: Array.from(new Uint8Array(pdfBytes)),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-processor',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to save processed PDF file.',
        error
      );
    }
  }

  protected getOutputFilename(originalName: string, suffix: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${suffix}.pdf`;
  }

  protected parsePageRange(range: string, totalPages: number): number[] {
    const indices: number[] = [];
    if (!range) return indices;
    
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim()) - 1;
        const end = parseInt(endStr.trim()) - 1;
        
        if (isNaN(start) || isNaN(end)) continue;
        
        for (let i = start; i <= end && i < totalPages; i++) {
          if (i >= 0 && !indices.includes(i)) {
            indices.push(i);
          }
        }
      } else {
        const page = parseInt(trimmed) - 1;
        if (!isNaN(page) && page >= 0 && page < totalPages && !indices.includes(page)) {
          indices.push(page);
        }
      }
    }
    
    return indices.sort((a, b) => a - b);
  }

  protected async convertImageToBuffer(imgData: any): Promise<ArrayBuffer | null> {
    if (!imgData) return null;
    try {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const size = imgData.width * imgData.height;
        const clamped = new Uint8ClampedArray(size * 4);
        const data = imgData.data;

        if (data.length === size * 4) {
            clamped.set(data);
        } else if (data.length === size * 3) {
            for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
                clamped[j] = data[i];
                clamped[j + 1] = data[i + 1];
                clamped[j + 2] = data[i + 2];
                clamped[j + 3] = 255;
            }
        } else if (data.length === size) {
            for (let i = 0, j = 0; i < data.length; i++, j += 4) {
                const val = data[i];
                clamped[j] = val;
                clamped[j + 1] = val;
                clamped[j + 2] = val;
                clamped[j + 3] = 255;
            }
        } else {
            return null;
        }

        const imageData = new ImageData(clamped, imgData.width, imgData.height);
        ctx.putImageData(imageData, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    blob.arrayBuffer().then(resolve);
                } else {
                    resolve(null);
                }
            }, 'image/png');
        });
    } catch (e) {
        console.error('Error converting image to buffer:', e);
        return null;
    }
  }

  protected arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  protected detectStructure(lines: any[]): any[] {
    const structure: any[] = [];
    let currentTableRows: any[] = [];
    let currentTableColumns: { x: number, width: number }[] = [];
    
    const COLUMN_GAP_TOLERANCE = 15; 
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 1. Check if line fits current table
        let fitsCurrentTable = false;
        if (currentTableRows.length > 0) {
            fitsCurrentTable = this.checkLineAgainstColumns(line, currentTableColumns, COLUMN_GAP_TOLERANCE);
        }
        
        // 2. Check if line starts a new table (lookahead)
        let startsNewTable = false;
        if (!fitsCurrentTable && i + 1 < lines.length) {
             const nextLine = lines[i+1];
             if (this.checkColumnAlignment(line, nextLine, COLUMN_GAP_TOLERANCE)) {
                 startsNewTable = true;
             }
        }
        
        if (fitsCurrentTable) {
            currentTableRows.push(line);
            // Update columns
            currentTableColumns = this.mergeColumns(currentTableColumns, line.items, COLUMN_GAP_TOLERANCE);
        } else if (startsNewTable) {
            // Close previous table
            if (currentTableRows.length > 0) {
                structure.push({ 
                    type: 'table', 
                    rows: currentTableRows,
                    columns: currentTableColumns 
                });
            }
            
            // Start new table
            currentTableRows = [line];
            currentTableColumns = line.items.map((item: any) => ({ x: item.x, width: item.width }));
        } else {
            // Close previous table
            if (currentTableRows.length > 0) {
                structure.push({ 
                    type: 'table', 
                    rows: currentTableRows,
                    columns: currentTableColumns 
                });
                currentTableRows = [];
                currentTableColumns = [];
            }
            structure.push(line);
        }
    }
    
    if (currentTableRows.length > 0) {
        structure.push({ 
            type: 'table', 
            rows: currentTableRows,
            columns: currentTableColumns 
        });
    }
    
    return structure;
  }
  
  protected checkLineAgainstColumns(line: any, columns: any[], tolerance: number): boolean {
      const items = line.items;
      if (items.length === 0) return true; 
      
      let matchCount = 0;
      for (const item of items) {
          const matched = columns.some(col => Math.abs(item.x - col.x) < tolerance);
          if (matched) matchCount++;
      }
      
      return matchCount >= items.length * 0.5;
  }
  
  protected checkColumnAlignment(line1: any, line2: any, tolerance: number): boolean {
      const items1 = line1.items;
      const items2 = line2.items;
      
      if (items1.length < 2 && items2.length < 2) return false;
      
      let matches = 0;
      for (const item1 of items1) {
          const matched = items2.some((item2: any) => Math.abs(item1.x - item2.x) < tolerance);
          if (matched) matches++;
      }
      
      const minLen = Math.min(items1.length, items2.length);
      // At least 2 matches or 50% of items align
      return matches >= Math.max(2, minLen * 0.5); 
  }

  protected mergeColumns(currentCols: any[], newItems: any[], tolerance: number): any[] {
      const updatedCols = [...currentCols];
      
      for (const item of newItems) {
          const matched = updatedCols.some(col => Math.abs(item.x - col.x) < tolerance);
          if (!matched) {
              updatedCols.push({ x: item.x, width: item.width });
          }
      }
      
      return updatedCols;
  }

  protected getConsolidatedRows(rows: any[], columns: any[]): any[] {
      if (rows.length === 0) return [];
      
      // 1. Refine Columns: Sort by X
      const sortedCols = [...columns].sort((a: any, b: any) => a.x - b.x);
      
      // 2. Build Grid: Group visual lines by Y
      const rowGroups: { y: number, items: any[] }[] = [];
      
      rows.forEach(row => {
          const existing = rowGroups.find(rg => Math.abs(rg.y - row.y) < 10); 
          if (existing) {
              existing.items.push(...row.items);
          } else {
              rowGroups.push({ y: row.y, items: [...row.items] });
          }
      });
      rowGroups.sort((a, b) => a.y - b.y);
      
      // 3. Consolidate "broken" rows (wrapped text) into logical rows
      const logicalRows: { y: number, items: any[] }[] = [];
      if (rowGroups.length > 0) {
          let currentLogicalRow = rowGroups[0];
          
          for (let i = 1; i < rowGroups.length; i++) {
              const nextRow = rowGroups[i];
              const yDiff = Math.abs(nextRow.y - currentLogicalRow.y);
              
              const firstColX = sortedCols[0]?.x || 0;
              const hasFirstCol = nextRow.items.some(item => Math.abs(item.x - firstColX) < 20);
              const prevHasFirstCol = currentLogicalRow.items.some(item => Math.abs(item.x - firstColX) < 20);
              
              // Heuristic: Merge if next row looks like continuation (small gap, indented/empty first col)
              if (yDiff < 25 && !hasFirstCol && prevHasFirstCol) {
                  currentLogicalRow.items.push(...nextRow.items);
              } else {
                  logicalRows.push(currentLogicalRow);
                  currentLogicalRow = nextRow;
              }
          }
          logicalRows.push(currentLogicalRow);
      }
      
      return logicalRows;
  }

  protected analyzeTableStructure(rows: any[], columns: any[]): { 
      cells: { 
          text: string; 
          items: any[]; 
          rowSpan: number; 
          colSpan: number; 
          rowIndex: number; 
          colIndex: number; 
          isCovered: boolean; 
      }[][];
  } {
      if (rows.length === 0) return { cells: [] };
      
      const sortedCols = [...columns].sort((a: any, b: any) => a.x - b.x);
      const logicalRows = this.getConsolidatedRows(rows, sortedCols);
      
      const grid: any[][] = [];
      const coveredCells = new Set<string>(); // Tracks vertically and horizontally merged cells
      
      logicalRows.forEach((row, rowIndex) => {
          const rowCells: any[] = [];
          const distCells: any[] = Array(sortedCols.length).fill(null);
          
          // Distribute items
          row.items.forEach((item: any) => {
              let startCol = -1;
              let minD = Infinity;
              sortedCols.forEach((col, cIdx) => {
                  const dist = Math.abs(item.x - col.x);
                  if (dist < minD) { minD = dist; startCol = cIdx; }
              });
              if (startCol !== -1) {
                  if (!distCells[startCol]) distCells[startCol] = { items: [item], text: item.text };
                  else {
                      distCells[startCol].text += ' ' + item.text;
                      distCells[startCol].items.push(item);
                  }
              }
          });
          
          for (let cIdx = 0; cIdx < sortedCols.length; cIdx++) {
              if (coveredCells.has(`${rowIndex},${cIdx}`)) {
                   rowCells.push({ 
                      text: '', items: [], rowSpan: 1, colSpan: 1, 
                      rowIndex, colIndex: cIdx, isCovered: true 
                   });
                   continue;
              }
              
              const cellData = distCells[cIdx] || { items: [], text: '' };
              const items = cellData.items;
              
              // Detect ColSpan
              let colSpan = 1;
              if (items.length > 0) {
                  let maxEndCol = cIdx;
                  const itemEnd = items.reduce((max: number, it: any) => Math.max(max, it.x + it.width), 0);
                  
                  for (let nextC = cIdx + 1; nextC < sortedCols.length; nextC++) {
                      const col = sortedCols[nextC];
                      const nextColX = sortedCols[nextC+1]?.x || (col.x + 100);
                      const colW = nextColX - col.x;
                      if (itemEnd > col.x + (colW * 0.4)) {
                          maxEndCol = nextC;
                      } else {
                          break;
                      }
                  }
                  colSpan = maxEndCol - cIdx + 1;
              }
              
              // Merge items from spanned columns
              if (colSpan > 1) {
                  for (let k = 1; k < colSpan; k++) {
                      const spannedData = distCells[cIdx + k];
                      if (spannedData) {
                          items.push(...spannedData.items);
                          cellData.text += ' ' + spannedData.text;
                      }
                      coveredCells.add(`${rowIndex},${cIdx + k}`);
                  }
              }
              
              // Detect RowSpan
              let rowSpan = 1;
              if (items.length > 0) {
                  const itemBottom = items.reduce((max: number, it: any) => Math.max(max, it.y + it.height), 0);
                  for (let r = rowIndex + 1; r < logicalRows.length; r++) {
                      const nextRowY = logicalRows[r].y;
                      if (nextRowY < itemBottom - 5) {
                          rowSpan++;
                      } else {
                          break;
                      }
                  }
              }
              
              if (rowSpan > 1) {
                  for (let r = 1; r < rowSpan; r++) {
                      for (let c = 0; c < colSpan; c++) {
                          coveredCells.add(`${rowIndex + r},${cIdx + c}`);
                      }
                  }
              }
              
              rowCells.push({
                  text: cellData.text,
                  items: items,
                  rowSpan,
                  colSpan,
                  rowIndex,
                  colIndex: cIdx,
                  isCovered: false
              });
          }
          grid.push(rowCells);
      });
      
      return { cells: grid };
  }

  protected groupItemsIntoLines(items: any[], adaptiveTolerance: boolean = false): any[] {
      // Sort primarily by Y, then by X
      items.sort((a, b) => a.y - b.y || a.x - b.x);

      const lines: any[] = [];
      let currentLine: any[] = [];
      let currentY = -1;
      let currentHeight = 0;

      const finalizeLine = (lineItems: any[], y: number, height: number) => {
          if (lineItems.length === 0) return null;
          // Sort by X to ensure correct order
          lineItems.sort((a, b) => a.x - b.x);
          
          const text = lineItems.reduce((str, item, idx) => {
              if (idx === 0) return item.text;
              const prev = lineItems[idx-1];
              const gap = item.x - (prev.x + prev.width);
              return str + (gap > 3 ? ' ' : '') + item.text;
          }, '');

          const x = lineItems[0].x;
          const lastItem = lineItems[lineItems.length - 1];
          const width = (lastItem.x + lastItem.width) - x;

          return { 
              items: lineItems, 
              y, 
              x, 
              width,
              height, 
              text 
          };
      };

      for (const item of items) {
          if (currentY === -1) {
              currentY = item.y;
              currentHeight = item.height || 12;
              currentLine.push(item);
          } else {
              const tolerance = adaptiveTolerance 
                  ? Math.max(5, (currentHeight + (item.height || 12)) / 4) 
                  : 5;
              
              if (Math.abs(item.y - currentY) < tolerance) {
                  currentLine.push(item);
              } else {
                  const line = finalizeLine(currentLine, currentY, currentHeight);
                  if (line) lines.push(line);
                  
                  currentLine = [item];
                  currentY = item.y;
                  currentHeight = item.height || 12;
              }
          }
      }
      const line = finalizeLine(currentLine, currentY, currentHeight);
      if (line) lines.push(line);
      
      return lines;
  }

  protected mapFont(fontName: string): string {
      if (!fontName) return 'Calibri';
      const lower = fontName.toLowerCase();
      
      if (lower.includes('times')) return 'Times New Roman';
      if (lower.includes('courier')) return 'Courier New';
      if (lower.includes('arial') || lower.includes('helvetica')) return 'Arial';
      if (lower.includes('verdana')) return 'Verdana';
      if (lower.includes('tahoma')) return 'Tahoma';
      if (lower.includes('trebuchet')) return 'Trebuchet MS';
      if (lower.includes('georgia')) return 'Georgia';
      if (lower.includes('garamond')) return 'Garamond';
      if (lower.includes('comic')) return 'Comic Sans MS';
      
      return 'Calibri';
  }

  protected isBold(fontName: string): boolean {
      if (!fontName) return false;
      const lower = fontName.toLowerCase();
      return lower.includes('bold') || lower.includes('bd') || lower.includes('demi') || lower.includes('black');
  }

  protected isItalic(fontName: string): boolean {
      if (!fontName) return false;
      const lower = fontName.toLowerCase();
      return lower.includes('italic') || lower.includes('it') || lower.includes('oblique');
  }
}

// PDF Merger
class PDFMerger {
  constructor(private options: ProcessingOptions = {}) {}

  async process(files: File[]): Promise<ProcessedFile[]> {
    if (files.length < 2) {
      throw errorUtils.createError(
        'INVALID_INPUT',
        'At least 2 PDF files are required for merging.'
      );
    }

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      return [{
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'merged_document.pdf',
        originalName: files.map(f => f.name).join(', '),
        size: blob.size,
        type: 'application/pdf',
        data: Array.from(new Uint8Array(pdfBytes)),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-merger',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      }];
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to merge PDF files.',
        error
      );
    }
  }


}

// PDF Splitter
  class PDFSplitter extends PDFProcessor {
    protected getOutputFilename(originalName: string, suffix: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${suffix}.pdf`;
  }

  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageCount = pdf.getPageCount();
      const results: ProcessedFile[] = [];
      
      const splitMode = this.options.splitMode || 'every';
      const everyNPages = this.options.everyNPages || 1;

      if (splitMode === 'every') {
        // Split into chunks of N pages
        for (let i = 0; i < pageCount; i += everyNPages) {
          const newPdf = await PDFDocument.create();
          const end = Math.min(i + everyNPages, pageCount);
          const pagesToCopy = Array.from({ length: end - i }, (_, idx) => i + idx);
          
          const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
          const filename = this.getOutputFilename(file.name, `part_${Math.floor(i / everyNPages) + 1}`);
          
          const result: ProcessedFile = {
            id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: filename,
            originalName: file.name,
            size: blob.size,
            type: 'application/pdf',
            data: Array.from(new Uint8Array(pdfBytes)),
            processedAt: new Date().toISOString(),
            toolUsed: 'pdf-splitter',
            blob,
            downloadUrl: URL.createObjectURL(blob)
          };
          results.push(result);
        }
      } else if (splitMode === 'range') {
        // Split by range (extract a single range as a new file)
        const startPage = this.options.startPage || 1;
        const endPage = this.options.endPage || pageCount;
        
        // Validate range
        if (startPage < 1 || endPage > pageCount || startPage > endPage) {
           throw errorUtils.createError('INVALID_INPUT', `Invalid page range: ${startPage}-${endPage}`);
        }

        const newPdf = await PDFDocument.create();
        // Convert 1-based to 0-based
        const startIdx = startPage - 1;
        const endIdx = endPage - 1;
        
        const pagesToCopy = [];
        for (let i = startIdx; i <= endIdx; i++) {
           pagesToCopy.push(i);
        }
        
        const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const filename = this.getOutputFilename(file.name, `range_${startPage}-${endPage}`);
        
        results.push({
            id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: filename,
            originalName: file.name,
            size: blob.size,
            type: 'application/pdf',
            data: Array.from(new Uint8Array(pdfBytes)),
            processedAt: new Date().toISOString(),
            toolUsed: 'pdf-splitter',
            blob,
            downloadUrl: URL.createObjectURL(blob)
        });

      } else if (splitMode === 'pages') {
        // Extract specific pages (as a single file? Or individual files?)
        // SplitPDFTool says "Selected pages will be extracted". 
        // Usually implies a single file containing those pages.
        // But "Split" tool could mean "Split these pages out".
        // Let's assume it creates ONE file with the selected pages (Extraction).
        
        const specificPages = this.options.specificPages || []; // 1-based
        if (specificPages.length === 0) {
           throw errorUtils.createError('INVALID_INPUT', 'No pages selected for splitting');
        }

        const newPdf = await PDFDocument.create();
        const pagesToCopy = specificPages
           .map((p: number) => p - 1)
           .filter((p: number) => p >= 0 && p < pageCount);
           
        if (pagesToCopy.length === 0) {
           throw errorUtils.createError('INVALID_INPUT', 'No valid pages selected');
        }

        const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const filename = this.getOutputFilename(file.name, `selected_pages`);
        
        results.push({
            id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: filename,
            originalName: file.name,
            size: blob.size,
            type: 'application/pdf',
            data: Array.from(new Uint8Array(pdfBytes)),
            processedAt: new Date().toISOString(),
            toolUsed: 'pdf-splitter',
            blob,
            downloadUrl: URL.createObjectURL(blob)
        });

      } else {
         // Fallback default: Split every page individually
         for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const filename = this.getOutputFilename(file.name, `page_${i + 1}`);
            
            const result: ProcessedFile = {
              id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: filename,
              originalName: file.name,
              size: blob.size,
              type: 'application/pdf',
              data: Array.from(new Uint8Array(pdfBytes)),
              processedAt: new Date().toISOString(),
              toolUsed: 'pdf-splitter',
              blob,
              downloadUrl: URL.createObjectURL(blob)
            };
            results.push(result);
         }
      }

      if (this.options.asZip && results.length > 0) {
        const zip = new JSZip();
        
        results.forEach(result => {
          if (result.blob) {
            zip.file(result.name, result.blob);
          }
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        
        return [{
          id: `zip_${Date.now()}`,
          name: `${baseName}_images.zip`,
          originalName: file.name,
          size: zipBlob.size,
          type: 'application/zip',
          data: [], 
          processedAt: new Date().toISOString(),
          toolUsed: 'pdf-to-images',
          blob: zipBlob,
          downloadUrl: URL.createObjectURL(zipBlob)
        }];
      }
      
      return results;
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to split PDF file.',
        error
      );
    }
  }
}

// PDF Page Extractor
class PDFPageExtractor extends PDFProcessor {
  private extractMode: string;
  private pageRanges: string[];
  private selectedPages: number[];
  
  constructor(options: ProcessingOptions & { extractMode?: string; pageRanges?: string[]; selectedPages?: number[]; pageRange?: string }) {
    super(options);
    this.extractMode = options.extractMode || 'individual';
    this.pageRanges = options.pageRanges || [];
    this.selectedPages = options.selectedPages || [];
    
    // Support legacy pageRange format
    if (options.pageRange && !options.extractMode) {
      this.extractMode = 'ranges';
      this.pageRanges = [options.pageRange];
    }
  }

  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const pdf = await this.loadPDF(file);
      const pageCount = pdf.getPageCount();
      
      let pageIndices: number[] = [];
      
      if (this.extractMode === 'individual' && this.selectedPages.length > 0) {
        // Convert 1-based page numbers to 0-based indices
        pageIndices = this.selectedPages.map(page => page - 1).filter(index => index >= 0 && index < pageCount);
      } else if (this.extractMode === 'ranges' && this.pageRanges.length > 0) {
        // Parse page ranges
        for (const range of this.pageRanges) {
          const rangeIndices = this.parsePageRange(range, pageCount);
          pageIndices.push(...rangeIndices);
        }
        // Remove duplicates and sort
        pageIndices = [...new Set(pageIndices)].sort((a, b) => a - b);
      }
      
      if (pageIndices.length === 0) {
        throw errorUtils.createError(
          'INVALID_INPUT',
          'No valid pages specified for extraction.'
        );
      }
      
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, pageIndices);
      pages.forEach((page) => newPdf.addPage(page));
      
      const filename = this.getOutputFilename(file.name, 'extracted');
      return [await this.savePDF(newPdf, filename)];
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to extract pages from PDF.',
        error
      );
    }
  }

  private parsePageRangeObject(range: { start: number; end: number; id: string }, totalPages: number): number[] {
    const indices: number[] = [];
    
    // Convert 1-based page numbers to 0-based indices
    const startIndex = range.start - 1;
    const endIndex = range.end - 1;
    
    // Add all pages in the range
    for (let i = startIndex; i <= endIndex && i < totalPages; i++) {
      if (i >= 0 && !indices.includes(i)) {
        indices.push(i);
      }
    }
    
    return indices;
  }


}

// PDF Compressor
class PDFCompressor extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile[]> {
    try {
      // Check for rasterization request (Extreme Compression) or Grayscale
      if (this.options.useRasterization || this.options.grayscale) {
         console.log('Using rasterization strategy for extreme compression/grayscale');
         // Use provided quality or default to 0.5 (aggressive)
         const quality = typeof this.options.quality === 'number' ? this.options.quality : 0.5;
         let scale = typeof this.options.scale === 'number' ? this.options.scale : 1.0;
         
         let result = await this.applyRasterization(file, quality, this.options.grayscale || false, scale);
         
         // Iterative compression: if result is not smaller, reduce scale and try again
         // This ensures we "always compress further" as requested, even for already compressed files
         let attempts = 0;
         const maxAttempts = 4;
         
         while (result.size >= file.size && attempts < maxAttempts) {
            console.log(`Compression result (${result.size} bytes) not smaller than original (${file.size} bytes). Reducing scale...`);
            scale = scale * 0.6; // Reduce scale aggressively
            attempts++;
            
            if (scale < 0.1) {
               console.log('Scale too small, stopping reduction.');
               break;
            }
            
            console.log(`Retrying with scale: ${scale}`);
            try {
               result = await this.applyRasterization(file, quality, this.options.grayscale || false, scale);
            } catch (e) {
               console.error("Retry failed:", e);
               break; 
            }
         }
         
         // If still larger after retries, return original (as a safety net)
        // Unless 'force' is enabled (e.g., for sanitization or ensuring rasterization)
        if (result.size >= file.size && !this.options.force) {
           console.log('File already highly compressed (Rasterization did not reduce size) and force mode not enabled');
             
             const originalBuffer = new Uint8Array(await file.arrayBuffer());
             const blob = new Blob([originalBuffer], { type: 'application/pdf' });
             return [{
              id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              originalName: file.name,
              size: originalBuffer.byteLength,
              type: 'application/pdf',
              data: Array.from(originalBuffer),
              processedAt: new Date().toISOString(),
              toolUsed: 'pdf-compressor',
              blob,
              downloadUrl: URL.createObjectURL(blob)
            }];
         }

         const blob = new Blob([new Uint8Array(result.buffer)], { type: 'application/pdf' });
         const filename = this.getOutputFilename(file.name, this.options.grayscale ? 'grayscale' : 'compressed');
         
         return [{
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: filename,
          originalName: file.name,
          size: result.size,
          type: 'application/pdf',
          data: Array.from(new Uint8Array(result.buffer)),
          processedAt: new Date().toISOString(),
          toolUsed: 'pdf-compressor',
          blob,
          downloadUrl: URL.createObjectURL(blob)
        }];
      }

      const originalSize = file.size;
      const targetSize = this.options.targetSize || originalSize * 0.7; // Default 30% reduction
      const compressionLevel = this.options.compressionLevel || 'medium';
      
      // Analyze PDF to determine optimal compression strategy
      const pdf = await this.loadPDF(file);
      const analysis = await this.analyzePDF(pdf, file);
      console.log('PDF Analysis:', analysis);
      
      // Get strategies based on analysis and compression level
      const strategies = this.getOptimalStrategies(compressionLevel, analysis);
      
      let bestResult = null;
      let bestCompressionRatio = 1;
      
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`Attempting compression strategy ${i + 1}/${strategies.length}: ${strategy.name}`);
        
        try {
          const result = await this.applyCompressionStrategy(file, strategy);
          
          // Check if compression was successful
          const compressionRatio = result.size / originalSize;
          console.log(`Strategy ${strategy.name}: ${originalSize} -> ${result.size} bytes (${(compressionRatio * 100).toFixed(1)}% of original)`);
          
          // Keep track of the best result
          if (compressionRatio < bestCompressionRatio) {
            bestResult = result;
            bestCompressionRatio = compressionRatio;
          } else {
            console.log('File already highly compressed');
          }
          
          // If we achieved the target size, return immediately
          if (result.size <= targetSize) {
            const blob = new Blob([new Uint8Array(result.buffer)], { type: 'application/pdf' });
            const filename = this.getOutputFilename(file.name, 'compressed');
            return [{
              id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: filename,
              originalName: file.name,
              size: result.size,
              type: 'application/pdf',
              data: Array.from(new Uint8Array(result.buffer)),
              processedAt: new Date().toISOString(),
              toolUsed: 'pdf-compressor',
              blob,
              downloadUrl: URL.createObjectURL(blob)
            }];
          }
        } catch (error: any) {
          console.warn(`Strategy ${strategy.name} failed:`, error.message);
          // Continue to next strategy
        }
      }
      
      // Return the best result if we have one
      if (bestResult) {
        const blob = new Blob([new Uint8Array(bestResult.buffer)], { type: 'application/pdf' });
        const filename = this.getOutputFilename(file.name, 'compressed');
        return [{
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: filename,
          originalName: file.name,
          size: bestResult.size,
          type: 'application/pdf',
          data: Array.from(new Uint8Array(bestResult.buffer)),
          processedAt: new Date().toISOString(),
          toolUsed: 'pdf-compressor',
          blob,
          downloadUrl: URL.createObjectURL(blob)
        }];
      }
      
      // Final fallback: try minimal compression as last resort
      try {
        console.warn('All compression strategies failed, attempting minimal compression');
        const fallbackResult = await this.minimalCompression(pdf, {});
        
        // Only return if it actually reduced size
        if (fallbackResult.size < originalSize) {
          const blob = new Blob([new Uint8Array(fallbackResult.buffer)], { type: 'application/pdf' });
          const filename = this.getOutputFilename(file.name, 'minimal_compressed');
          return [{
            id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: filename,
            originalName: file.name,
            size: fallbackResult.size,
            type: 'application/pdf',
            data: Array.from(new Uint8Array(fallbackResult.buffer)),
            processedAt: new Date().toISOString(),
            toolUsed: 'pdf-compressor',
            blob,
            downloadUrl: URL.createObjectURL(blob)
          }];
        } else {
            console.log('File already highly compressed');
            throw new Error('Minimal compression ineffective');
        }
      } catch (fallbackError) {
        console.error('Even minimal compression failed, returning original file');
        // Absolute last resort - return the original file
        const originalBuffer = new Uint8Array(await file.arrayBuffer());
        const blob = new Blob([originalBuffer], { type: 'application/pdf' });
        return [{
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          originalName: file.name,
          size: originalBuffer.byteLength,
          type: 'application/pdf',
          data: Array.from(originalBuffer),
          processedAt: new Date().toISOString(),
          toolUsed: 'pdf-compressor',
          blob,
          downloadUrl: URL.createObjectURL(blob)
        }];
      }
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to compress PDF file.',
        error
      );
    }
  }
  
  private async analyzePDF(pdf: PDFDocument, file: File): Promise<any> {
    const analysis = {
      pageCount: pdf.getPageCount(),
      fileSize: file.size,
      hasForm: false,
      hasImages: false,
      hasMetadata: false,
      complexity: 'low',
      recommendedStrategies: [] as string[]
    };
    
    try {
      // Check for form fields
      const form = pdf.getForm();
      if (form) {
        const fields = form.getFields();
        analysis.hasForm = fields.length > 0;
      }
    } catch (e) {
      // No form
    }
    
    // Check for metadata
    try {
      const title = pdf.getTitle();
      const author = pdf.getAuthor();
      const subject = pdf.getSubject();
      analysis.hasMetadata = !!(title || author || subject);
    } catch (e) {
      // No metadata
    }
    
    // Determine complexity based on file size and page count
    const sizePerPage = file.size / analysis.pageCount;
    if (sizePerPage > 500000) { // > 500KB per page
      analysis.complexity = 'high';
      analysis.hasImages = true; // Likely has images
    } else if (sizePerPage > 100000) { // > 100KB per page
      analysis.complexity = 'medium';
    }
    
    // Recommend strategies based on analysis
    if (analysis.hasMetadata) {
      analysis.recommendedStrategies.push('metadata-removal');
    }
    if (analysis.hasForm) {
      analysis.recommendedStrategies.push('content-stripping');
    }
    if (analysis.hasImages) {
      analysis.recommendedStrategies.push('image-quality-reduction');
    }
    if (analysis.complexity === 'high') {
      analysis.recommendedStrategies.push('aggressive-rewrite');
    }
    
    return analysis;
  }
  
  private getOptimalStrategies(level: string, analysis: any) {
    const allStrategies = {
      'metadata-removal': {
        name: 'metadata-removal',
        description: 'Remove metadata and optimize structure',
        settings: { useObjectStreams: true, objectsPerTick: 100 },
        priority: analysis.hasMetadata ? 1 : 3
      },
      'content-optimization': {
        name: 'content-optimization',
        description: 'Optimize content streams and remove duplicates',
        settings: { useObjectStreams: true, objectsPerTick: 200 },
        priority: 2
      },
      'aggressive-rewrite': {
        name: 'aggressive-rewrite',
        description: 'Completely rewrite PDF with maximum compression',
        settings: { useObjectStreams: true, objectsPerTick: 1000 },
        priority: analysis.complexity === 'high' ? 1 : 4
      },
      'image-quality-reduction': {
        name: 'image-quality-reduction',
        description: 'Reduce image quality and resolution',
        settings: { useObjectStreams: true, objectsPerTick: 500, reduceImageQuality: true },
        priority: analysis.hasImages ? 2 : 5
      },
      'font-optimization': {
        name: 'font-optimization',
        description: 'Optimize fonts and remove unused glyphs',
        settings: { useObjectStreams: true, objectsPerTick: 300, optimizeFonts: true },
        priority: 3
      },
      'content-stripping': {
        name: 'content-stripping',
        description: 'Remove non-essential content elements',
        settings: { useObjectStreams: true, objectsPerTick: 1000, stripContent: true },
        priority: analysis.hasForm ? 1 : 6
      }
    };
    
    // Get strategies based on level
    let selectedStrategies = [];
    
    switch (level) {
      case 'low':
        selectedStrategies = ['metadata-removal'];
        break;
      case 'medium':
        selectedStrategies = ['metadata-removal', 'content-optimization'];
        break;
      case 'high':
        selectedStrategies = ['metadata-removal', 'content-optimization', 'aggressive-rewrite', 'font-optimization'];
        break;
      case 'maximum':
        selectedStrategies = Object.keys(allStrategies);
        break;
      default:
        selectedStrategies = ['metadata-removal', 'content-optimization'];
    }
    
    // Sort by priority and return
    return selectedStrategies
      .map(name => (allStrategies as any)[name])
      .sort((a, b) => a.priority - b.priority);
  }
  
  private getCompressionStrategies(level: string) {
    const baseStrategies = [
      {
        name: 'metadata-removal',
        description: 'Remove metadata and optimize structure',
        settings: { useObjectStreams: true, objectsPerTick: 100 }
      },
      {
        name: 'content-optimization',
        description: 'Optimize content streams and remove duplicates',
        settings: { useObjectStreams: true, objectsPerTick: 200 }
      },
      {
        name: 'aggressive-rewrite',
        description: 'Completely rewrite PDF with maximum compression',
        settings: { useObjectStreams: true, objectsPerTick: 1000 }
      }
    ];
    
    const advancedStrategies = [
      {
        name: 'image-quality-reduction',
        description: 'Reduce image quality and resolution',
        settings: { useObjectStreams: true, objectsPerTick: 500, reduceImageQuality: true }
      },
      {
        name: 'font-optimization',
        description: 'Optimize fonts and remove unused glyphs',
        settings: { useObjectStreams: true, objectsPerTick: 300, optimizeFonts: true }
      },
      {
        name: 'content-stripping',
        description: 'Remove non-essential content elements',
        settings: { useObjectStreams: true, objectsPerTick: 1000, stripContent: true }
      }
    ];
    
    switch (level) {
      case 'low':
        return baseStrategies.slice(0, 1);
      case 'medium':
        return baseStrategies.slice(0, 2);
      case 'high':
        return [...baseStrategies, ...advancedStrategies.slice(0, 2)];
      case 'maximum':
        return [...baseStrategies, ...advancedStrategies];
      default:
        return baseStrategies.slice(0, 2);
    }
  }
  
  private getCompressionSettings(level: string) {
    const settings = {
      low: { 
        useObjectStreams: false, 
        objectsPerTick: 50,
        addDefaultPage: false,
        updateFieldAppearances: false
      },
      medium: { 
        useObjectStreams: true, 
        objectsPerTick: 100,
        addDefaultPage: false,
        updateFieldAppearances: false
      },
      high: { 
        useObjectStreams: true, 
        objectsPerTick: 200,
        addDefaultPage: false,
        updateFieldAppearances: false
      },
      maximum: { 
        useObjectStreams: true, 
        objectsPerTick: 1000,
        addDefaultPage: false,
        updateFieldAppearances: false
      }
    };
    
    return settings[level as keyof typeof settings] || settings.medium;
  }
  
  private async applyCompressionStrategy(file: File, strategy: any): Promise<{ buffer: Uint8Array; size: number }> {
    const pdf = await this.loadPDF(file);
    
    switch (strategy.name) {
      case 'metadata-removal':
        return await this.applyMetadataRemoval(pdf, strategy.settings);
      
      case 'content-optimization':
        return await this.applyContentOptimization(pdf, strategy.settings);
      
      case 'aggressive-rewrite':
        return await this.applyAggressiveRewrite(pdf, strategy.settings);
      
      case 'image-quality-reduction':
        return await this.applyImageQualityReduction(pdf, strategy.settings);
      
      case 'font-optimization':
        return await this.applyFontOptimization(pdf, strategy.settings);
      
      case 'content-stripping':
        return await this.applyContentStripping(pdf, strategy.settings);
      
      default:
        return await this.applyMetadataRemoval(pdf, strategy.settings);
    }
  }
  
  private async applyMetadataRemoval(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    // Remove all metadata
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('');
    pdf.setCreator('');
    
    // Remove additional metadata
    await this.removeDuplicateResources(pdf);
    
    const pdfBytes = await pdf.save(settings);
    return { buffer: pdfBytes, size: pdfBytes.length };
  }
  
  private async applyContentOptimization(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Apply metadata removal first
      await this.applyMetadataRemoval(pdf, settings);
      
      // Optimize content
      await this.optimizePDFContent(pdf, settings);
      
      const pdfBytes = await pdf.save(settings);
      return { buffer: pdfBytes, size: pdfBytes.length };
    } catch (error) {
      console.warn('Content optimization failed, falling back to metadata removal only');
      return await this.applyMetadataRemoval(pdf, settings);
    }
  }
  
  private async applyAggressiveRewrite(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Create a completely new PDF document
      const newPdf = await PDFDocument.create();
      
      // Copy pages with optimization
      const pageIndices = pdf.getPageIndices();
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      
      // Add pages to new document
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });
      
      // Remove all metadata from new PDF
      newPdf.setTitle('');
      newPdf.setAuthor('');
      newPdf.setSubject('');
      newPdf.setKeywords([]);
      newPdf.setProducer('');
      newPdf.setCreator('');
      
      // Apply optimization
      await this.optimizePDFContent(newPdf, settings);
      
      const pdfBytes = await newPdf.save(settings);
      return { buffer: pdfBytes, size: pdfBytes.length };
    } catch (error) {
      console.warn('Aggressive rewrite failed, falling back to simple page copy');
      return await this.fallbackPageCopy(pdf, settings);
    }
  }

  private async applyImageQualityReduction(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Start with aggressive rewrite
      const result = await this.applyAggressiveRewrite(pdf, settings);
      
      // Note: pdf-lib doesn't provide direct image manipulation
      // This strategy focuses on removing unnecessary elements that might contain images
      console.log('Image quality reduction: Limited by pdf-lib capabilities');
      
      return result;
    } catch (error) {
      console.warn('Image quality reduction failed, falling back to content optimization');
      return await this.applyContentOptimization(pdf, settings);
    }
  }
  
  private async applyFontOptimization(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Apply content optimization first
      const result = await this.applyContentOptimization(pdf, settings);
      
      // Font subsetting is automatically handled by pdf-lib
      console.log('Font optimization: pdf-lib automatically applies font subsetting');
      
      return result;
    } catch (error) {
      console.warn('Font optimization failed, falling back to metadata removal');
      return await this.applyMetadataRemoval(pdf, settings);
    }
  }
  
  private async applyContentStripping(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Apply aggressive rewrite first
      const rewriteResult = await this.applyAggressiveRewrite(pdf, settings);
      
      // Load the rewritten PDF for further processing
      const rewrittenPdf = await PDFDocument.load(rewriteResult.buffer);
      
      // Remove form fields and annotations
      try {
        const form = rewrittenPdf.getForm();
        if (form) {
          const fields = form.getFields();
          fields.forEach(field => {
            try {
              form.removeField(field);
            } catch (e) {
              // Ignore removal errors
            }
          });
        }
      } catch (e) {
        // Ignore if form doesn't exist
      }
      
      // Remove annotations from all pages
      const pages = rewrittenPdf.getPages();
      pages.forEach(page => {
        try {
          // Note: pdf-lib doesn't provide direct annotation removal
          // This is a limitation of the library
        } catch (e) {
          // Ignore errors
        }
      });
      
      const pdfBytes = await rewrittenPdf.save(settings);
      return { buffer: pdfBytes, size: pdfBytes.length };
    } catch (error) {
      console.warn('Content stripping failed, falling back to aggressive rewrite');
      return await this.applyAggressiveRewrite(pdf, settings);
    }
  }

  // Fallback methods for error recovery
  private async fallbackPageCopy(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Simple page copy without optimization
      const newPdf = await PDFDocument.create();
      const pageIndices = pdf.getPageIndices();
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });
      
      const pdfBytes = await newPdf.save(settings);
      return { buffer: pdfBytes, size: pdfBytes.length };
    } catch (error) {
      console.warn('Fallback page copy failed, using minimal compression');
      return await this.minimalCompression(pdf, settings);
    }
  }

  private async minimalCompression(pdf: PDFDocument, settings: any): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      // Absolute minimal compression - just save with basic settings
      const basicSettings = {
        useObjectStreams: false,
        addDefaultPage: false
      };
      
      const pdfBytes = await pdf.save(basicSettings);
      return { buffer: pdfBytes, size: pdfBytes.length };
    } catch (error) {
      console.error('All compression methods failed, returning original PDF');
      // Last resort - return the original PDF as-is
      const pdfBytes = await pdf.save();
      return { buffer: pdfBytes, size: pdfBytes.length };
    }
  }
  
  private async savePDFWithCompression(pdfDoc: PDFDocument, filename: string, settings: any): Promise<ProcessedFile> {
    try {
      // Apply additional optimization
      await this.optimizePDFContent(pdfDoc, settings);
      
      // Save with compression settings
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: settings.useObjectStreams,
        addDefaultPage: false,
        objectsPerTick: settings.objectsPerTick,
        updateFieldAppearances: settings.updateFieldAppearances
      });
      
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        originalName: filename,
        size: blob.size,
        type: 'application/pdf',
        data: Array.from(new Uint8Array(pdfBytes)),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-compressor',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      };
    } catch (error) {
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to save compressed PDF file.',
        error
      );
    }
  }
  
  private async optimizePDFContent(pdfDoc: PDFDocument, settings: any): Promise<void> {
    try {
      // Remove unused objects and optimize structure
      const pages = pdfDoc.getPages();
      
      // Remove duplicate fonts and resources
      await this.removeDuplicateResources(pdfDoc);
      
      // Optimize images if present
      await this.optimizeImages(pdfDoc);
      
      // Apply font subsetting for better compression
      await this.optimizeFonts(pdfDoc);
      
      // Remove unused resources
      await this.removeUnusedResources(pdfDoc);
      
      // Optimize page content for better compression
      for (const page of pages) {
        this.optimizePageContent(page);
      }
      
    } catch (error) {
      // If optimization fails, continue without it
      console.warn('PDF optimization failed, proceeding with basic compression:', error);
    }
  }
  
  private async removeDuplicateResources(pdfDoc: PDFDocument): Promise<void> {
    try {
      // Remove all possible metadata to reduce file size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Note: Advanced metadata removal would require access to private methods
      // For now, we rely on the basic metadata removal provided by pdf-lib
      
    } catch (error) {
      console.warn('Resource optimization failed:', error);
    }
  }
  
  private async optimizeImages(pdfDoc: PDFDocument): Promise<void> {
    try {
      // Note: pdf-lib doesn't provide direct access to embedded images for optimization
      // This is a limitation of the library - images are already compressed when embedded
      // For better image compression, images should be optimized before embedding
      console.log('Image optimization: pdf-lib handles image compression during embedding');
    } catch (error) {
      console.warn('Image optimization failed:', error);
    }
  }

  private async optimizeFonts(pdfDoc: PDFDocument): Promise<void> {
    try {
      // Font subsetting is automatically handled by pdf-lib when fonts are embedded
      // We can ensure fonts are properly embedded for optimal compression
      const pages = pdfDoc.getPages();
      
      // Note: pdf-lib automatically subsets fonts when they are embedded
      // This means only the characters actually used in the document are included
      // This is one of the most effective compression techniques available
      
      console.log('Font optimization: pdf-lib automatically applies font subsetting');
      
    } catch (error) {
      console.warn('Font optimization failed:', error);
    }
  }

  private async removeUnusedResources(pdfDoc: PDFDocument): Promise<void> {
    try {
      // Remove unused form fields if any
      const form = pdfDoc.getForm();
      if (form) {
        // Clear form data to reduce size
        const fields = form.getFields();
        fields.forEach(field => {
          try {
            if (field.constructor.name === 'PDFTextField') {
              (field as any).setText('');
            }
          } catch (e) {
            // Ignore field clearing errors
          }
        });
      }
    } catch (error) {
      console.warn('Resource cleanup failed:', error);
    }
  }

  private optimizePageContent(page: any): void {
    try {
      // Basic page content optimization
      // pdf-lib handles most content optimization internally
      // We can optimize by removing unnecessary transformations
      
    } catch (error) {
      console.warn('Page content optimization failed:', error);
    }
  }

  private async applyRasterization(file: File, quality: number = 0.5, grayscale: boolean = false, scale: number = 1.0): Promise<{ buffer: Uint8Array; size: number }> {
    try {
      console.log(`Starting rasterization compression (quality: ${quality}, grayscale: ${grayscale}, scale: ${scale})...`);
      const arrayBuffer = await file.arrayBuffer();
      
      // Use react-pdf's pdfjs export to ensure compatibility and avoid webpack issues
      const { pdfjs } = await import('react-pdf');
      const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
      
      if (typeof window !== 'undefined') {
          pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      const getDocument = pdfjs.getDocument;
      if (!getDocument) {
          throw new Error('Could not find getDocument in pdfjs');
      }

      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      console.log(`PDF loaded. Pages: ${numPages}`);
      
      const newPdfDoc = await PDFDocument.create();
      
      for (let i = 1; i <= numPages; i++) {
        console.log(`Processing page ${i}/${numPages}`);
        const page = await pdf.getPage(i);
        
        // Get original dimensions to preserve page size
        const originalViewport = page.getViewport({ scale: 1.0 });
        
        // Get scaled viewport for rasterization (resolution control)
        const viewport = page.getViewport({ scale: scale }); 
        
        // Create canvas with environment check
        if (typeof document === 'undefined') {
           throw new Error('Rasterization requires a browser environment (DOM).');
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (!context) throw new Error('Could not get canvas context');

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Apply grayscale if requested
        if (grayscale) {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j];
                const g = data[j + 1];
                const b = data[j + 2];
                // Luminosity formula for grayscale
                const avg = 0.299 * r + 0.587 * g + 0.114 * b;
                data[j] = avg;     // R
                data[j + 1] = avg; // G
                data[j + 2] = avg; // B
            }
            context.putImageData(imageData, 0, 0);
        }

        // Convert to JPEG with high compression
        const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Efficient Base64 to Uint8Array conversion (avoids fetch)
        const base64 = imgDataUrl.split(',')[1];
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const imgBytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
            imgBytes[j] = binaryString.charCodeAt(j);
        }
        
        const embeddedImage = await newPdfDoc.embedJpg(imgBytes);
        
        // Create page with ORIGINAL dimensions
        const newPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
        
        // Draw the (potentially low-res) image stretched to fill the original page size
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });
        
        // Cleanup to save memory
        canvas.width = 0;
        canvas.height = 0;
      }
      
      const pdfBytes = await newPdfDoc.save();
      
      return { buffer: pdfBytes, size: pdfBytes.length };
      
    } catch (error) {
      console.error('Rasterization failed:', error);
      throw error;
    }
  }

  private async applyGrayscale(result: { buffer: Uint8Array; size: number }): Promise<{ buffer: Uint8Array; size: number }> {
    try {
        console.warn('Deprecated applyGrayscale called. Should use applyRasterization with grayscale=true instead.');
        // This method is now legacy as the overlay approach causes blank pages.
        // If it's called, we just return the original result to avoid breaking the file.
        return result;
    } catch (error) {
      console.warn('Grayscale application failed inside helper:', error);
      return result; // Return original if failed
    }
  }
}

// PDF Watermark
class PDFWatermark extends PDFProcessor {
  private watermarkType: 'text' | 'image';
  private watermarkText?: string;
  private watermarkImage?: File;
  private position: string;
  private opacity: number;
  private fontSize: number;
  private rotation: number;
  private color: string;
  
  constructor(options: ProcessingOptions & { 
    watermarkType?: 'text' | 'image';
    watermarkText?: string; 
    watermarkImage?: File;
    position?: string;
    watermarkPosition?: string; // Legacy
    opacity?: number;
    fontSize?: number;
    rotation?: number;
    color?: string;
  }) {
    super(options);
    this.watermarkType = options.watermarkType || 'text';
    this.watermarkText = options.watermarkText;
    this.watermarkImage = options.watermarkImage;
    this.position = options.position || options.watermarkPosition || 'center';
    this.opacity = options.opacity !== undefined ? options.opacity : 0.5;
    this.fontSize = options.fontSize || 50;
    this.rotation = options.rotation !== undefined ? options.rotation : 45;
    this.color = options.color || '#808080';
  }

  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const pdf = await this.loadPDF(file);
      const pages = pdf.getPages();
      
      let embeddedImage: any = null;
      let embeddedFont: any = null;

      if (this.watermarkType === 'image' && this.watermarkImage) {
         const imageBytes = await this.watermarkImage.arrayBuffer();
         if (this.watermarkImage.type === 'image/png') {
            embeddedImage = await pdf.embedPng(imageBytes);
         } else {
            embeddedImage = await pdf.embedJpg(imageBytes);
         }
      } else {
         embeddedFont = await pdf.embedFont(StandardFonts.Helvetica);
      }
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        let x: number, y: number;
        let contentWidth: number, contentHeight: number;

        if (this.watermarkType === 'image' && embeddedImage) {
            // Scale image if needed, maybe use fontSize as scale factor or fixed width?
            // Let's use fontSize as percentage of width for image width? Or just use image dims?
            // Tool uses fontSize 50 (default). 
            // Let's map fontSize to scale.
            const scale = this.fontSize / 100; 
            contentWidth = embeddedImage.width * scale;
            contentHeight = embeddedImage.height * scale;
        } else {
            // Text dimensions
            // Adjust font size relative to page? Or use absolute?
            // Tool passes generic number (e.g. 50).
            const fSize = this.fontSize; // Use raw size
            contentWidth = embeddedFont.widthOfTextAtSize(this.watermarkText || '', fSize);
            contentHeight = embeddedFont.heightAtSize(fSize);
        }
        
        // Calculate position
        switch (this.position) {
          case 'top-left':
            x = 50;
            y = height - 50 - contentHeight;
            break;
          case 'top-right':
            x = width - contentWidth - 50;
            y = height - 50 - contentHeight;
            break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-right':
            x = width - contentWidth - 50;
            y = 50;
            break;
          case 'top-center':
             x = (width - contentWidth) / 2;
             y = height - 50 - contentHeight;
             break;
          case 'bottom-center':
             x = (width - contentWidth) / 2;
             y = 50;
             break;
          default: // center
            x = (width - contentWidth) / 2;
            y = (height - contentHeight) / 2;
        }
        
        if (this.watermarkType === 'image' && embeddedImage) {
            page.drawImage(embeddedImage, {
                x,
                y,
                width: contentWidth,
                height: contentHeight,
                opacity: this.opacity,
                rotate: degrees(this.rotation)
            });
        } else if (this.watermarkText && embeddedFont) {
            const rgbColor = this.parseColor(this.options.color || '#000000');
            page.drawText(this.watermarkText, {
              x,
              y,
              size: this.fontSize,
              font: embeddedFont,
              color: rgbColor,
              opacity: this.opacity,
              rotate: degrees(this.rotation)
            });
        }
      }
      
      const filename = this.getOutputFilename(file.name, 'watermarked');
      return [await this.savePDF(pdf, filename)];
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to add watermark to PDF.',
        error
      );
    }
  }
}

// PDF Password Protector
class PDFPasswordProtector extends PDFProcessor {
  private userPassword?: string;
  private ownerPassword?: string;
  private permissions?: any;
  
  constructor(options: ProcessingOptions & { userPassword?: string; ownerPassword?: string; permissions?: any; password?: string }) {
    super(options);
    // Support both single 'password' field (legacy/simple) and separate user/owner passwords
    this.userPassword = options.userPassword || options.password;
    this.ownerPassword = options.ownerPassword || options.password;
    this.permissions = options.permissions || {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    };
  }

  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const pdf = await this.loadPDF(file);
      
      // Encrypt the document with the provided passwords
      if (!this.userPassword && !this.ownerPassword) {
         throw errorUtils.createError(
            'INVALID_INPUT',
            'Password is required for protection.'
         );
      }

      // PDF-lib v1.x does not support encryption natively.
      // A server-side or alternative solution is required.
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'PDF encryption is not supported in the current environment.'
      );
      /*
      await pdf.encrypt({
        userPassword: this.userPassword || '',
        ownerPassword: this.ownerPassword || '',
        permissions: this.permissions,
      });
      */
      
      const filename = this.getOutputFilename(file.name, 'protected');
      return [await this.savePDF(pdf, filename)];
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to protect PDF with password.',
        error
      );
    }
  }
}

// PDF to Word Converter
class PDFToWordConverter extends PDFProcessor {
  constructor(options: ProcessingOptions = {}) {
    super(options);
  }

  async process(file: File, conversionOptions?: any): Promise<ProcessedFile> {
    try {
      // Import required libraries dynamically
      const { 
        Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, 
        Table, TableRow, TableCell, WidthType, AlignmentType, 
        BorderStyle, Header, Footer, TextWrappingType, TextWrappingSide,
        VerticalAlign, VerticalMergeType
      } = await import('docx');
      
      // Import PDF.js dynamically
      const { pdfjs: pdfjsLib } = await import('react-pdf');
      const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
      
      // Import Tesseract for OCR if needed
      let Tesseract: any = null;
      if (conversionOptions?.ocrEnabled) {
        Tesseract = (await import('tesseract.js')).default;
      }
      
      // Set worker source
      if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const sections: any[] = [];
      
      let pagesToConvert: number[] = [];
      if (conversionOptions?.pageRange) {
          // parsePageRange returns 0-based indices
          const indices = this.parsePageRange(conversionOptions.pageRange, pdf.numPages);
          pagesToConvert = indices.map(i => i + 1); // Convert to 1-based
          
          if (pagesToConvert.length === 0) {
             // Fallback to all pages
             pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
          }
      } else {
          pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      }

      for (const pageNum of pagesToConvert) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better precision
        const { width: pageWidth, height: pageHeight } = viewport;
        
        // 1. Extract Items (Text and Images)
        let pageItems: any[] = [];
        
        // Check if OCR is needed (explicitly enabled or image-only page)
        let useOCR = conversionOptions?.ocrEnabled;
        
        if (!useOCR) {
            const textContent = await page.getTextContent();
            if (textContent.items.length < 10) {
                 // Heuristic: If fewer than 10 text items, assume it's an image/scan and try OCR
                 // But only if we can (Tesseract is available)
                 if (!Tesseract) {
                    Tesseract = (await import('tesseract.js')).default;
                 }
                 useOCR = true;
            } else {
                // Native Text Extraction
                pageItems = textContent.items.map((item: any) => {
                    const tx = item.transform;
                    // Transform to viewport coordinates
                    // pdf.js transform: [scaleX, skewY, skewX, scaleY, tx, ty]
                    // We need to apply viewport scaling
                    const x = tx[4] * 1.5; // Apply scale factor
                    const y = tx[5] * 1.5;
                    const docY = pageHeight - y; // Word uses Top-Left origin
                    
                    return {
                        type: 'text',
                        text: item.str,
                        x: x,
                        y: docY, // Use Word Y (from top)
                        width: item.width * 1.5,
                        height: item.height * 1.5,
                        fontName: item.fontName,
                        fontSize: Math.sqrt(tx[0]*tx[0] + tx[1]*tx[1]) * 1.5, // Approx font size
                        hasEOL: item.hasEOL
                    };
                }).filter((item: any) => item.text.trim().length > 0);
            }
        }
        
        if (useOCR) {
            // Render to canvas for OCR
            const canvas = document.createElement('canvas');
            canvas.width = pageWidth;
            canvas.height = pageHeight;
            const context = canvas.getContext('2d');
            
            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                const imageDataUrl = canvas.toDataURL('image/png');
                
                const result = await Tesseract.recognize(
                    imageDataUrl, 
                    conversionOptions?.language || 'eng'
                );
                
                // Map OCR words to items
                const ocrItems = result.data.words.map((word: any) => ({
                    type: 'text',
                    text: word.text,
                    x: word.bbox.x0,
                    y: word.bbox.y0,
                    width: word.bbox.x1 - word.bbox.x0,
                    height: word.bbox.y1 - word.bbox.y0,
                    fontName: 'OCR',
                    fontSize: word.bbox.y1 - word.bbox.y0, // Height as proxy for font size
                    confidence: word.confidence
                }));
                
                pageItems = [...pageItems, ...ocrItems];
            }
        }
        
        // Extract Images (Native)
        if (conversionOptions?.extractImages !== false) {
            try {
                const operatorList = await page.getOperatorList();
                const commonObjs = page.commonObjs;
                const objs = page.objs;
                
                let currentMatrix = [1, 0, 0, 1, 0, 0];
                const transformStack: any[] = [];
                
                for (let i = 0; i < operatorList.fnArray.length; i++) {
                    const fn = operatorList.fnArray[i];
                    const args = operatorList.argsArray[i];
                    
                    if (fn === pdfjsLib.OPS.save) {
                        transformStack.push([...currentMatrix]);
                    } else if (fn === pdfjsLib.OPS.restore) {
                        if (transformStack.length > 0) currentMatrix = transformStack.pop();
                    } else if (fn === pdfjsLib.OPS.transform) {
                        const m1 = currentMatrix;
                        const m2 = args;
                        currentMatrix = [
                            m1[0] * m2[0] + m1[1] * m2[2],
                            m1[0] * m2[1] + m1[1] * m2[3],
                            m1[2] * m2[0] + m1[3] * m2[2],
                            m1[2] * m2[1] + m1[3] * m2[3],
                            m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
                            m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
                        ];
                    } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === (pdfjsLib.OPS as any).paintJpegXObject || fn === (pdfjsLib.OPS as any).paintXObject) {
                        const imgName = args[0];
                        const imgData = await (objs.get(imgName) || commonObjs.get(imgName));
                        if (imgData) {
                            // Apply current transform + viewport scale
                            const scale = 1.5;
                            const x = currentMatrix[4] * scale;
                            const y = currentMatrix[5] * scale;
                            const w = Math.sqrt(currentMatrix[0] * currentMatrix[0] + currentMatrix[1] * currentMatrix[1]) * scale;
                            const h = Math.sqrt(currentMatrix[2] * currentMatrix[2] + currentMatrix[3] * currentMatrix[3]) * scale;
                            const docY = pageHeight - y - h; // Top-Left origin
                            
                            const imageBuffer = await this.convertImageToBuffer(imgData);
                            if (imageBuffer) {
                                pageItems.push({
                                    type: 'image',
                                    x, y: docY, width: w, height: h,
                                    data: imageBuffer
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Image extraction warning:', e);
            }
        }
        
        // 2. Layout Analysis
        
        // Sort items by Y, then X
        pageItems.sort((a, b) => {
            if (Math.abs(a.y - b.y) < 5) return a.x - b.x;
            return a.y - b.y;
        });
        
        // Identify Headers and Footers
        const headerThreshold = pageHeight * 0.1; // Top 10%
        const footerThreshold = pageHeight * 0.9; // Bottom 10%
        
        const headerItems = pageItems.filter(item => item.y < headerThreshold);
        const footerItems = pageItems.filter(item => item.y > footerThreshold);
        const bodyItems = pageItems.filter(item => item.y >= headerThreshold && item.y <= footerThreshold);
        
        // Generate content for each section using the same structure logic
        const headerChildren = this.generateSectionContent(
            headerItems, 
            Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, BorderStyle,
            VerticalMergeType, WidthType,
            conversionOptions
        );
        
        const footerChildren = this.generateSectionContent(
            footerItems, 
            Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, BorderStyle,
            VerticalMergeType, WidthType,
            conversionOptions
        );
        
        const bodyChildren = this.generateSectionContent(
            bodyItems, 
            Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, BorderStyle,
            VerticalMergeType, WidthType,
            conversionOptions
        );
        
        // Add Page Section
        sections.push({
            properties: {
                page: {
                    margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch
                    size: { width: pageWidth * 15, height: pageHeight * 15 }
                }
            },
            headers: {
                default: new Header({
                    children: headerChildren
                })
            },
            footers: {
                default: new Footer({
                    children: footerChildren
                })
            },
            children: bodyChildren
        });
      }
      
      const doc = new Document({
        creator: "UPSA DocHub",
        title: file.name,
        sections: sections
      });
      
      const blob = await Packer.toBlob(doc);
      const buffer = await blob.arrayBuffer();
      
      const outputFilename = `${file.name.replace(/\.pdf$/i, '')}_converted.docx`;
      
      return {
        id: Date.now().toString(),
        originalName: file.name,
        name: outputFilename,
        size: blob.size,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        data: Array.from(new Uint8Array(buffer)),
        blob,
        downloadUrl: URL.createObjectURL(blob),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-to-word-converter-pro'
      };
      
    } catch (error) {
      console.error('Error in PDFToWordConverter:', error);
      throw errorUtils.createError('PROCESSING_FAILED', 'Failed to convert PDF to Word.', error);
    }
  }

  private generateSectionContent(
    items: any[], 
    Paragraph: any, TextRun: any, ImageRun: any, Table: any, TableRow: any, TableCell: any, BorderStyle: any,
    VerticalMergeType: any, WidthType: any,
    options: any
  ): any[] {
    // Group Items into Lines/Blocks
    const blocks = this.groupItemsIntoLines(items, true);
    
    // Detect Tables only if preserveLayout is not explicitly false
    // Default to true if undefined
    const preserveLayout = options?.preserveLayout !== false;
    
    let structure = blocks;
    if (preserveLayout) {
        structure = this.detectStructure(blocks);
    }
    
    // Generate Children
    const children = [];
    
    for (const element of structure) {
        if (element.type === 'table') {
            children.push(this.createTable(element, Table, TableRow, TableCell, Paragraph, TextRun, ImageRun, BorderStyle, VerticalMergeType, WidthType, options));
        } else {
            children.push(this.createParagraph(element, Paragraph, TextRun, ImageRun, options));
        }
    }
    
    return children;
  }



  private createTable(element: any, Table: any, TableRow: any, TableCell: any, Paragraph: any, TextRun: any, ImageRun: any, BorderStyle: any, VerticalMergeType: any, WidthType: any, options: any): any {
        // 1. Analyze table structure using centralized method
        const { cells } = this.analyzeTableStructure(element.rows, element.columns || []);

        // Track active vertical merges: index -> { remainingRows, colSpan }
        const activeMerges: ({ remainingRows: number, colSpan: number } | null)[] = new Array(cells[0]?.length || 0).fill(null);

        // 3. Create Table Rows with Span Detection
        const tableRows = cells.map((row, rowIndex) => {
            const rowChildren: any[] = [];
            
            for (let cIdx = 0; cIdx < row.length; cIdx++) {
                const cellData = row[cIdx];
                
                // Check for active vertical merge
                if (activeMerges[cIdx]) {
                    const mergeInfo = activeMerges[cIdx]!;
                    
                    rowChildren.push(new TableCell({
                        children: [new Paragraph({})], // Empty for continued merge
                        verticalMerge: VerticalMergeType.CONTINUE,
                        columnSpan: mergeInfo.colSpan,
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                        }
                    }));
                    
                    // Decrement remaining rows
                    mergeInfo.remainingRows--;
                    if (mergeInfo.remainingRows <= 0) {
                        // Clear merge info for all columns in this span
                        for(let k=0; k<mergeInfo.colSpan; k++) {
                             activeMerges[cIdx + k] = null;
                        }
                    } else {
                         // Update remaining rows for other columns in this span (to keep them in sync, though we skip them)
                         for(let k=1; k<mergeInfo.colSpan; k++) {
                             if (activeMerges[cIdx + k]) {
                                 activeMerges[cIdx + k]!.remainingRows = mergeInfo.remainingRows;
                             }
                         }
                    }
                    
                    // Skip the columns covered by this merge's colSpan
                    cIdx += (mergeInfo.colSpan - 1);
                    continue;
                }
                
                // If not in a vertical merge, check if this cell is covered by a horizontal merge from the left.
                // analyzeTableStructure marks isCovered=true for both vertical and horizontal coverage.
                if (cellData.isCovered) {
                     continue;
                }
                
                // Start of a new cell
                const isVerticalMergeStart = cellData.rowSpan > 1;
                
                if (isVerticalMergeStart) {
                     // Register in activeMerges
                     for(let k=0; k<cellData.colSpan; k++) {
                         activeMerges[cIdx + k] = { 
                             remainingRows: cellData.rowSpan - 1, 
                             colSpan: cellData.colSpan 
                         };
                     }
                }
                
                // Create content
                const paragraphChildren = [];
                 for (const item of cellData.items) {
                    if (item.type === 'image') {
                        paragraphChildren.push(new ImageRun({
                            data: item.data,
                            transformation: { width: item.width, height: item.height }
                        }));
                    } else {
                        paragraphChildren.push(new TextRun({ 
                            text: item.text + " ", 
                            size: options?.maintainFormatting !== false ? Math.round(item.fontSize || 24) : 24,
                            font: options?.maintainFormatting !== false && item.fontName ? this.mapFont(item.fontName) : 'Calibri',
                            bold: options?.maintainFormatting !== false && item.fontName ? this.isBold(item.fontName) : false,
                            italics: options?.maintainFormatting !== false && item.fontName ? this.isItalic(item.fontName) : false
                        }));
                    }
                }
                
                rowChildren.push(new TableCell({
                    children: [
                        new Paragraph({
                            children: paragraphChildren
                        })
                    ],
                    columnSpan: cellData.colSpan,
                    verticalMerge: isVerticalMergeStart ? VerticalMergeType.RESTART : undefined,
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                    }
                }));
                
                // Skip columns covered by this cell's colSpan
                cIdx += (cellData.colSpan - 1);
            }
            
            return new TableRow({
                children: rowChildren
            });
        });

        return new Table({
            rows: tableRows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
            }
        });
    }

  private createParagraph(element: any, Paragraph: any, TextRun: any, ImageRun: any, options: any): any {
      element.items.sort((a: any, b: any) => a.x - b.x);
      
      const children = [];
      let lastX = 0; 
      
      const preserveLayout = options?.preserveLayout !== false;

      // Check for list markers
      let bullet: any = undefined;
      // Only check the first text item
      const firstTextIndex = element.items.findIndex((i: any) => i.type === 'text');
      if (firstTextIndex !== -1) {
          const firstItem = element.items[firstTextIndex];
          const text = firstItem.text.trim();
          
          // Bullet points: •, -, *
          if (/^[•\-\*]$/.test(text) || /^[•\-\*]\s/.test(text)) {
             bullet = { level: 0 };
             // Strip the bullet char, accounting for potential leading spaces in original text
             element.items[firstTextIndex].text = firstItem.text.replace(/^\s*[•\-\*]\s?/, '');
          }
          // Numbered lists: 1., 1), a., a)
          // We won't try to reconstruct the numbering sequence logic for now, 
          // just treat them as bullets or leave them as text.
          // Treating them as text is safer to avoid breaking references.
      }

      // Calculate indent only if preserving layout AND not a list (lists handle their own indent)
      const firstItem = element.items[0];
      const indent = (preserveLayout && !bullet) ? Math.round(firstItem.x * 10) : undefined; 
      
      for (const item of element.items) {
          if (item.type === 'image') {
              children.push(new ImageRun({
                  data: item.data,
                  transformation: { width: item.width, height: item.height }
              }));
          } else {
             // Add tabs/spaces for gaps if we are trying to preserve layout
             if (preserveLayout && lastX > 0 && item.x - lastX > 20) {
                 children.push(new TextRun({ text: "\t" }));
             }
             
             children.push(new TextRun({ 
                 text: item.text,
                 size: options?.maintainFormatting !== false ? Math.round((item.fontSize || 12) * 2) : 24, // Half-points
                 font: options?.maintainFormatting !== false && item.fontName ? this.mapFont(item.fontName) : 'Calibri',
                 bold: options?.maintainFormatting !== false && item.fontName ? this.isBold(item.fontName) : false,
                 italics: options?.maintainFormatting !== false && item.fontName ? this.isItalic(item.fontName) : false
             }));
          }
          lastX = item.x + item.width;
      }
      
      return new Paragraph({
          children: children,
          indent: indent ? { left: indent } : undefined,
          spacing: { after: 120 },
          bullet: bullet
      });
  }
  
  private createSimpleParagraph(items: any[], Paragraph: any, TextRun: any): any {
      return new Paragraph({
          children: items.map((item: any) => new TextRun({ text: item.text + " " }))
      });
  }
}

// PDF Signature Processor
class PDFSignatureProcessor extends PDFProcessor {
  private signatureData: any;
  private position: { x: number; y: number };

  constructor(options: ProcessingOptions & { signature: any; position: { x: number; y: number } }) {
    super(options);
    this.signatureData = options.signature;
    this.position = options.position || { x: 50, y: 80 };
  }

  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const pdfDoc = await this.loadPDF(file);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Convert percentage position to actual coordinates
      const x = (this.position.x / 100) * width;
      const y = height - (this.position.y / 100) * height; // PDF coordinates are bottom-up

      if (this.signatureData.type === 'draw') {
        // Handle canvas signature
        if (this.signatureData.canvas) {
          // Extract base64 data from canvas data URL
          const base64Data = this.signatureData.canvas.split(',')[1];
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          try {
            const image = await pdfDoc.embedPng(imageBytes);
            const scaledDims = image.scale(0.5); // Scale down the signature
            firstPage.drawImage(image, {
              x: x - scaledDims.width / 2,
              y: y - scaledDims.height / 2,
              width: scaledDims.width,
              height: scaledDims.height,
            });
          } catch (pngError) {
            // Try as JPEG if PNG fails
            try {
              const image = await pdfDoc.embedJpg(imageBytes);
              const scaledDims = image.scale(0.5);
              firstPage.drawImage(image, {
                x: x - scaledDims.width / 2,
                y: y - scaledDims.height / 2,
                width: scaledDims.width,
                height: scaledDims.height,
              });
            } catch (jpgError) {
              console.error('Failed to embed signature image:', jpgError);
              throw new Error('Failed to process signature image');
            }
          }
        }
      } else if (this.signatureData.type === 'type') {
        // Handle text signature
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = this.signatureData.size || 24;
        const color = this.parseColor(this.signatureData.color || '#000000');
        
        firstPage.drawText(this.signatureData.text, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: color,
        });
      } else if (this.signatureData.type === 'upload') {
        // Handle uploaded image signature
        if (this.signatureData.image) {
          const imageBytes = await this.signatureData.image.arrayBuffer();
          const uint8Array = new Uint8Array(imageBytes);
          
          try {
            let image;
            if (this.signatureData.image.type.includes('png')) {
              image = await pdfDoc.embedPng(uint8Array);
            } else {
              image = await pdfDoc.embedJpg(uint8Array);
            }
            
            const scaledDims = image.scale(0.3); // Scale down uploaded images
            firstPage.drawImage(image, {
              x: x - scaledDims.width / 2,
              y: y - scaledDims.height / 2,
              width: scaledDims.width,
              height: scaledDims.height,
            });
          } catch (imageError) {
            console.error('Failed to embed uploaded signature:', imageError);
            throw new Error('Failed to process uploaded signature image');
          }
        }
      }

      return [await this.savePDF(pdfDoc, this.getOutputFilename(file.name, 'signed'))];
    } catch (error) {
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to add signature to PDF.',
        error
      );
    }
    }
  }

  class PDFToImagesConverter extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile[]> {
    try {
      // Import PDF.js dynamically via react-pdf
      const { pdfjs: pdfjsLib } = await import('react-pdf');
      
      // Set up worker
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      const getDocument = pdfjsLib.getDocument;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const results: ProcessedFile[] = [];
      
      // Extract options from this.options
      const {
        outputFormat = 'png',
        quality = 'high',
        pageRange = 'all',
        startPage,
        endPage,
        specificPages
      } = this.options;
      
      const resolution = 300; // Default resolution for image conversion
      
      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      
      if (pageRange === 'all') {
        pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else if (pageRange === 'range' && startPage && endPage) {
        for (let i = startPage; i <= Math.min(endPage, pdf.numPages); i++) {
          pagesToConvert.push(i);
        }
      } else if (pageRange === 'specific' && specificPages) {
        // Use specific pages array directly
        pagesToConvert = specificPages.filter(page => page > 0 && page <= pdf.numPages);
        // Remove duplicates and sort
        pagesToConvert = [...new Set(pagesToConvert)].sort((a, b) => a - b);
      }
      
      // Set scale based on quality
      let scale = 1.0;
      switch (quality) {
        case 'high':
          scale = 2.0;
          break;
        case 'medium':
          scale = 1.5;
          break;
        case 'low':
          scale = 1.0;
          break;
      }
      
      // Convert each page to image
      for (const pageNum of pagesToConvert) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Check if we're in a browser environment
        if (typeof document === 'undefined') {
          throw errorUtils.createError(
            'PROCESSING_FAILED',
            'PDF to images conversion is only supported in browser environment.'
          );
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
            
          }).promise;
          
          // Convert canvas to blob
          const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : 'image/png';
          const qualityValue = quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.6;
          
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), mimeType, qualityValue);
          });
          
          const baseFilename = file.name.replace(/\.pdf$/i, '');
          const extension = outputFormat === 'jpg' ? 'jpg' : 'png';
          const filename = `${baseFilename}_page_${pageNum.toString().padStart(3, '0')}.${extension}`;
          
          results.push({
            id: `${Date.now()}-${pageNum}`,
            originalName: file.name,
            name: filename,
            size: blob.size,
            type: mimeType,
            blob,
            downloadUrl: URL.createObjectURL(blob),
            data: Array.from(new Uint8Array(await blob.arrayBuffer())),
            processedAt: new Date().toISOString(),
            toolUsed: 'pdf'
          });
        }
      }
      
      if (this.options.asZip && results.length > 0) {
        const zip = new JSZip();
        
        results.forEach(result => {
          if (result.blob) {
            zip.file(result.name, result.blob);
          }
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        
        return [{
          id: `zip_${Date.now()}`,
          name: `${baseName}_images.zip`,
          originalName: file.name,
          size: zipBlob.size,
          type: 'application/zip',
          data: [], 
          processedAt: new Date().toISOString(),
          toolUsed: 'pdf-to-images',
          blob: zipBlob,
          downloadUrl: URL.createObjectURL(zipBlob)
        }];
      }

      return results;
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to convert PDF to images.',
        error
      );
    }
  }
}

// PDF Info Extractor
class PDFInfoExtractor {
  static async extractInfo(file: File): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pages: PDFPageInfo[];
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pageCount = pdf.getPageCount();
      const pages: PDFPageInfo[] = [];
      
      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle;
        
        pages.push({
          pageNumber: i + 1,
          width,
          height,
          rotation
        });
      }
      
      return {
        pageCount,
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        subject: pdf.getSubject(),
        creator: pdf.getCreator(),
        producer: pdf.getProducer(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
        pages
      };
    } catch (error) {
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to extract PDF information.',
        error
      );
    }
  }
}

// PDF Rotate Processor
class PDFRotateProcessor extends PDFProcessor {
  private angle: number;
  private applyToAllPages: boolean;
  private specificPages: string;

  constructor(options: ProcessingOptions & { angle?: number; applyToAllPages?: boolean; specificPages?: string }) {
    super(options);
    this.angle = options.angle || 90;
    this.applyToAllPages = options.applyToAllPages ?? true;
    this.specificPages = options.specificPages || '';
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const pdf = await this.loadPDF(file);
      const pages = pdf.getPages();
      const pageCount = pages.length;

      let pagesToRotate: number[] = [];

      if (this.applyToAllPages) {
        pagesToRotate = Array.from({ length: pageCount }, (_, i) => i);
      } else if (this.specificPages) {
        // Parse specific pages (e.g., "1,3,5-7")
        const ranges = this.specificPages.split(',');
        for (const range of ranges) {
          const trimmed = range.trim();
          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()) - 1);
            for (let i = start; i <= end; i++) {
              if (i >= 0 && i < pageCount) pagesToRotate.push(i);
            }
          } else {
            const page = parseInt(trimmed) - 1;
            if (page >= 0 && page < pageCount) pagesToRotate.push(page);
          }
        }
      }

      pagesToRotate.forEach(index => {
        const page = pages[index];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + this.angle));
      });

      const filename = this.getOutputFilename(file.name, 'rotated');
      return await this.savePDF(pdf, filename);
    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to rotate PDF pages.',
        error
      );
    }
  }

  protected getOutputFilename(originalName: string, suffix: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${suffix}.pdf`;
  }
}

// Word to PDF Processor
class WordToPDFProcessor extends PDFProcessor {
  constructor(options: ProcessingOptions = {}) {
    super(options);
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract raw text from Word document
      // Note: This uses mammoth to extract text. For better results with formatting,
      // we would need a more complex HTML-to-PDF conversion which is heavy for client-side.
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      const text = result.value;

      if (!text) {
        throw new Error('No text content found in Word document');
      }

      // Create PDF using jsPDF for better text handling
      const doc = new jsPDF();
      
      // Set font
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      // Add title from filename
      const title = file.name.replace(/\.[^/.]+$/, '');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title, 15, 20);
      
      // Reset font for body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      
      const splitText = doc.splitTextToSize(text, maxWidth);
      
      let y = 35; // Start after title
      const lineHeight = 6;
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
          // Add page number to previous page? (jsPDF adds to current page)
        }
        doc.text(splitText[i], margin, y);
        y += lineHeight;
      }
      
      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      const pdfBytes = doc.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = this.getOutputFilename(file.name, 'converted');

      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        originalName: file.name,
        size: blob.size,
        type: 'application/pdf',
        data: Array.from(new Uint8Array(pdfBytes)),
        processedAt: new Date().toISOString(),
        toolUsed: 'word-to-pdf',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      };

    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to convert Word to PDF.',
        error
      );
    }
  }
}

// PDF Unlock Processor
class PDFUnlockProcessor extends PDFProcessor {
  private password?: string;

  constructor(options: ProcessingOptions & { password?: string }) {
    super(options);
    this.password = options.password;
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdf: PDFDocument;

      try {
        // Try loading with password if provided
        if (this.password) {
          pdf = await PDFDocument.load(arrayBuffer, { password: this.password } as any);
        } else {
          pdf = await PDFDocument.load(arrayBuffer);
        }
      } catch (loadError) {
        // If loading fails, it might be because of incorrect password
        throw errorUtils.createError(
          'INVALID_PASSWORD',
          'Failed to unlock PDF. Please check if the password is correct.',
          loadError
        );
      }

      // Saving without options removes the encryption
      const filename = this.getOutputFilename(file.name, 'unlocked');
      return await this.savePDF(pdf, filename);

    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to unlock PDF file.',
        error
      );
    }
  }

  protected getOutputFilename(originalName: string, suffix: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${suffix}.pdf`;
  }
}

// PDF Repair Processor
class RepairPDFProcessor extends PDFProcessor {
  private repairMode: 'basic' | 'advanced' | 'aggressive';
  private fixCorruption: boolean;
  private rebuildStructure: boolean;
  private optimizeAfterRepair: boolean;
  private removeInvalidObjects: boolean;

  constructor(options: ProcessingOptions & { 
    repairMode?: 'basic' | 'advanced' | 'aggressive';
    fixCorruption?: boolean;
    rebuildStructure?: boolean;
    optimizeAfterRepair?: boolean;
    removeInvalidObjects?: boolean;
  }) {
    super(options);
    this.repairMode = options.repairMode || 'basic';
    this.fixCorruption = options.fixCorruption !== undefined ? options.fixCorruption : true;
    this.rebuildStructure = options.rebuildStructure || false;
    this.optimizeAfterRepair = options.optimizeAfterRepair || true;
    this.removeInvalidObjects = options.removeInvalidObjects || true;
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdf: PDFDocument;

      // Basic repair: Just load and save (rebuilds XREF)
      // Advanced/Aggressive: Rebuild structure by copying pages
      
      const shouldRebuild = this.repairMode === 'advanced' || this.repairMode === 'aggressive' || this.rebuildStructure;

      try {
        // Attempt to load with error tolerance if possible
        // pdf-lib's load method is generally robust
        pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch (loadError) {
        throw errorUtils.createError(
          'CORRUPTED_FILE',
          'Failed to load PDF file for repair. The file may be too severely damaged.',
          loadError
        );
      }

      if (shouldRebuild) {
        // Create a new document and copy pages to it to rebuild structure
        const newPdf = await PDFDocument.create();
        const pageCount = pdf.getPageCount();
        
        // Copy all pages
        const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
        if (pageIndices.length > 0) {
          const copiedPages = await newPdf.copyPages(pdf, pageIndices);
          copiedPages.forEach(page => newPdf.addPage(page));
        }
        
        pdf = newPdf;
      }

      // Optimization handled by save (reconstructs file)
      const filename = this.getOutputFilename(file.name, 'repaired');
      return await this.savePDF(pdf, filename);

    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to repair PDF file.',
        error
      );
    }
  }

  protected getOutputFilename(originalName: string, suffix: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_${suffix}.pdf`;
  }
}

// Image to PDF Processor
class ImageToPDFProcessor {
  constructor(private options: ProcessingOptions = {}) {}

  async process(files: File[]): Promise<ProcessedFile[]> {
    if (files.length === 0) {
      throw errorUtils.createError('INVALID_INPUT', 'No image files provided');
    }

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;
        
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (fileName.endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
           // Try to detect type or fallback
           try {
             image = await pdfDoc.embedJpg(imageBytes);
           } catch (e) {
             try {
                image = await pdfDoc.embedPng(imageBytes);
             } catch (e2) {
                console.warn(`Skipping unsupported image: ${file.name}`);
                continue;
             }
           }
        }

        if (image) {
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
        }
      }
      
      if (pdfDoc.getPageCount() === 0) {
         throw errorUtils.createError('PROCESSING_FAILED', 'No valid images could be converted');
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      return [{
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'converted_images.pdf',
        originalName: 'images.pdf',
        size: blob.size,
        type: 'application/pdf',
        data: Array.from(new Uint8Array(pdfBytes)),
        processedAt: new Date().toISOString(),
        toolUsed: 'images-to-pdf',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      }];

    } catch (error: any) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to convert images to PDF.',
        error
      );
    }
  }
}

// PDF to Excel Converter
class PDFToExcelConverter extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile> {
    try {
      // Import PDF.js dynamically
      const { pdfjs } = await import('react-pdf');
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      const getDocument = pdfjs.getDocument;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      
      const workbook = XLSX.utils.book_new();
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Extract items with position
        const items = textContent.items.map((item: any) => ({
          text: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5], // PDF coordinates are bottom-up
          width: item.width,
          height: item.height,
          hasEOL: item.hasEOL
        })).filter((item: any) => item.text.trim().length > 0);
        
        // Group items into lines
        const lines = this.groupItemsIntoLines(items);
        
        // Detect structure (tables vs text)
        const structure = this.detectStructure(lines);
        
        // Convert structure to sheet data
        const sheetData: any[][] = [];
        const pageMerges: any[] = [];
        
        structure.forEach((element: any) => {
            if (element.type === 'table') {
                // Analyze table structure using centralized method
                const { cells } = this.analyzeTableStructure(element.rows, element.columns || []);
                
                // Adjust merge rows to match sheet position
                const startRow = sheetData.length;
                
                cells.forEach((rowCells, rIdx) => {
                    const rowData: string[] = [];
                    rowCells.forEach((cell, cIdx) => {
                        rowData.push(cell.text);
                        
                        if (!cell.isCovered && (cell.rowSpan > 1 || cell.colSpan > 1)) {
                            pageMerges.push({
                                s: { r: startRow + rIdx, c: cIdx },
                                e: { r: startRow + rIdx + cell.rowSpan - 1, c: cIdx + cell.colSpan - 1 }
                            });
                        }
                    });
                    sheetData.push(rowData);
                });
                
                // Add empty row after table
                sheetData.push([]);
            } else {
                // Regular text line
                const text = element.items.map((i: any) => i.text).join(' ');
                sheetData.push([text]);
            }
        });
        
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        if (pageMerges.length > 0) {
            worksheet['!merges'] = pageMerges;
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i}`);
      }
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      // Fix: output filename should have .xlsx extension
      const filename = this.getOutputFilename(file.name, 'converted').replace(/\.pdf$/, '.xlsx');
      
      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        originalName: file.name,
        size: blob.size,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: Array.from(new Uint8Array(excelBuffer)),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-to-excel',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      };
      
    } catch (error: any) {
       throw errorUtils.createError('PROCESSING_FAILED', 'Failed to convert PDF to Excel', error);
    }
  }
}

// PDF to PowerPoint Converter
class PDFToPPTConverter extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile> {
    try {
      // Import PDF.js dynamically
      const { pdfjs } = await import('react-pdf');
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      const getDocument = pdfjs.getDocument;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;
        
        const slide = pptx.addSlide();

        // 1. Extract and Add Images
        if (this.options.extractImages !== false) {
            try {
                const operatorList = await page.getOperatorList();
                const commonObjs = page.commonObjs;
                const objs = page.objs;
                
                let currentMatrix = [1, 0, 0, 1, 0, 0];
                const transformStack: any[] = [];
                
                for (let opIdx = 0; opIdx < operatorList.fnArray.length; opIdx++) {
                    const fn = operatorList.fnArray[opIdx];
                    const args = operatorList.argsArray[opIdx];
                    
                    if (fn === pdfjs.OPS.save) {
                        transformStack.push([...currentMatrix]);
                    } else if (fn === pdfjs.OPS.restore) {
                        if (transformStack.length > 0) currentMatrix = transformStack.pop();
                    } else if (fn === pdfjs.OPS.transform) {
                        const m1 = currentMatrix;
                        const m2 = args;
                        currentMatrix = [
                            m1[0] * m2[0] + m1[1] * m2[2],
                            m1[0] * m2[1] + m1[1] * m2[3],
                            m1[2] * m2[0] + m1[3] * m2[2],
                            m1[2] * m2[1] + m1[3] * m2[3],
                            m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
                            m1[4] * m2[1] + m1[5] * m2[3] + m2[5]
                        ];
                    } else if (fn === pdfjs.OPS.paintImageXObject || fn === (pdfjs.OPS as any).paintJpegXObject || fn === (pdfjs.OPS as any).paintXObject) {
                        const imgName = args[0];
                        const imgData = await (objs.get(imgName) || commonObjs.get(imgName));
                        if (imgData) {
                            const w = Math.sqrt(currentMatrix[0] * currentMatrix[0] + currentMatrix[1] * currentMatrix[1]);
                            const h = Math.sqrt(currentMatrix[2] * currentMatrix[2] + currentMatrix[3] * currentMatrix[3]);
                            const x = currentMatrix[4];
                            const y = currentMatrix[5];
                            
                            // PDF coords (bottom-up) to PPT coords (top-down)
                            const pptX = x / 72;
                            const pptY = (pageHeight - (y + h)) / 72;
                            const pptW = w / 72;
                            const pptH = h / 72;

                            const imageBuffer = await this.convertImageToBuffer(imgData);
                            if (imageBuffer) {
                                const base64 = this.arrayBufferToBase64(imageBuffer);
                                slide.addImage({
                                    data: `image/png;base64,${base64}`,
                                    x: Math.max(0, pptX),
                                    y: Math.max(0, pptY),
                                    w: pptW,
                                    h: pptH
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Error extracting images for PPT:', e);
            }
        }
        
        // 2. Extract and Add Text with Table Detection
        const textContent = await page.getTextContent();
        
        // Extract items with position
        const items = textContent.items.map((item: any) => ({
          text: item.str,
          x: item.transform[4],
          y: viewport.height - item.transform[5], // PDF coordinates are bottom-up, convert to top-down
          width: item.width,
          height: item.height,
          transform: item.transform,
          hasEOL: item.hasEOL
        })).filter((item: any) => item.text.trim().length > 0);
        
        // Group items into lines
        const lines = this.groupItemsIntoLines(items, true);
        
        // Detect Tables
        const structure = this.detectStructure(lines);
        
        // Render Structure
        for (const element of structure) {
            if (element.type === 'table') {
                this.renderTableToSlide(slide, element);
            } else {
                // Render as text line
                const x = element.x / 72;
                const y = element.y / 72;
                const w = Math.max(1, element.width / 72);
                const h = Math.max(0.2, element.height / 72);
                
                const transform = element.items[0].transform;
                const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
                
                slide.addText(element.text, {
                    x: x, 
                    y: y, 
                    w: w, 
                    h: h,
                    fontSize: Math.round(fontSize) || 11,
                    color: '000000'
                });
            }
        }
      }
      
      const blob = await pptx.write({ outputType: 'blob' }) as Blob;
      const filename = this.getOutputFilename(file.name, 'converted').replace(/\.pdf$/, '.pptx');
      
      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: filename,
        originalName: file.name,
        size: blob.size,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        data: [], 
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-to-ppt',
        blob,
        downloadUrl: URL.createObjectURL(blob)
      };
      
    } catch (error: any) {
       throw errorUtils.createError('PROCESSING_FAILED', 'Failed to convert PDF to PowerPoint', error);
    }
  }

  // --- Table Recognition Helpers ---

  private renderTableToSlide(slide: any, tableElement: any) {
      // 1. Sort and Filter Columns
      let columnXs = tableElement.columns
            .map((c: any) => c.x)
            .sort((a: number, b: number) => a - b);
      // Filter close columns
      columnXs = columnXs.filter((x: number, i: number) => i === 0 || x - columnXs[i-1] > 10);
      
      if (columnXs.length === 0) columnXs = [tableElement.rows[0]?.x || 0];

      // Create column objects for getConsolidatedRows
      const columns = columnXs.map((x: number) => ({ x, width: 0 }));

      // 2. Analyze Table Structure
      const { cells } = this.analyzeTableStructure(tableElement.rows, columns);
      
      const pptRows: any[] = [];
      
      cells.forEach((rowCells) => {
          const rowData: any[] = [];
          rowCells.forEach((cell) => {
              if (cell.isCovered) return;

              const cellOptions: any = { fontSize: 10, breakLine: true, valign: 'top' };
              if (cell.rowSpan > 1) cellOptions.rowspan = cell.rowSpan;
              if (cell.colSpan > 1) cellOptions.colspan = cell.colSpan;
              
              rowData.push({ text: cell.text, options: cellOptions });
          });
          pptRows.push(rowData);
      });

      // 3. Calculate Column Widths
      const colWidths: number[] = [];
      for (let i = 0; i < columnXs.length; i++) {
          let nextX = (i < columnXs.length - 1) ? columnXs[i+1] : (columnXs[i] + 100);
          if (i === columnXs.length - 1) {
             const lastRow = tableElement.rows[tableElement.rows.length - 1];
             if (lastRow) {
                 const lastItem = lastRow.items[lastRow.items.length - 1];
                 if (lastItem) nextX = Math.max(nextX, lastItem.x + lastItem.width);
             }
          }
          colWidths.push(Math.max(0.5, (nextX - columnXs[i]) / 72));
      }

      const tableX = columnXs[0] / 72;
      const tableY = tableElement.rows[0].y / 72;
      
      slide.addTable(pptRows, {
          x: tableX,
          y: tableY,
          colW: colWidths,
          fontSize: 10,
          border: { pt: 1, color: 'E0E0E0' },
          autoPage: true // Handle page overflow if needed
      });
  }
}

// Export all processors
export {
  PDFProcessor,
  PDFMerger,
  PDFSplitter,
  PDFPageExtractor,
  PDFCompressor,
  PDFWatermark,
  PDFPasswordProtector,
  PDFToWordConverter,
  PDFToExcelConverter,
  PDFToPPTConverter,
  PDFToImagesConverter,
  PDFSignatureProcessor,
  PDFInfoExtractor,
  PDFRotateProcessor,
  ImageToPDFProcessor,
  PDFUnlockProcessor,
  RepairPDFProcessor,
  WordToPDFProcessor
};

// Factory function to create processors
export function createPDFProcessor(
  type: string,
  options: ProcessingOptions = {}
): any {
  if (!type) {
    return null;
  }
  
  try {
    switch (type) {
      case 'merge':
      case 'pdf-merge':
        return new PDFMerger(options);
      case 'split':
      case 'pdf-split':
        return new PDFSplitter(options);
      case 'extract':
      case 'pdf-extract':
        try {
          const extractor = new PDFPageExtractor(options as any);
          return extractor;
        } catch (extractorError) {
          console.error('Error in PDFPageExtractor constructor:', extractorError);
          throw extractorError;
        }
      case 'compress':
      case 'pdf-compress':
        return new PDFCompressor(options);
      case 'watermark':
      case 'pdf-watermark':
        return new PDFWatermark(options as any);
      case 'protect':
      case 'pdf-protect':
        return new PDFPasswordProtector(options as any);
      case 'convert':
      case 'pdf-to-images':
        // PDF to images conversion requires browser environment
        if (typeof document === 'undefined') {
          throw errorUtils.createError(
            'PROCESSING_FAILED',
            'PDF to images conversion is only supported in browser environment. Please use client-side processing.'
          );
        }
        return new PDFToImagesConverter(options);

      case 'pdf-to-word':
      case 'to-word':
        return new PDFToWordConverter(options);
      case 'pdf-to-excel':
      case 'to-excel':
        return new PDFToExcelConverter(options);
      case 'pdf-to-ppt':
      case 'to-ppt':
        return new PDFToPPTConverter(options);
      case 'word-to-pdf':
        return new WordToPDFProcessor(options);
      case 'pdf-ocr':
        // OCR text extraction is handled client-side only
        throw errorUtils.createError(
          'PROCESSING_FAILED',
          'OCR text extraction is handled client-side and should not use server-side processing. Please use the client-side OCR tool.'
        );
      case 'add-signature':
        return new PDFSignatureProcessor(options as any);
      case 'pdf-rotate':
      case 'rotate':
        return new PDFRotateProcessor(options as any);
      case 'images-to-pdf':
        return new ImageToPDFProcessor(options);
      case 'repair':
      case 'pdf-repair':
        return new RepairPDFProcessor(options as any);
      case 'pdf-unlock':
      case 'unlock':
        return new PDFUnlockProcessor(options as any);

      default:
        throw errorUtils.createError(
          'INVALID_PROCESSOR',
          `Unknown PDF processor type: ${type}`
        );
    }
  } catch (error) {
    console.error('Error in createPDFProcessor:', error);
    throw error;
  }
}
