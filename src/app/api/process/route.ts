import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { createPDFProcessor } from '@/lib/pdf-processors/index';
import { ProcessingOptions, APIResponse, ProcessedFile } from '@/lib/types';
import { fileUtils } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const file = formData.get('file') as File; // For single file uploads
    const toolId = formData.get('toolId') as string;
    const options = JSON.parse(formData.get('options') as string || '{}') as ProcessingOptions;
    const annotations = formData.get('annotations') ? JSON.parse(formData.get('annotations') as string) : [];
    
    // Use either files array or single file
    const fileList = files.length > 0 ? files : (file ? [file] : []);
    
    if (!fileList || fileList.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      } as APIResponse<null>, { status: 400 });
    }
    
    if (!toolId) {
      return NextResponse.json({
        success: false,
        error: 'Tool ID is required'
      } as APIResponse<null>, { status: 400 });
    }
    
    // Create processor instance with annotations for pdf-annotate tool
    const processorOptions = toolId === 'pdf-annotate' ? { ...options, annotations } : options;
    
    let processor;
    try {
      processor = createPDFProcessor(toolId, processorOptions);
    } catch (error) {
      console.error('Error creating PDF processor:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        success: false,
        error: `Invalid tool ID: ${toolId}. Error: ${error.message}`
      } as APIResponse<null>, { status: 400 });
    }
    
    if (!processor) {
      console.error('Processor is null after creation');
      return NextResponse.json({
        success: false,
        error: 'Failed to create processor'
      } as APIResponse<null>, { status: 500 });
    }
    
    const processedFiles: ProcessedFile[] = [];
    
    // Handle pdf-annotate tool specially
    if (toolId === 'pdf-annotate') {
      try {
        const pdfFile = fileList[0];
        if (!pdfFile || pdfFile.size === 0) {
          throw new Error('Invalid or empty PDF file');
        }
        
        // Process the PDF with annotations using the PDFAnnotator
        const result = await processor.process(pdfFile);
        
        // Convert the result to the expected format
        const pdfBytes = await result.blob!.arrayBuffer();
        
        processedFiles.push({
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: result.name,
          originalName: pdfFile.name,
          size: result.size,
          type: result.type,
          data: Array.from(new Uint8Array(pdfBytes)),
          processedAt: new Date().toISOString(),
          toolUsed: toolId
        });
      } catch (error) {
        console.error('Error processing PDF annotations:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to process PDF annotations',
          details: error instanceof Error ? error.message : 'Unknown error'
        } as APIResponse<null>, { status: 500 });
      }
    } else if (toolId === 'images-to-pdf') {
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
        
        processedFiles.push({
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `images_to_pdf_${Date.now()}.pdf`,
          originalName: `${files.length}_images_combined.pdf`,
          size: result.byteLength,
          type: getOutputMimeType(toolId),
          data: Array.from(result),
          processedAt: new Date().toISOString(),
          toolUsed: toolId
        });
      } catch (error) {
        console.error('Error processing images to PDF:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to process images to PDF',
          details: error instanceof Error ? error.message : 'Unknown error'
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
        
        processedFiles.push({
          id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `merged_${Date.now()}.pdf`,
          originalName: `merged_${fileList.length}_files.pdf`,
          size: result.byteLength,
          type: getOutputMimeType(toolId),
          data: Array.from(result),
          processedAt: new Date().toISOString(),
          toolUsed: toolId
        });
      } catch (error) {
        console.error('Error merging PDF files:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to merge PDF files',
          details: error instanceof Error ? error.message : 'Unknown error'
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
          const result = await processor.process(file, options);
          
          // Handle both single and multiple file outputs
          if (Array.isArray(result)) {
            // Multiple files returned (e.g., PDF split)
            for (let index = 0; index < result.length; index++) {
              const processedFile = result[index];
              const fileData = await processedFile.blob.arrayBuffer();
              
              processedFiles.push({
                id: `processed_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                name: processedFile.name,
                originalName: file.name,
                size: processedFile.size,
                type: processedFile.type,
                data: Array.from(new Uint8Array(fileData)),
                processedAt: new Date().toISOString(),
                toolUsed: toolId
              });
            }
          } else {
            // Single file returned
            const fileData = await result.blob.arrayBuffer();
            
            processedFiles.push({
              id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: result.name,
              originalName: file.name,
              size: result.size,
              type: result.type,
              data: Array.from(new Uint8Array(fileData)),
              processedAt: new Date().toISOString(),
              toolUsed: toolId
            });
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return NextResponse.json({
            success: false,
            error: `Failed to process file: ${file.name}`,
            details: error instanceof Error ? error.message : 'Unknown error'
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
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse<null>, { status: 500 });
  }
}

// Helper function to determine output MIME type based on tool
function getOutputMimeType(toolId: string): string {
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