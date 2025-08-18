import { NextRequest, NextResponse } from 'next/server';
import { createPDFProcessor } from '@/lib/pdf-processors';

// Test direct import
console.log('createPDFProcessor function:', createPDFProcessor);
console.log('createPDFProcessor type:', typeof createPDFProcessor);
console.error('createPDFProcessor function:', createPDFProcessor);
console.error('createPDFProcessor type:', typeof createPDFProcessor);

export async function GET(request: NextRequest) {
  console.log('=== TEST PROCESSOR ENDPOINT ===');
  console.error('=== TEST PROCESSOR ENDPOINT (ERROR LOG) ===');
  
  try {
    const testOptions = {
      annotations: [
        {
          id: 'test',
          type: 'text',
          x: 100,
          y: 100,
          color: '#FF0000',
          page: 1,
          text: 'test annotation'
        }
      ]
    };
    
    console.log('Creating processor with test options:', testOptions);
    console.error('Creating processor with test options:', testOptions);
    
    console.log('About to call createPDFProcessor function...');
    console.error('About to call createPDFProcessor function...');
    
    let processor;
    try {
      console.log('Calling createPDFProcessor with type: pdf-annotate');
      console.error('Calling createPDFProcessor with type: pdf-annotate');
      processor = createPDFProcessor('pdf-annotate', testOptions);
      console.log('createPDFProcessor call completed without throwing');
      console.error('createPDFProcessor call completed without throwing');
    } catch (createError) {
      console.error('ERROR: createPDFProcessor threw an exception:', createError);
      console.error('ERROR: createPDFProcessor error message:', createError.message);
      console.error('ERROR: createPDFProcessor error stack:', createError.stack);
      throw createError;
    }
    
    console.log('createPDFProcessor function returned:', processor);
    console.error('createPDFProcessor function returned:', processor);
    console.log('Processor created:', !!processor);
    console.error('Processor created:', !!processor);
    
    return NextResponse.json({
      success: true,
      processorCreated: !!processor,
      processorType: processor?.constructor?.name
    });
  } catch (error) {
    console.error('Test processor error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}