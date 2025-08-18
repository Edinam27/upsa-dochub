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
  private pageRange: string;
  
  constructor(options: ProcessingOptions & { pageRange: string }) {
    super(options);
    this.pageRange = options.pageRange;
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      const pdf = await this.loadPDF(file);
      const pageCount = pdf.getPageCount();
      
      const pageIndices = this.parsePageRange(this.pageRange, pageCount);
      
      if (pageIndices.length === 0) {
        throw errorUtils.createError(
          'INVALID_INPUT',
          'No valid pages specified in the range.'
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

// PDF to Images Converter
class PDFToImagesConverter extends PDFProcessor {
  async process(file: File): Promise<ProcessedFile[]> {
    try {
      // This is a simplified implementation
      // In a real application, you would use a library like pdf2pic or PDF.js
      
      const pdf = await this.loadPDF(file);
      const pageCount = pdf.getPageCount();
      const results: ProcessedFile[] = [];
      
      // Placeholder: In reality, you'd convert each page to an image
      for (let i = 0; i < pageCount; i++) {
        // This would be the actual image conversion logic
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
          ctx.fillText(`Page ${i + 1} of ${file.name}`, 50, 50);
        }
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        const filename = `${file.name.replace('.pdf', '')}_page_${i + 1}.png`;
        results.push({
          name: filename,
          size: blob.size,
          type: 'image/png',
          blob,
          downloadUrl: URL.createObjectURL(blob)
        });
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

// PDF Annotator
class PDFAnnotator extends PDFProcessor {
  private annotations: any[];
  
  constructor(options: ProcessingOptions & { annotations: any[] }) {
    super(options);
    this.annotations = options.annotations || [];
  }

  async process(file: File): Promise<ProcessedFile> {
    try {
      console.log('PDFAnnotator.process called with file:', file.name);
      console.log('Annotations received:', JSON.stringify(this.annotations, null, 2));
      console.log('Number of annotations:', this.annotations.length);
      
      const pdf = await this.loadPDF(file);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      // Group annotations by page
      const annotationsByPage = this.annotations.reduce((acc, annotation) => {
        if (!acc[annotation.page]) {
          acc[annotation.page] = [];
        }
        acc[annotation.page].push(annotation);
        return acc;
      }, {} as Record<number, any[]>);
      
      console.log('Annotations grouped by page:', JSON.stringify(annotationsByPage, null, 2));
      
      // Apply annotations to each page
      for (const [pageNum, pageAnnotations] of Object.entries(annotationsByPage)) {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex >= 0 && pageIndex < pdf.getPageCount()) {
          const page = pdf.getPage(pageIndex);
          
          for (const annotation of pageAnnotations) {
            await this.applyAnnotation(page, annotation, font);
          }
        }
      }
      
      const filename = this.getOutputFilename(file.name, 'annotated');
      return await this.savePDF(pdf, filename);
    } catch (error) {
      if (error.code) throw error;
      throw errorUtils.createError(
        'PROCESSING_FAILED',
        'Failed to apply annotations to PDF.',
        error
      );
    }
  }
  
  private async applyAnnotation(page: any, annotation: any, font: any) {
    const { width, height } = page.getSize();
    console.log('Applying annotation:', JSON.stringify(annotation, null, 2));
    console.log('Page size:', { width, height });
    
    switch (annotation.type) {
      case 'highlight':
        // Draw a semi-transparent rectangle for highlight
        page.drawRectangle({
          x: annotation.x,
          y: height - annotation.y - annotation.height, // PDF coordinates are bottom-up
          width: annotation.width,
          height: annotation.height,
          color: this.hexToRgb(annotation.color),
          opacity: annotation.opacity || 0.3
        });
        break;
        
      case 'text':
        // Add text annotation
        const fontSize = annotation.fontSize || 12;
        page.drawText(annotation.text, {
          x: annotation.x,
          y: height - annotation.y - fontSize, // PDF coordinates are bottom-up
          size: fontSize,
          font,
          color: this.hexToRgb(annotation.color),
          opacity: annotation.opacity || 1.0
        });
        break;
        
      case 'draw':
        // For draw annotations, we'll draw lines connecting the points
        if (annotation.points && annotation.points.length > 1) {
          for (let i = 0; i < annotation.points.length - 1; i++) {
            const point1 = annotation.points[i];
            const point2 = annotation.points[i + 1];
            
            page.drawLine({
              start: { x: point1.x, y: height - point1.y },
              end: { x: point2.x, y: height - point2.y },
              thickness: annotation.strokeWidth || 2,
              color: this.hexToRgb(annotation.color),
              opacity: annotation.opacity || 1.0
            });
          }
        }
        break;
    }
  }
  
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      );
    }
    return rgb(0, 0, 0); // Default to black
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
  PDFToImagesConverter,
  PDFInfoExtractor,
  PDFAnnotator
};

// Factory function to create processors
export function createPDFProcessor(
  type: string,
  options: ProcessingOptions = {}
): PDFProcessor | null {
  // IMMEDIATE ENTRY LOGGING
  console.log('🚀 IMMEDIATE ENTRY: createPDFProcessor function started');
  console.error('🚀 IMMEDIATE ENTRY: createPDFProcessor function started');
  
  console.log('FUNCTION ENTRY: createPDFProcessor called');
  console.error('FUNCTION ENTRY: createPDFProcessor called');
  console.log('=== createPDFProcessor START ===');
  console.error('=== createPDFProcessor START ===');
  console.log('createPDFProcessor called with type:', type, 'options:', options);
  console.error('createPDFProcessor called with type:', type, 'options:', options);
  console.log('Type is:', JSON.stringify(type));
  console.error('Type is:', JSON.stringify(type));
  
  try {
    switch (type) {
      case 'merge':
        return new PDFMerger(options);
      case 'split':
        return new PDFSplitter(options);
      case 'extract':
        return new PDFPageExtractor(options as any);
      case 'compress':
        return new PDFCompressor(options);
      case 'watermark':
        return new PDFWatermark(options as any);
      case 'protect':
        return new PDFPasswordProtector(options as any);
      case 'convert':
        return new PDFToImagesConverter(options);
      case 'pdf-annotate':
      case 'annotate':
        console.log('Creating PDFAnnotator with options:', options);
        console.log('Options type:', typeof options);
        console.log('Options keys:', Object.keys(options || {}));
        console.log('Annotations in options:', options?.annotations);
        
        // Ensure annotations exist in options
        const annotatorOptions = {
          ...options,
          annotations: options?.annotations || []
        };
        console.log('Final annotator options:', annotatorOptions);
        
        try {
          const annotator = new PDFAnnotator(annotatorOptions as ProcessingOptions & { annotations: any[] });
          console.log('PDFAnnotator created successfully:', !!annotator);
          console.log('Annotator instance:', annotator);
          return annotator;
        } catch (constructorError) {
          console.error('Error in PDFAnnotator constructor:', constructorError);
          console.error('Constructor error stack:', constructorError.stack);
          throw constructorError;
        }
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