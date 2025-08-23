import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { jsPDF } from 'jspdf';
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

  abstract process(file: File): Promise<ProcessedFile>;
  
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

  protected async savePDF(pdfDoc: PDFDocument, filename: string): Promise<ProcessedFile> {
    try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      return {
        name: filename,
        size: blob.size,
        type: 'application/pdf',
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
class PDFMerger extends PDFProcessor {
  async process(files: File[]): Promise<ProcessedFile> {
    if (files.length < 2) {
      throw errorUtils.createError(
        'INVALID_INPUT',
        'At least 2 PDF files are required for merging.'
      );
    }

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const pdf = await this.loadPDF(file);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      
      return await this.savePDF(mergedPdf, 'merged_document.pdf');
    } catch (error) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to merge PDF files.',
        error
      );
    }
  }

  async process(file: File): Promise<ProcessedFile> {
    throw new Error('PDFMerger requires multiple files. Use the process method with File[] instead.');
  }
}

// PDF Splitter
class PDFSplitter extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile[]> {
    try {
      const pdf = await this.loadPDF(file);
      const pageCount = pdf.getPageCount();
      const results: ProcessedFile[] = [];
      
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        
        const filename = this.getOutputFilename(file.name, `page_${i + 1}`);
        const result = await this.savePDF(newPdf, filename);
        results.push(result);
      }
      
