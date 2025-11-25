import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { APIResponse, FileInfo } from '@/lib/types';
import { fileUtils, errorUtils } from '@/lib/utils';

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('INVALID_INPUT', 'No files provided')
      } as APIResponse<null>, { status: 400 });
    }
    
    const uploadedFiles: FileInfo[] = [];
    const errors: string[] = [];
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Process each file
    for (const file of files) {
      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`File ${file.name} is too large. Maximum size is ${fileUtils.formatFileSize(MAX_FILE_SIZE)}`);
          continue;
        }
        
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`File ${file.name} has unsupported type: ${file.type}`);
          continue;
        }
        
        // Generate unique filename
        const fileId = fileUtils.generateFileId();
        const extension = fileUtils.getFileExtension(file.name);
        const filename = `${fileId}${extension}`;
        const filepath = join(uploadsDir, filename);
        
        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        // Create file info
        const fileInfo: FileInfo = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          path: filepath,
          url: `/api/files/${fileId}${extension}`
        };
        
        uploadedFiles.push(fileInfo);
        
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Return response
    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: errorUtils.createError('PROCESSING_FAILED', 'No files were uploaded successfully')
      } as APIResponse<null>, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      warnings: errors.length > 0 ? errors : undefined
    } as APIResponse<FileInfo[]>);
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: errorUtils.createError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error')
    } as APIResponse<null>, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'File Upload API is running',
    limits: {
      maxFileSize: fileUtils.formatFileSize(MAX_FILE_SIZE),
      allowedTypes: ALLOWED_TYPES
    },
    endpoints: {
      upload: 'POST /api/upload - Upload files',
      files: 'GET /api/files/[id] - Retrieve uploaded files'
    }
  });
}