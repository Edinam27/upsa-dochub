import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { fileUtils } from '@/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 });
    }
    
    // Extract filename from URL
    const url = new URL(request.url);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || id;
    
    // Look for file in uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const filepath = join(uploadsDir, filename);
    
    if (!existsSync(filepath)) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    
    try {
      // Read file
      const fileBuffer = await readFile(filepath);
      
      // Determine content type
      const extension = fileUtils.getFileExtension(filename);
      const contentType = getContentType(extension);
      
      // Get original filename from query params if provided
      const originalName = url.searchParams.get('name') || filename;
      
      // Create response with file
      const response = new NextResponse(fileBuffer as BodyInit);
      
      // Set headers
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
      response.headers.set('Content-Length', fileBuffer.length.toString());
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
      
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to read file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to determine content type based on file extension
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed'
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'File ID is required'
      }, { status: 400 });
    }
    
    // Extract filename from URL
    const url = new URL(request.url);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || id;
    
    // Look for file in uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const filepath = join(uploadsDir, filename);
    
    if (!existsSync(filepath)) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }
    
    try {
      // Delete file
      const { unlink } = await import('fs/promises');
      await unlink(filepath);
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}