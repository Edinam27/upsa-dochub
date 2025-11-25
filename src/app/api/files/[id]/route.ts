import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
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
      // Get file stats
      const stats = await stat(filepath);
      
      // Check if client has cached version
      const ifModifiedSince = request.headers.get('if-modified-since');
      const lastModified = stats.mtime.toUTCString();
      
      if (ifModifiedSince && ifModifiedSince === lastModified) {
        return new NextResponse(null, { status: 304 });
      }
      
      // Read file
      const fileBuffer = await readFile(filepath);
      
      // Determine content type
      const extension = fileUtils.getFileExtension(filename);
      const contentType = getContentType(extension);
      
      // Check if it's a preview request
      const isPreview = url.searchParams.get('preview') === 'true';
      
      // Create response with file
      const response = new NextResponse(fileBuffer as BodyInit);
      
      // Set headers
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Length', fileBuffer.length.toString());
      response.headers.set('Last-Modified', lastModified);
      response.headers.set('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
      
      if (isPreview) {
        // For preview, allow inline display
        response.headers.set('Content-Disposition', 'inline');
        response.headers.set('Cache-Control', 'public, max-age=3600');
      } else {
        // For download, force attachment
        const originalName = url.searchParams.get('name') || filename;
        response.headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      
      // CORS headers for browser access
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
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
    console.error('File serve error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    if (!id) {
      return new NextResponse(null, { status: 400 });
    }
    
    // Extract filename from URL
    const url = new URL(request.url);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || id;
    
    // Look for file in uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const filepath = join(uploadsDir, filename);
    
    if (!existsSync(filepath)) {
      return new NextResponse(null, { status: 404 });
    }
    
    try {
      // Get file stats
      const stats = await stat(filepath);
      
      // Determine content type
      const extension = fileUtils.getFileExtension(filename);
      const contentType = getContentType(extension);
      
      // Create response with headers only
      const response = new NextResponse(null);
      
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Length', stats.size.toString());
      response.headers.set('Last-Modified', stats.mtime.toUTCString());
      response.headers.set('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
      response.headers.set('Accept-Ranges', 'bytes');
      
      return response;
      
    } catch (error) {
      console.error('Error getting file stats:', error);
      return new NextResponse(null, { status: 500 });
    }
    
  } catch (error) {
    console.error('File head error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
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
    '.7z': 'application/x-7z-compressed',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript'
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}