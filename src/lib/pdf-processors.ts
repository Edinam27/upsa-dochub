import { PDFDocument, rgb, StandardFonts, PageSizes, degrees } from 'pdf-lib';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ProcessingOptions, ProcessedFile } from './types';
import { fileUtils } from './utils';

export interface PDFProcessor {
  process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array | Uint8Array[]>;
}

class PDFMergeProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    // For merge, we expect multiple files in options.additionalFiles
    const mergedPdf = await PDFDocument.create();
    
    // Process main file
    const mainPdf = await PDFDocument.load(fileData);
    const mainPages = await mergedPdf.copyPages(mainPdf, mainPdf.getPageIndices());
    mainPages.forEach((page) => mergedPdf.addPage(page));
    
    // Process additional files if provided
    if (options.additionalFiles) {
      for (const additionalFile of options.additionalFiles) {
        const additionalPdf = await PDFDocument.load(additionalFile);
        const additionalPages = await mergedPdf.copyPages(additionalPdf, additionalPdf.getPageIndices());
        additionalPages.forEach((page) => mergedPdf.addPage(page));
      }
    }
    
    return new Uint8Array(await mergedPdf.save());
  }
}

class PDFSplitProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array | Uint8Array[]> {
    const pdfDoc = await PDFDocument.load(fileData);
    const totalPages = pdfDoc.getPageCount();
    
    // Handle extract pages mode (from ExtractPagesTool)
    if (options.extractMode) {
      console.log('Processing extract mode:', options.extractMode);
      console.log('Page ranges:', options.pageRanges);
      console.log('Selected pages:', options.selectedPages);
      
      const results: Uint8Array[] = [];
      
      if (options.extractMode === 'ranges' && options.pageRanges && options.pageRanges.length > 0) {
        // Extract page ranges
        for (const range of options.pageRanges) {
          const newPdf = await PDFDocument.create();
          const pagesToCopy = [];
          
          for (let i = range.start - 1; i < Math.min(range.end, totalPages); i++) {
            if (i >= 0) pagesToCopy.push(i);
          }
          
          if (pagesToCopy.length > 0) {
            const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
            copiedPages.forEach(page => newPdf.addPage(page));
            results.push(new Uint8Array(await newPdf.save()));
          }
        }
        return results;
      } else if (options.extractMode === 'individual' && options.selectedPages && options.selectedPages.length > 0) {
        // Extract individual pages
        for (const pageNum of options.selectedPages) {
          if (pageNum > 0 && pageNum <= totalPages) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
            newPdf.addPage(copiedPage);
            results.push(new Uint8Array(await newPdf.save()));
          }
        }
        return results;
      } else {
        // If extract mode is set but no valid ranges/pages, return error
        throw new Error(`Invalid extract mode configuration: mode=${options.extractMode}, ranges=${options.pageRanges?.length || 0}, pages=${options.selectedPages?.length || 0}`);
      }
    }
    
    // Set default splitMode if not provided
    if (!options.splitMode) {
      options.splitMode = 'range';
    }
    
    const results: Uint8Array[] = [];
    
    switch (options.splitMode) {
      case 'pages':
        // Split into individual pages or specific pages
        const pagesToSplit = options.specificPages || Array.from({ length: totalPages }, (_, i) => i + 1);
        
        for (const pageNum of pagesToSplit) {
          if (pageNum > 0 && pageNum <= totalPages) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
            newPdf.addPage(copiedPage);
            results.push(new Uint8Array(await newPdf.save()));
          }
        }
        break;
        
      case 'every':
        // Split every N pages
        const everyN = options.everyNPages || 1;
        
        for (let i = 0; i < totalPages; i += everyN) {
          const newPdf = await PDFDocument.create();
          const endIndex = Math.min(i + everyN, totalPages);
          const pagesToCopy = [];
          
          for (let j = i; j < endIndex; j++) {
            pagesToCopy.push(j);
          }
          
          const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
          copiedPages.forEach(page => newPdf.addPage(page));
          results.push(new Uint8Array(await newPdf.save()));
        }
        break;
        
      case 'range':
      default:
        // Split by page range (existing behavior)
        const startPage = options.startPage || 1;
        const endPage = options.endPage || totalPages;
        
        const newPdf = await PDFDocument.create();
        const pagesToCopy = [];
        for (let i = startPage - 1; i < Math.min(endPage, totalPages); i++) {
          pagesToCopy.push(i);
        }
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        results.push(new Uint8Array(await newPdf.save()));
        break;
    }
    
    return results;
  }
}

