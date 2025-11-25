import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { createPDFProcessor } from '@/lib/pdf-processors.ts';
import { ProcessingOptions, APIResponse, ProcessedFile } from '@/lib/types';
import { fileUtils, errorUtils } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const file = formData.get('file') as File; // For single file uploads
    const toolId = formData.get('toolId') as string;
    const rawOptions = formData.get('options');
    let options: ProcessingOptions = {};
    if (typeof rawOptions === 'string') {
      options = JSON.parse(rawOptions || '{}');
    } else if (rawOptions && typeof (rawOptions as any).text === 'function') {
      const txt = await (rawOptions as Blob).text();
      options = JSON.parse(txt || '{}');
    }

    
    // Use either files array or single file
    const fileList = files.length > 0 ? files : (file ? [file] : []);
    
    if (!fileList || fileList.length === 0) {
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('INVALID_INPUT', 'No files provided')
      } as APIResponse<null>, { status: 400 });
    }
    
    if (!toolId) {
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('INVALID_INPUT', 'Tool ID is required')
      } as APIResponse<null>, { status: 400 });
    }
    
    const processorOptions = options;
    
    // Handle image compression separately (client-side processing)
    if (toolId === 'image-compress') {
      // For image compression, the processing is done client-side
      // This endpoint should not be called for image compression
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('INVALID_OPERATION', 'Image compression is handled client-side')
      } as APIResponse<null>, { status: 400 });
    }
    
    let processor;
    try {
      processor = createPDFProcessor(toolId, processorOptions);
    } catch (error) {
      console.error('Error creating PDF processor:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('INVALID_INPUT', `Invalid tool ID: ${toolId}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } as APIResponse<null>, { status: 400 });
    }
    
    if (!processor) {
      console.error('Processor is null after creation');
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('PROCESSING_FAILED', 'Failed to create processor')
      } as APIResponse<null>, { status: 500 });
    }
    
    const processedFiles: ProcessedFile[] = [];
    
    if (toolId === 'images-to-pdf') {
      try {
        const imageFiles = [];
        
        for (const file of fileList) {
          if (!file || file.size === 0) {
            throw new Error('Invalid or empty file');
          }
          
          const arrayBuffer = await file.arrayBuffer();
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('File contains no data');
          }
          
          imageFiles.push({
            data: new Uint8Array(arrayBuffer),
            type: file.type
          });
        }
        
        // Process all images into a single PDF
        const result = await processor.process(new Uint8Array(), { ...options, imageFiles });
        
        // Ensure result is a Uint8Array
        const resultArray = Array.isArray(result) ? result[0] : result;
        
        processedFiles.push({
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `images_to_pdf_${Date.now()}.pdf`,
          originalName: `${files.length}_images_combined.pdf`,
          size: resultArray.length,
          type: getOutputMimeType(toolId),
          data: Array.from(resultArray),
          processedAt: new Date().toISOString(),
          toolUsed: toolId
        });
      } catch (error) {
        console.error('Error processing images to PDF:', error);
        return NextResponse.json({
          success: false,
          error: errorUtils.createError('PROCESSING_FAILED', 'Failed to process images to PDF', error instanceof Error ? error.message : 'Unknown error')
        } as APIResponse<null>, { status: 500 });
      }
    } else if (toolId === 'pdf-merge') {
      try {
        if (fileList.length < 2) {
          throw new Error('At least 2 PDF files are required for merging');
        }
        
        // Prepare the main file and additional files for merging
        const mainFile = fileList[0];
        const additionalFiles = [];
        
        // Convert all additional files to Uint8Array
        for (let i = 1; i < fileList.length; i++) {
          const file = fileList[i];
          if (!file || file.size === 0) {
            throw new Error(`Invalid or empty file: ${file?.name || 'unknown'}`);
          }
          
          const arrayBuffer = await file.arrayBuffer();
          if (arrayBuffer.byteLength === 0) {
            throw new Error(`File contains no data: ${file.name}`);
          }
          
          additionalFiles.push(new Uint8Array(arrayBuffer));
        }
        
        // Process the main file with additional files for merging
        const mainArrayBuffer = await mainFile.arrayBuffer();
        if (mainArrayBuffer.byteLength === 0) {
          throw new Error(`Main file contains no data: ${mainFile.name}`);
        }
        
        const result = await processor.process(new Uint8Array(mainArrayBuffer), {
          ...options,
          additionalFiles
        });
        
        // Ensure result is a Uint8Array
        const resultArray = Array.isArray(result) ? result[0] : result;
        
        processedFiles.push({
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `merged_${Date.now()}.pdf`,
          originalName: `merged_${fileList.length}_files.pdf`,
          size: resultArray.length,
          type: getOutputMimeType(toolId),
          data: Array.from(resultArray),
          processedAt: new Date().toISOString(),
          toolUsed: toolId
        });
      } catch (error) {
        console.error('Error merging PDF files:', error);
        return NextResponse.json({
          success: false,
          error: errorUtils.createError('PROCESSING_FAILED', 'Failed to merge PDF files', error instanceof Error ? error.message : 'Unknown error')
        } as APIResponse<null>, { status: 500 });
      }
    } else {
      // Process each file individually for other tools
      for (const file of fileList) {
        try {
          if (!file || file.size === 0) {
            throw new Error('Invalid or empty file');
          }
          
          const arrayBuffer = await file.arrayBuffer();
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('File contains no data');
          }
          
          const uint8Array = new Uint8Array(arrayBuffer)
          
          // Process the file based on tool type
          const result = await processor.process(uint8Array, options);
          
          // Handle both single and multiple file outputs
          if (Array.isArray(result)) {
            // Multiple files returned (e.g., PDF split)
            for (let index = 0; index < result.length; index++) {
              const processedFile = result[index];
              
              // Check if it's a raw Uint8Array or ProcessedFile object
              if (processedFile instanceof Uint8Array) {
                const originalSize = uint8Array.byteLength;
                const newSize = processedFile.length;
                processedFiles.push({
                  id: `processed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                  name: `${file.name.replace(/\.[^/.]+$/, '')}_${index + 1}.pdf`,
                  originalName: file.name,
                  size: newSize,
                  type: getOutputMimeType(toolId),
                  data: Array.from(processedFile),
                  processedAt: new Date().toISOString(),
                  toolUsed: toolId,
                  originalSize,
                  reductionPercent: originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0,
                  engineUsed: (processor as any)?.lastEngineUsed || undefined
                });
              } else {
                // Handle ProcessedFile object format
                const processedFileObj = processedFile as any;
                const fileData = processedFileObj.blob ? 
                  await processedFileObj.blob.arrayBuffer() : 
                  processedFileObj.buffer;
                const originalSize = uint8Array.byteLength;
                const newSize = processedFileObj.size || fileData.byteLength;
                
                processedFiles.push({
                    id: `processed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                    name: processedFileObj.filename || processedFileObj.name,
                    originalName: file.name,
                    size: newSize,
                    type: processedFileObj.mimeType || processedFileObj.type,
                    data: Array.from(new Uint8Array(fileData)),
                    processedAt: new Date().toISOString(),
                    toolUsed: toolId,
                    originalSize,
                    reductionPercent: originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0,
                    engineUsed: (processor as any)?.lastEngineUsed || undefined
                  });
              }
            }
          } else {
            // Single file returned
            // Check if it's a raw Uint8Array or ProcessedFile object
            if (result instanceof Uint8Array) {
              const originalSize = uint8Array.byteLength;
              const newSize = result.length;
              processedFiles.push({
                id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: generateOutputFileName(file.name, toolId),
                originalName: file.name,
                size: newSize,
                type: getOutputMimeType(toolId),
                data: Array.from(result),
                processedAt: new Date().toISOString(),
                toolUsed: toolId,
                originalSize,
                reductionPercent: originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0,
                engineUsed: (processor as any)?.lastEngineUsed || undefined
              });
            } else {
              // Handle ProcessedFile object format
              const resultObj = result as any;
              const fileData = resultObj.blob ? 
                await resultObj.blob.arrayBuffer() : 
                resultObj.buffer;
              const originalSize = uint8Array.byteLength;
              const newSize = resultObj.size || fileData.byteLength;
              
              processedFiles.push({
                  id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: resultObj.filename || resultObj.name,
                  originalName: file.name,
                  size: newSize,
                  type: resultObj.mimeType || resultObj.type,
                  data: Array.from(new Uint8Array(fileData)),
                  processedAt: new Date().toISOString(),
                  toolUsed: toolId,
                  originalSize,
                  reductionPercent: originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0,
                  engineUsed: (processor as any)?.lastEngineUsed || undefined
                });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          
          // Handle specific PDF protection error (feature not supported)
          if (error instanceof Error && error.message.includes('PDF password protection requires server-side processing')) {
            return NextResponse.json({
              success: false,
              error: errorUtils.createError('FEATURE_NOT_AVAILABLE', 'Feature not available', 'PDF password protection is not supported in the browser environment. This feature requires server-side processing with specialized tools. Please use a desktop PDF editor for password protection.')
            } as APIResponse<null>, { status: 400 });
          }
          
          return NextResponse.json({
            success: false,
            error: errorUtils.createError('PROCESSING_FAILED', `Failed to process file: ${file.name}`, error instanceof Error ? error.message : 'Unknown error')
          } as APIResponse<null>, { status: 500 });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: processedFiles,
      message: `Successfully processed ${processedFiles.length} file(s)`
    } as APIResponse<ProcessedFile[]>);
    
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({
      success: false,
      error: errorUtils.createError('INTERNAL_ERROR', 'Internal server error', error instanceof Error ? error.message : 'Unknown error')
    } as APIResponse<null>, { status: 500 });
  }
}