      return results;
    } catch (error) {
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

  async process(file: File): Promise<ProcessedFile> {
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
      return await this.savePDF(newPdf, filename);
    } catch (error) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to extract pages from PDF.',
        error
      );
    }
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
  async process(file: File): Promise<ProcessedFile> {
    try {
      const pdf = await this.loadPDF(file);
      
      // Apply compression based on options
      const compressionLevel = this.options.compressionLevel || 'medium';
      
      // Get compression settings
      const compressionSettings = this.getCompressionSettings(compressionLevel);
      
      // Apply image compression if the PDF contains images
      const pages = pdf.getPages();
      for (const page of pages) {
        // Note: pdf-lib has limited compression capabilities
        // For better compression, we would need additional libraries
        // This is a basic implementation that re-saves with optimized settings
      }
      
      const filename = this.getOutputFilename(file.name, 'compressed');
      return await this.savePDFWithCompression(pdf, filename, compressionSettings);
    } catch (error) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to compress PDF file.',
        error
      );
    }
  }
  
  private getCompressionSettings(level: string) {
    switch (level) {
      case 'low':
        return { objectsPerTick: 50, updateFieldAppearances: false };
      case 'medium':
        return { objectsPerTick: 100, updateFieldAppearances: false };
      case 'high':
        return { objectsPerTick: 200, updateFieldAppearances: false };
      case 'maximum':
        return { objectsPerTick: 500, updateFieldAppearances: false };
      default:
        return { objectsPerTick: 100, updateFieldAppearances: false };
    }
  }
  
  private async savePDFWithCompression(pdfDoc: PDFDocument, filename: string, settings: any): Promise<ProcessedFile> {
    try {
      // Save with compression settings
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: settings.objectsPerTick,
        updateFieldAppearances: settings.updateFieldAppearances
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      return {
        name: filename,
        size: blob.size,
        type: 'application/pdf',
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
}

// PDF Watermark
class PDFWatermark extends PDFProcessor {
  private watermarkText: string;
  private position: string;
  
  constructor(options: ProcessingOptions & { watermarkText: string; watermarkPosition?: string }) {
    super(options);
    this.watermarkText = options.watermarkText;
    this.position = options.watermarkPosition || 'center';
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const pdf = await this.loadPDF(file);
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) * 0.1;
        
        const textWidth = font.widthOfTextAtSize(this.watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        let x: number, y: number;
        
        switch (this.position) {
          case 'top-left':
            x = 50;
            y = height - 50;
            break;
          case 'top-right':
            x = width - textWidth - 50;
            y = height - 50;
            break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-right':
            x = width - textWidth - 50;
            y = 50;
            break;
          default: // center
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
        }
        
        page.drawText(this.watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.5,
          rotate: { angle: Math.PI / 6, origin: { x, y } }
        });
      }
      
      const filename = this.getOutputFilename(file.name, 'watermarked');
      return await this.savePDF(pdf, filename);
    } catch (error) {
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
  private password: string;
  
  constructor(options: ProcessingOptions & { password: string }) {
    super(options);
    this.password = options.password;
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const pdf = await this.loadPDF(file);
      
      // Note: pdf-lib doesn't support password protection directly
      // This is a placeholder for the functionality
      // In a real implementation, you might use a different library
      
      const filename = this.getOutputFilename(file.name, 'protected');
      return await this.savePDF(pdf, filename);
    } catch (error) {
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
      console.log('PDFToWordConverter: Processing PDF to Word file type conversion');
      
      // Import required libraries dynamically
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = await import('docx');
      
      // Get basic PDF info using pdf-lib
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      console.log(`PDF loaded for file type conversion: ${pageCount} pages`);
      
      let extractedText = '';
      const paragraphs = [];
      
      // Add professional document header optimized for Word format
      paragraphs.push(
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
        new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty line
        
        // Document information table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Original File:", bold: true })] })],
                  width: { size: 30, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: file?.name || 'document.pdf' })] })],
                  width: { size: 70, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Total Pages:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: pageCount.toString() })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Conversion Date:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString() })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "File Type:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "PDF → DOCX Conversion" })] })]
                })
              ]
            })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty line
        new Paragraph({
          children: [
            new TextRun({
              text: "Document Content",
              bold: true,
              size: 24,
              color: "2E74B5"
            })
          ],
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }) // Empty line
      );
      
      // Track conversion statistics for better Word document structure
      const documentSections = [];
      let totalTextLength = 0;
      
      // Extract text using PDF.js with enhanced file type conversion processing
      try {
        const pdfjsLib = await import('pdfjs-dist');
        // Set worker source to local file
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          let pageText = '';
          let formattedItems = [];
          
          // Process text items with position and formatting information for better conversion
          textContent.items.forEach((item: any) => {
            if (item.str && item.str.trim()) {
              formattedItems.push({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5],
                fontSize: item.height || 12,
                fontName: item.fontName || 'default'
              });
              pageText += item.str + ' ';
            }
          });
          
          if (pageText.trim()) {
            extractedText += pageText + '\n\n';
            totalTextLength += pageText.length;
            
            // Add page header with enhanced formatting for Word conversion
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Page ${pageNum}`,
                    bold: true,
                    size: 22,
                    color: "2E74B5"
                  })
                ],
                heading: HeadingLevel.HEADING_2
              })
            );
            
            // Process text with improved paragraph detection for Word format
            const sentences = pageText.split(/[.!?]+/).filter(s => s.trim());
            let currentParagraph = '';
            
            sentences.forEach((sentence, index) => {
              currentParagraph += sentence.trim();
              
              // Create paragraph breaks based on content length and structure
              if (currentParagraph.length > 200 || index === sentences.length - 1) {
                if (currentParagraph.trim()) {
                  paragraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: currentParagraph.trim() + (currentParagraph.trim().match(/[.!?]$/) ? '' : '.'),
                          size: 22
                        })
                      ]
                    })
                  );
                }
                currentParagraph = '';
              } else {
                currentParagraph += '. ';
              }
            });
            
            // Add spacing between pages
            paragraphs.push(
              new Paragraph({ children: [new TextRun({ text: "" })] })
            );
            
            documentSections.push({
              pageNumber: pageNum,
              textLength: pageText.length,
              hasContent: true
            });
          } else {
            // No text found on this page - optimized message for file conversion
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Page ${pageNum}`,
                    bold: true,
                    size: 22,
                    color: "2E74B5"
                  })
                ],
                heading: HeadingLevel.HEADING_2
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "[This page contains visual content (images, charts, or graphics) that cannot be directly converted to text format. Consider using OCR tools for scanned content.]",
                    italics: true,
                    size: 20,
                    color: "666666"
                  })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: "" })] })
            );
            
            documentSections.push({
              pageNumber: pageNum,
              textLength: 0,
              hasContent: false
            });
          }
        }
        
        console.log(`File type conversion completed: extracted text from ${pdf.numPages} pages, total text length: ${totalTextLength} characters`);
        
      } catch (pdfError) {
        console.warn('PDF.js text extraction failed, creating document with metadata only:', pdfError);
        
        // Fallback: Create document with conversion notice
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Text Extraction Notice",
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Text extraction from this PDF was not possible. This may be because:",
                size: 22
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• The PDF contains scanned images or is image-based",
                size: 20
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• The PDF has security restrictions",
                size: 20
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• The PDF format is not supported for text extraction",
                size: 20
              })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "For scanned PDFs or image-based documents, please use the OCR Text Extraction tool.",
                size: 22,
                italics: true,
                color: "0066CC"
              })
            ]
          })
        );
      }
      
      // Add conversion summary section
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty line
        new Paragraph({
          children: [
            new TextRun({
              text: "Conversion Summary",
              bold: true,
              size: 24,
              color: "2E74B5"
            })
          ],
          heading: HeadingLevel.HEADING_2
        }),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Conversion Type:", bold: true })] })],
                  width: { size: 40, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "PDF to Word Document (File Type Conversion)" })] })],
                  width: { size: 60, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Total Characters:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: totalTextLength.toLocaleString() })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Pages with Content:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: `${documentSections.filter(s => s.hasContent).length} of ${pageCount}` })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Conversion Quality:", bold: true })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ 
                    text: totalTextLength > 1000 ? "High - Rich text content detected" : 
                          totalTextLength > 100 ? "Medium - Moderate text content" : 
                          "Low - Limited text content (may contain mostly images)",
                    color: totalTextLength > 1000 ? "008000" : totalTextLength > 100 ? "FF8C00" : "FF0000"
                  })] })]
                })
              ]
            })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }), // Empty line
        new Paragraph({
          children: [
            new TextRun({
              text: "Note: This conversion focuses on file type transformation from PDF to Word format. For PDFs that originated from Word documents, this process reconstructs the document structure while preserving the original content as much as possible.",
              italics: true,
              size: 20,
              color: "666666"
            })
          ]
        })
      );
      
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
          children: paragraphs
        }]
      });
      
      console.log('Word document created with enhanced file type conversion formatting');
      
      // Generate the Word document buffer
      const buffer = await Packer.toBuffer(doc);
      
      console.log(`Document buffer generated: ${buffer.length} bytes`);
      
      // Create blob from buffer
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create output filename with conversion indicator
      const originalName = file?.name?.replace(/\.pdf$/i, '') || 'converted-document';
      const outputFilename = `${originalName}_converted.docx`;
      
      return {
        name: outputFilename,
        size: blob.size,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        blob,
        downloadUrl: URL.createObjectURL(blob)
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

  async process(file: File): Promise<ProcessedFile> {
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

      return await this.savePDF(pdfDoc, this.getOutputFilename(file.name, 'signed'));
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
  async process(file: File): Promise<ProcessedFile> {
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up worker
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const results: ProcessedFile[] = [];
      
      // Extract options from this.options
      const {
        outputFormat = 'png',
        quality = 'high',
        resolution = 300,
        pageRange = 'all',
        startPage,
        endPage,
        specificPages
      } = this.options;
      
      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      
      if (pageRange === 'all') {
        pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else if (pageRange === 'range' && startPage && endPage) {
        for (let i = startPage; i <= Math.min(endPage, pdf.numPages); i++) {
          pagesToConvert.push(i);
        }
      } else if (pageRange === 'specific' && specificPages) {
        // Parse specific pages (e.g., "1, 3, 5-7, 10")
        const pageRanges = specificPages.split(',').map(s => s.trim());
        for (const range of pageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= Math.min(end, pdf.numPages); i++) {
              if (i > 0) pagesToConvert.push(i);
            }
          } else {
            const pageNum = parseInt(range);
            if (pageNum > 0 && pageNum <= pdf.numPages) {
              pagesToConvert.push(pageNum);
            }
          }
        }
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
            viewport: viewport
          }).promise;
          
          // Convert canvas to blob
          const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : 
                          outputFormat === 'webp' ? 'image/webp' : 'image/png';
          const qualityValue = quality === 'high' ? 0.95 : quality === 'medium' ? 0.8 : 0.6;
          
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), mimeType, qualityValue);
          });
          
          const baseFilename = file.name.replace(/\.pdf$/i, '');
          const extension = outputFormat === 'jpg' ? 'jpg' : outputFormat === 'webp' ? 'webp' : 'png';
          const filename = `${baseFilename}_page_${pageNum.toString().padStart(3, '0')}.${extension}`;
          
          results.push({
            name: filename,
            size: blob.size,
            type: mimeType,
            blob,
            downloadUrl: URL.createObjectURL(blob)
          });
        }
      }
      
      return results;
    } catch (error) {
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
  PDFInfoExtractor
};