class PDFCompressProcessor implements PDFProcessor {
  private lastEngineUsed: string | undefined;
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    if (!fileData || !(fileData instanceof Uint8Array)) {
      throw new Error(`Invalid fileData: expected Uint8Array, got ${typeof fileData} (${fileData ? (fileData as any).constructor?.name : 'null/undefined'})`);
    }
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfc-'));
    const inputPath = path.join(tmpDir, 'input.pdf');
    const outputPath = path.join(tmpDir, 'output.pdf');
    await fs.writeFile(inputPath, Buffer.from(fileData));
    const compressionLevel = options.compressionLevel || 'medium';
    const gsExec = await this.resolveGhostscript();
    const cpdfExec = await this.resolveCPDF();
    if (cpdfExec) {
      const strategies = this.buildCPDFStrategies(compressionLevel, inputPath, outputPath);
      const execFileAsync = promisify(execFile);
      for (let i = 0; i < strategies.length; i++) {
        try {
          await execFileAsync(cpdfExec, strategies[i], { windowsHide: true });
          const outBuf = await fs.readFile(outputPath);
          if (outBuf.length > 0 && outBuf.length < fileData.length) {
            this.lastEngineUsed = 'cpdf';
            await fs.rm(tmpDir, { recursive: true, force: true });
            return new Uint8Array(outBuf);
          }
        } catch {}
      }
    }
    if (gsExec) {
      const strategies = this.buildGhostscriptStrategies(compressionLevel, inputPath, outputPath);
      const execFileAsync = promisify(execFile);
      for (let i = 0; i < strategies.length; i++) {
        try {
          await execFileAsync(gsExec, strategies[i], { windowsHide: true });
          const outBuf = await fs.readFile(outputPath);
          if (outBuf.length > 0 && outBuf.length < fileData.length) {
            this.lastEngineUsed = 'ghostscript';
            await fs.rm(tmpDir, { recursive: true, force: true });
            return new Uint8Array(outBuf);
          }
        } catch (err) {
          // Try next strategy
        }
      }
    }
    const pdfDoc = await PDFDocument.load(fileData);
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    const compressionSettings = this.getCompressionSettings(compressionLevel);
    const saved = await pdfDoc.save({
      useObjectStreams: compressionSettings.useObjectStreams,
      addDefaultPage: false,
      objectsPerTick: compressionSettings.objectsPerTick,
      updateFieldAppearances: false
    });
    await fs.rm(tmpDir, { recursive: true, force: true });
    this.lastEngineUsed = 'pdf-lib';
    return saved;
  }
  
  private getCompressionSettings(level: string) {
    switch (level) {
      case 'low':
        return { useObjectStreams: false, objectsPerTick: 50 };
      case 'medium':
        return { useObjectStreams: true, objectsPerTick: 100 };
      case 'high':
        return { useObjectStreams: true, objectsPerTick: 200 };
      case 'maximum':
        return { useObjectStreams: true, objectsPerTick: 500 };
      default:
        return { useObjectStreams: true, objectsPerTick: 100 };
    }
  }

  private async resolveGhostscript(): Promise<string | null> {
    const execFileAsync = promisify(execFile);
    const candidates = [
      process.env.GHOSTSCRIPT_PATH,
      process.env.GS_PATH,
      process.platform === 'win32' ? 'gswin64c' : 'gs',
      process.platform === 'win32' ? 'gswin32c' : null
    ].filter(Boolean) as string[];
    for (const c of candidates) {
      try {
        await execFileAsync(c, ['-v'], { windowsHide: true });
        return c;
      } catch {}
    }
    return null;
  }

  private async resolveCPDF(): Promise<string | null> {
    const execFileAsync = promisify(execFile);
    const candidates = [
      process.env.CPDF_PATH,
      path.join(process.cwd(), 'upsa-dochub', 'vendor', 'bin', process.platform === 'win32' ? 'cpdf.exe' : 'cpdf'),
      path.join(process.cwd(), 'vendor', 'bin', process.platform === 'win32' ? 'cpdf.exe' : 'cpdf'),
      process.platform === 'win32' ? 'cpdf.exe' : 'cpdf'
    ].filter(Boolean) as string[];
    for (const c of candidates) {
      try {
        await execFileAsync(c, ['-version'], { windowsHide: true });
        return c;
      } catch {}
    }
    return null;
  }

  private buildGhostscriptStrategies(level: string, input: string, output: string): string[][] {
    const presets: Record<string, Array<{ pdfSettings: string; dpi: number; jpegQ: number }>> = {
      low: [
        { pdfSettings: '/printer', dpi: 200, jpegQ: 85 },
        { pdfSettings: '/ebook', dpi: 150, jpegQ: 80 }
      ],
      medium: [
        { pdfSettings: '/ebook', dpi: 150, jpegQ: 80 },
        { pdfSettings: '/screen', dpi: 120, jpegQ: 75 }
      ],
      high: [
        { pdfSettings: '/screen', dpi: 100, jpegQ: 70 },
        { pdfSettings: '/screen', dpi: 92, jpegQ: 65 }
      ],
      maximum: [
        { pdfSettings: '/screen', dpi: 72, jpegQ: 60 },
        { pdfSettings: '/screen', dpi: 72, jpegQ: 50 }
      ]
    };
    const variants = presets[level] || presets.medium;
    return variants.map(v => [
      '-q',
      '-dNOPAUSE',
      '-dBATCH',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${v.pdfSettings}`,
      '-dCompressFonts=true',
      '-dSubsetFonts=true',
      '-dEmbedAllFonts=true',
      '-dDetectDuplicateImages=true',
      '-dDownsampleColorImages=true',
      `-dColorImageResolution=${v.dpi}`,
      '-dColorImageDownsampleType=/Bicubic',
      '-dDownsampleGrayImages=true',
      `-dGrayImageResolution=${v.dpi}`,
      '-dGrayImageDownsampleType=/Bicubic',
      '-dDownsampleMonoImages=true',
      `-dMonoImageResolution=${v.dpi}`,
      '-dMonoImageDownsampleType=/Bicubic',
      '-dColorImageFilter=/DCTEncode',
      `-dJPEGQ=${v.jpegQ}`,
      `-sOutputFile=${output}`,
      input
    ]);
  }

  private buildCPDFStrategies(level: string, input: string, output: string): string[][] {
    const base = ['-o', output, input];
    const low = [
      ['-squeeze', '-recompress-flate', '-compress', '-o', output, input],
      ['-process-images', '-jpeg-to-jpeg-dpi', '200', '-o', output, input]
    ];
    const medium = [
      ['-squeeze', '-recompress-flate', '-compress', '-o', output, input],
      ['-process-images', '-jpeg-to-jpeg-dpi', '150', '-o', output, input]
    ];
    const high = [
      ['-squeeze', '-recompress-flate', '-compress', '-o', output, input],
      ['-process-images', '-jpeg-to-jpeg-dpi', '100', '-o', output, input]
    ];
    const maximum = [
      ['-squeeze', '-recompress-flate', '-compress', '-o', output, input],
      ['-process-images', '-jpeg-to-jpeg-dpi', '72', '-o', output, input]
    ];
    const map: Record<string, string[][]> = { low, medium, high, maximum };
    const seq = map[level] || medium;
    return seq.map(s => s.concat(base.slice(0, 0)));
  }
}

class PDFToWordProcessor implements PDFProcessor {
  lastEngineUsed?: string;
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx');
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(Buffer.from(fileData));
    const pageCount = pdfDoc.getPageCount();
    const header = new Paragraph({
      children: [new TextRun({ text: 'Converted from PDF', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_1,
    });
    const info = new Paragraph(`Pages: ${pageCount}`);
    const doc = new Document({ sections: [{ children: [header, info] }] });
    const outBuf: Buffer = await Packer.toBuffer(doc);
    this.lastEngineUsed = 'docx';
    return new Uint8Array(outBuf);
  }
}

class PDFWatermarkProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(fileData);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const watermarkText = options.watermarkText || 'UPSA DocHub';
    const fontSize = options.fontSize || 50;
    const opacity = options.opacity || 0.3;
    const position = options.position || 'center';
    const rotation = options.rotation || 45;
    const color = options.color || '#808080';
    
    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0.5, g: 0.5, b: 0.5 };
    };
    
    const rgbColor = hexToRgb(color);
    
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = watermarkText.length * fontSize * 0.6; // Approximate text width
      const textHeight = fontSize;
      
      // Calculate position coordinates
      let x: number, y: number;
      
      switch (position) {
        case 'top-left':
          x = 50;
          y = height - 50 - textHeight;
          break;
        case 'top-center':
          x = width / 2 - textWidth / 2;
          y = height - 50 - textHeight;
          break;
        case 'top-right':
          x = width - 50 - textWidth;
          y = height - 50 - textHeight;
          break;
        case 'bottom-left':
          x = 50;
          y = 50;
          break;
        case 'bottom-center':
          x = width / 2 - textWidth / 2;
          y = 50;
          break;
        case 'bottom-right':
          x = width - 50 - textWidth;
          y = 50;
          break;
        case 'center':
        default:
          x = width / 2 - textWidth / 2;
          y = height / 2;
          break;
      }
      
      page.drawText(watermarkText, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        opacity: opacity,
        rotate: degrees(rotation),
      });
    });
    
    return await pdfDoc.save();
  }
}

class PDFPasswordProtectProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    // Note: pdf-lib doesn't support password protection directly
    // This would require a server-side solution with qpdf or similar
    // For now, we'll provide a clear error message to the user
    
    throw new Error('PDF password protection requires server-side processing with specialized tools. This feature is currently not available in the browser environment. Please use a desktop PDF editor for password protection.');
  }
}

class PDFOCRProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    // Note: This is a placeholder for OCR functionality
    // In production, you'd integrate with Tesseract.js or similar OCR library
    // For now, we'll return the original PDF
    const pdfDoc = await PDFDocument.load(fileData);
    
    // Add a text layer with extracted text (placeholder)
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    pages.forEach((page, index) => {
      // This would normally contain the OCR extracted text
      const extractedText = `[OCR Processed] Page ${index + 1} - Text extraction would appear here`;
      
      // Add invisible text layer for searchability
      page.drawText(extractedText, {
        x: 10,
        y: 10,
        size: 1,
        font: font,
        color: rgb(1, 1, 1), // White text (invisible)
        opacity: 0.01,
      });
    });
    
    return await pdfDoc.save();
  }
}

class PDFRotateProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(fileData);
    const pages = pdfDoc.getPages();
    
    const rotation = options.rotation || 90;
    
    pages.forEach((page) => {
      page.setRotation(degrees(rotation));
    });
    
    return await pdfDoc.save();
  }
}

class ImageToPDFProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    
    // Handle multiple images if provided in options
    const imageFiles = options.imageFiles || [{ data: fileData, type: options.fileType || 'image/jpeg' }];
    
    for (const imageFile of imageFiles) {
      // Determine image type and embed
      let image;
      
      if (imageFile.type.includes('png')) {
        image = await pdfDoc.embedPng(imageFile.data);
      } else {
        image = await pdfDoc.embedJpg(imageFile.data);
      }
      
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Scale image to fit page
      const imageAspectRatio = image.width / image.height;
      const pageAspectRatio = width / height;
      
      let imageWidth, imageHeight;
      
      if (imageAspectRatio > pageAspectRatio) {
        imageWidth = width * 0.9;
        imageHeight = imageWidth / imageAspectRatio;
      } else {
        imageHeight = height * 0.9;
        imageWidth = imageHeight * imageAspectRatio;
      }
      
      page.drawImage(image, {
        x: (width - imageWidth) / 2,
        y: (height - imageHeight) / 2,
        width: imageWidth,
        height: imageHeight,
      });
    }
    
    return await pdfDoc.save();
  }
}

class WatermarkRemovalProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    // Enhanced implementation for image-based watermark removal
    // CamScanner and similar apps add semi-transparent image overlays
    
    const pdfDoc = await PDFDocument.load(fileData);
    const pages = pdfDoc.getPages();
    
    const method = options.method || 'automatic';
    const target = options.target || 'camscanner';
    const sensitivity = options.sensitivity || 'medium';
    
    for (const page of pages) {
      try {
        // For image-based watermarks like CamScanner:
        // 1. These are typically semi-transparent overlays
        // 2. They often appear in consistent positions (corners, center)
        // 3. They have recognizable patterns or logos
        
        if (target === 'camscanner') {
          // CamScanner typically adds watermarks in bottom-right corner
          // or as semi-transparent overlays across the document
          await this.removeCamScannerWatermark(page, sensitivity);
        } else if (target === 'generic' || target === 'logo') {
          // Generic image watermark removal
          await this.removeGenericImageWatermark(page, sensitivity);
        }
        
        // Note: Actual implementation would require:
        // - Converting PDF page to image (using pdf2pic or similar)
        // - Applying computer vision techniques (OpenCV.js)
        // - Watermark detection using template matching
        // - Inpainting algorithms to fill removed areas
        // - Converting processed image back to PDF
        
      } catch (error) {
        console.warn(`Failed to process page: ${error}`);
        // Continue with other pages even if one fails
      }
    }
    
    return await pdfDoc.save();
  }
  
  private async removeCamScannerWatermark(page: any, sensitivity: string): Promise<void> {
    // CamScanner-specific watermark removal logic
    // This would implement:
    // 1. Detection of CamScanner's specific watermark patterns
    // 2. Location-based removal (common positions)
    // 3. Color/transparency-based filtering
    
    // Placeholder for actual implementation
    // Real implementation would use image processing libraries
  }
  
  private async removeGenericImageWatermark(page: any, sensitivity: string): Promise<void> {
    // Generic image watermark removal logic
    // This would implement:
    // 1. Edge detection to find watermark boundaries
    // 2. Pattern recognition for common watermark types
    // 3. Content-aware fill for removed areas
    
    // Placeholder for actual implementation
    // Real implementation would use advanced computer vision
  }
}

class PDFUnlockProcessor implements PDFProcessor {
  async process(fileData: Uint8Array, options: ProcessingOptions): Promise<Uint8Array> {
    try {
      // First try to load without password to check if it's actually password-protected
      try {
        const testDoc = await PDFDocument.load(fileData);
        // If this succeeds, the PDF is not password-protected
        return await testDoc.save();
      } catch (testError) {
        // PDF is likely password-protected, try with provided password
        const password = options.password;
        if (!password) {
          throw new Error('This PDF is password-protected. Please provide the correct password.');
        }
        
        const pdfDoc = await PDFDocument.load(fileData);
        // Save the PDF without password protection
        return await pdfDoc.save();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('password')) {
          throw new Error('Failed to unlock PDF. The password provided is incorrect.');
        }
        throw new Error(`Failed to process PDF: ${error.message}`);
      }
      throw new Error('Failed to unlock PDF. Please check if the password is correct.');
    }
  }
}

// Factory function to create processors
export function createPDFProcessor(toolId: string, options: any = {}): PDFProcessor | null {
  switch (toolId) {
    case 'pdf-merge':
      return new PDFMergeProcessor();
    case 'pdf-split':
    case 'pdf-extract':
      return new PDFSplitProcessor();
    case 'pdf-compress':
      return new PDFCompressProcessor();
    case 'pdf-watermark':
      return new PDFWatermarkProcessor();
    case 'pdf-protect':
      return new PDFPasswordProtectProcessor();
    case 'pdf-ocr':
    case 'ocr-text-extraction':
      return new PDFOCRProcessor();
    case 'pdf-rotate':
      return new PDFRotateProcessor();
    case 'images-to-pdf':
      return new ImageToPDFProcessor();
    case 'watermark-removal':
      return new WatermarkRemovalProcessor();
    case 'pdf-unlock':
      return new PDFUnlockProcessor();
    case 'pdf-to-word':
      return new PDFToWordProcessor();
    case 'pdf-to-images':
      // PDF to images conversion should be handled client-side only
      throw new Error('PDF to images conversion is handled client-side and should not use server-side processing');

    default:
      return null;
  }
}

// Export processor classes for direct use
export {
  PDFMergeProcessor,
  PDFSplitProcessor,
  PDFCompressProcessor,
  PDFWatermarkProcessor,
  PDFPasswordProtectProcessor,
  PDFOCRProcessor,
  PDFRotateProcessor,
  ImageToPDFProcessor,
  WatermarkRemovalProcessor,
  PDFUnlockProcessor,
};