// Helper function to determine output MIME type based on tool
function getOutputMimeType(toolId: string): string {
  switch (toolId) {
    case 'pdf-merge':
    case 'pdf-split':
    case 'pdf-extract':
    case 'pdf-compress':
    case 'pdf-watermark':
    case 'pdf-protect':
    case 'pdf-rotate':
    case 'pdf-ocr':
    case 'pdf-unlock':
    case 'watermark-removal':
      return 'application/pdf';
    case 'images-to-pdf':
      return 'application/pdf';
    default:
      if (toolId.includes('to-images') || toolId.includes('pdf-to-jpg') || toolId.includes('pdf-to-png')) {
        return 'image/jpeg';
      }
      if (toolId.includes('to-word') || toolId.includes('pdf-to-docx')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      if (toolId.includes('to-excel') || toolId.includes('pdf-to-xlsx')) {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      if (toolId.includes('to-powerpoint') || toolId.includes('pdf-to-pptx')) {
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      }
      if (toolId.includes('to-text') || toolId.includes('ocr')) {
        return 'text/plain';
      }
      // Default to PDF
      return 'application/pdf';
  }
}

function generateOutputFileName(originalName: string, toolId: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const isDocx = toolId.includes('to-word') || toolId.includes('pdf-to-docx') || toolId === 'pdf-to-word';
  const extension = isDocx ? '.docx' : '.pdf';
  
  switch (toolId) {
    case 'pdf-unlock':
      return `${baseName}_unlocked${extension}`;
    case 'pdf-compress':
      return `${baseName}_compressed${extension}`;
    case 'pdf-watermark':
      return `${baseName}_watermarked${extension}`;
    case 'pdf-protect':
      return `${baseName}_protected${extension}`;
    case 'pdf-rotate':
      return `${baseName}_rotated${extension}`;
    case 'watermark-removal':
      return `${baseName}_watermark_removed${extension}`;
    case 'pdf-to-word':
      return `${baseName}_converted${extension}`;
    default:
      return `${baseName}_processed${extension}`;
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'PDF Processing API is running',
    endpoints: {
      process: 'POST /api/process - Process PDF files',
      upload: 'POST /api/upload - Upload files for processing',
      download: 'GET /api/download/[id] - Download processed files'
    }
  });
}