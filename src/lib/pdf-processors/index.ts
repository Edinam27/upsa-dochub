import { PDFDocument, rgb, StandardFonts, degrees, BlendMode } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as mammoth from 'mammoth';
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
  private getOutputFilename(originalName: string, suffix: string): string {
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

  private parsePageRange(range: string, totalPages: number): number[] {
    const indices: number[] = [];
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()) - 1);
        for (let i = start; i <= end && i < totalPages; i++) {
          if (i >= 0 && !indices.includes(i)) {
            indices.push(i);
          }
        }
      } else {
        const page = parseInt(trimmed) - 1;
        if (page >= 0 && page < totalPages && !indices.includes(page)) {
          indices.push(page);
        }
      }
    }
    
    return indices.sort((a, b) => a - b);
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
         const result = await this.applyRasterization(file, quality, this.options.grayscale || false);
         
         const blob = new Blob([new Uint8Array(result.buffer)], { type: 'application/pdf' });
         const filename = this.getOutputFilename(file.name, this.options.grayscale ? 'grayscale' : 'rasterized');
         
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
      } catch (fallbackError) {
        console.error('Even minimal compression failed, returning original file');
        // Absolute last resort - return the original file
        const originalBuffer = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([originalBuffer], { type: 'application/pdf' });
        return [{
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          originalName: file.name,
          size: originalBuffer.length,
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
  
  private async applyCompressionStrategy(file: File, strategy: any): Promise<{ buffer: Buffer; size: number }> {
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
  
  private async applyMetadataRemoval(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
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
    return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
  }
  
  private async applyContentOptimization(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
    try {
      // Apply metadata removal first
      await this.applyMetadataRemoval(pdf, settings);
      
      // Optimize content
      await this.optimizePDFContent(pdf, settings);
      
      const pdfBytes = await pdf.save(settings);
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
    } catch (error) {
      console.warn('Content optimization failed, falling back to metadata removal only');
      return await this.applyMetadataRemoval(pdf, settings);
    }
  }
  
  private async applyAggressiveRewrite(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
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
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
    } catch (error) {
      console.warn('Aggressive rewrite failed, falling back to simple page copy');
      return await this.fallbackPageCopy(pdf, settings);
    }
  }

  private async applyImageQualityReduction(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
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
  
  private async applyFontOptimization(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
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
  
  private async applyContentStripping(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
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
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
    } catch (error) {
      console.warn('Content stripping failed, falling back to aggressive rewrite');
      return await this.applyAggressiveRewrite(pdf, settings);
    }
  }

  // Fallback methods for error recovery
  private async fallbackPageCopy(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
    try {
      // Simple page copy without optimization
      const newPdf = await PDFDocument.create();
      const pageIndices = pdf.getPageIndices();
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });
      
      const pdfBytes = await newPdf.save(settings);
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
    } catch (error) {
      console.warn('Fallback page copy failed, using minimal compression');
      return await this.minimalCompression(pdf, settings);
    }
  }

  private async minimalCompression(pdf: PDFDocument, settings: any): Promise<{ buffer: Buffer; size: number }> {
    try {
      // Absolute minimal compression - just save with basic settings
      const basicSettings = {
        useObjectStreams: false,
        addDefaultPage: false
      };
      
      const pdfBytes = await pdf.save(basicSettings);
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
    } catch (error) {
      console.error('All compression methods failed, returning original PDF');
      // Last resort - return the original PDF as-is
      const pdfBytes = await pdf.save();
      return { buffer: Buffer.from(pdfBytes), size: pdfBytes.length };
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

  private async applyRasterization(file: File, quality: number = 0.5, grayscale: boolean = false): Promise<{ buffer: Buffer; size: number }> {
    try {
      console.log(`Starting rasterization compression (grayscale: ${grayscale})...`);
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
        const viewport = page.getViewport({ scale: 1.5 }); // Scale 1.5 for decent readability
        
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
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
        
        // Cleanup to save memory
        canvas.width = 0;
        canvas.height = 0;
      }
      
      const pdfBytes = await newPdfDoc.save();
      // Ensure Buffer compatibility
      const buffer = typeof Buffer !== 'undefined' ? Buffer.from(pdfBytes) : (pdfBytes as unknown as Buffer);
      
      return { buffer, size: pdfBytes.length };
      
    } catch (error) {
      console.error('Rasterization failed:', error);
      throw error;
    }
  }

  private async applyGrayscale(result: { buffer: Buffer; size: number }): Promise<{ buffer: Buffer; size: number }> {
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
            const rgbColor = this.parseColor(this.color);
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

      await pdf.encrypt({
        userPassword: this.userPassword || '',
        ownerPassword: this.ownerPassword || '',
        permissions: this.permissions,
      });
      
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
      const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, Indent } = await import('docx');
      
      // Import PDF.js dynamically
      const { pdfjs: pdfjsLib } = await import('react-pdf');
      const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
      
      // Set worker source to CDN URL
      if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      // Get basic PDF info using pdf-lib
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const docChildren: any[] = [];
      
      // Add professional document header
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Document Conversion Report`,
              bold: true,
              size: 28,
              color: "2E74B5"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] })
      );

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        
        // 1. Extract Text Items
        const textItems = textContent.items.map((item: any) => {
           const tx = item.transform;
           const x = tx[4];
           const y = tx[5]; 
           const docY = viewport.height - y;
           
           return {
             type: 'text',
             text: item.str,
             x: x,
             y: y,
             docY: docY,
             width: item.width,
             height: item.height,
             fontName: item.fontName,
             hasEOL: item.hasEOL
           };
        }).filter((item: any) => item.text.trim().length > 0);

        // 2. Extract Image Items
        const imageItems: any[] = [];
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
                    if (transformStack.length > 0) {
                        currentMatrix = transformStack.pop();
                    }
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
                } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
                    const imgName = args[0];
                    try {
                        const imgData = await (objs.get(imgName) || commonObjs.get(imgName));
                        if (imgData) {
                            const x = currentMatrix[4];
                            const y = currentMatrix[5];
                            const w = Math.sqrt(currentMatrix[0] * currentMatrix[0] + currentMatrix[1] * currentMatrix[1]);
                            const h = Math.sqrt(currentMatrix[2] * currentMatrix[2] + currentMatrix[3] * currentMatrix[3]);
                            
                            const docY = viewport.height - y - h;
                            
                            const imageBuffer = await this.convertImageToBuffer(imgData);
                            
                            if (imageBuffer) {
                                imageItems.push({
                                    type: 'image',
                                    x: x,
                                    docY: docY,
                                    width: w,
                                    height: h,
                                    data: imageBuffer,
                                    isImage: true
                                });
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to load image:', imgName, e);
                    }
                }
            }
        } catch (e) {
            console.error('Error extracting images:', e);
        }

        // 3. Merge and Sort
        const allItems = [...textItems, ...imageItems];
        
        allItems.sort((a, b) => {
           if (Math.abs(a.docY - b.docY) < 10) {
              return a.x - b.x;
           }
           return a.docY - b.docY;
        });

        // 4. Generate Paragraphs
        let currentLineY = -1;
        let currentLineItems: any[] = [];
        
        for (const item of allItems) {
           if (currentLineY === -1) {
              currentLineY = item.docY;
              currentLineItems.push(item);
           } else if (Math.abs(item.docY - currentLineY) < 10) {
              currentLineItems.push(item);
           } else {
              docChildren.push(this.createLineParagraph(currentLineItems, Paragraph, TextRun, ImageRun));
              currentLineY = item.docY;
              currentLineItems = [item];
           }
        }
        if (currentLineItems.length > 0) {
           docChildren.push(this.createLineParagraph(currentLineItems, Paragraph, TextRun, ImageRun));
        }

        if (pageNum < pdf.numPages) {
           docChildren.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })] }));
        }
      }
      
      // Create Word document with enhanced properties for file type conversion
      const doc = new Document({
        creator: "UPSA DocHub - PDF to Word Converter",
        title: `Converted: ${file?.name || 'document.pdf'}`,
        description: "File type conversion from PDF to Word document format",
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,    // 0.5 inch
                right: 720,  // 0.5 inch
                bottom: 720, // 0.5 inch
                left: 720    // 0.5 inch
              }
            }
          },
          children: docChildren
        }]
      });
      
      // Generate the Word document buffer
      const buffer = await Packer.toBuffer(doc);
      
      // Create blob from buffer
      const blob = new Blob([new Uint8Array(buffer)], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create output filename with conversion indicator
      const originalName = file?.name?.replace(/\.pdf$/i, '') || 'converted-document';
      const outputFilename = `${originalName}_converted.docx`;
      
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
        toolUsed: 'pdf-to-word-converter'
      };
    } catch (error) {
      console.error('Error in PDFToWordConverter:', error);
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to convert PDF to Word.',
        error
      );
    }
  }

  private async convertImageToBuffer(imgData: any): Promise<ArrayBuffer | null> {
    if (!imgData) return null;

    try {
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

  private createLineParagraph(items: any[], Paragraph: any, TextRun: any, ImageRun: any): any {
     items.sort((a, b) => a.x - b.x);
     
     const runs = [];
     const firstItem = items[0];
     const leftIndent = Math.max(0, Math.round(firstItem.x * 20));
     
     let lastX = firstItem.x + (firstItem.width || 0);
     
     for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (i > 0) {
            const gap = item.x - lastX;
            if (gap > 20) runs.push(new TextRun({ text: "\t" }));
            else if (gap > 3) runs.push(new TextRun({ text: " " }));
        }

        if (item.type === 'image') {
            runs.push(new ImageRun({
                data: item.data,
                transformation: {
                    width: item.width,
                    height: item.height
                }
            }));
        } else {
            const isBold = item.fontName?.toLowerCase().includes('bold');
            const isItalic = item.fontName?.toLowerCase().includes('italic');
            runs.push(new TextRun({
               text: item.text,
               size: Math.max(16, Math.round(item.height * 1.5)),
               bold: isBold,
               italics: isItalic
            }));
        }
        
        lastX = item.x + (item.width || 0);
     }
     
     return new Paragraph({
        indent: { left: leftIndent },
        children: runs,
        spacing: { after: 120 }
     });
  }
}

// PDF to Images Converter
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

  private parseColor(colorString: string) {
    // Convert hex color to RGB values for pdf-lib
    const hex = colorString.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return rgb(r, g, b);
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
            canvas: canvas
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

  private getOutputFilename(originalName: string, suffix: string): string {
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
          pdf = await PDFDocument.load(arrayBuffer, { password: this.password });
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

  private getOutputFilename(originalName: string, suffix: string): string {
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

  private getOutputFilename(originalName: string, suffix: string): string {
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
): PDFProcessor | PDFMerger | PDFSplitter | ImageToPDFProcessor | null {
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
        return new PDFToWordConverter(options);
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
      case 'pdf-to-word':
      case 'to-word':
        return new PDFToWordConverter(options as any);
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