// Factory function to create processors
export function createPDFProcessor(
  type: string,
  options: ProcessingOptions = {}
): PDFProcessor | null {
  // IMMEDIATE ENTRY LOGGING
  console.log('🚀🚀🚀 IMMEDIATE ENTRY: createPDFProcessor function started with type:', type);
  console.error('🚀🚀🚀 IMMEDIATE ENTRY: createPDFProcessor function started with type:', type);
  
  if (!type) {
    console.error('❌ ERROR: type is null or undefined:', type);
    return null;
  }
  
  console.log('✅ FUNCTION ENTRY: createPDFProcessor called');
  console.error('✅ FUNCTION ENTRY: createPDFProcessor called');
  console.log('=== createPDFProcessor START ===');
  console.error('=== createPDFProcessor START ===');
  console.log('createPDFProcessor called with type:', type, 'options:', options);
  console.error('createPDFProcessor called with type:', type, 'options:', options);
  console.log('Type is:', JSON.stringify(type));
  console.error('Type is:', JSON.stringify(type));
  
  try {
    console.log('🔍 SWITCH STATEMENT: About to enter switch with type:', JSON.stringify(type));
    console.error('🔍 SWITCH STATEMENT: About to enter switch with type:', JSON.stringify(type));
    console.log('🔍 Type comparison: type === "pdf-to-word":', type === 'pdf-to-word');
    console.error('🔍 Type comparison: type === "pdf-to-word":', type === 'pdf-to-word');
    
    switch (type) {
      case 'merge':
        return new PDFMerger(options);
      case 'split':
        return new PDFSplitter(options);
      case 'extract':
      case 'pdf-extract':
        console.log('Creating PDFPageExtractor with options:', options);
        console.error('Creating PDFPageExtractor with options:', options);
        try {
          const extractor = new PDFPageExtractor(options as any);
          console.log('PDFPageExtractor created successfully:', !!extractor);
          console.error('PDFPageExtractor created successfully:', !!extractor);
          return extractor;
        } catch (extractorError) {
          console.error('Error in PDFPageExtractor constructor:', extractorError);
          console.error('Constructor error stack:', extractorError.stack);
          throw extractorError;
        }
      case 'compress':
        return new PDFCompressor(options);
      case 'watermark':
        return new PDFWatermark(options as any);
      case 'protect':
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
        console.log('Creating CloudConvert PDF to Word converter with options:', options);
        try {
          const { CloudConvertPDFProcessor } = require('./cloudconvert-processor');
          const converter = new CloudConvertPDFProcessor(options);
          console.log('CloudConvert PDF processor created successfully:', !!converter);
          return converter;
        } catch (constructorError) {
          console.error('Error in CloudConvert PDF processor constructor:', constructorError);
          throw constructorError;
        }
      case 'pdf-ocr':
        // OCR text extraction is handled client-side only
        throw errorUtils.createError(
          'PROCESSING_FAILED',
          'OCR text extraction is handled client-side and should not use server-side processing. Please use the client-side OCR tool.'
        );
      case 'add-signature':
        console.log('Creating PDFSignatureProcessor with options:', options);
        return new PDFSignatureProcessor(options as any);
      default:
        throw errorUtils.createError(
          'INVALID_PROCESSOR',
          `Unknown PDF processor type: ${type}`
        );
    }
  } catch (error) {
    console.error('Error in createPDFProcessor:', error);
    console.error('=== createPDFProcessor ERROR END ===');
    throw error;
  }
  
  console.log('=== createPDFProcessor END - Should not reach here ===');
  console.error('=== createPDFProcessor END - Should not reach here ===');
  return null;
}