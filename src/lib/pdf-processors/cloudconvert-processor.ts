import CloudConvert from 'cloudconvert';
import { ProcessingOptions, ProcessedFile } from '../types';
import { PDFProcessor } from './index';

export class CloudConvertPDFProcessor extends PDFProcessor {
  private cloudConvert: CloudConvert;
  private apiKey: string;
  protected options: ProcessingOptions;

  constructor(options: ProcessingOptions = {}) {
    super(options);
    this.options = {
      quality: 'medium',
      compression: 0.8,
      ...options
    };
    this.apiKey = process.env.CLOUDCONVERT_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('CloudConvert API key is required. Please set CLOUDCONVERT_API_KEY in your environment variables.');
    }
    this.cloudConvert = new CloudConvert(this.apiKey);
  }

  async process(file: File, conversionOptions?: any): Promise<ProcessedFile> {
    try {
      console.log(`Starting CloudConvert PDF to Word conversion for: ${file.name}`);
      
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // Convert using CloudConvert
      const convertedBuffer = await this.convertPDFToWord(fileBuffer, file.name);
      
      // Create output filename
      const outputFilename = file.name.replace(/\.pdf$/i, '.docx');
      
      // Create blob from buffer
      const blob = new Blob([new Uint8Array(convertedBuffer)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      return {
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: outputFilename,
        originalName: file.name,
        size: convertedBuffer.length,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        data: Array.from(new Uint8Array(convertedBuffer)),
        processedAt: new Date().toISOString(),
        toolUsed: 'pdf-to-word',
        blob: blob
      };
    } catch (error) {
      console.error('CloudConvert PDF to Word conversion failed:', error);
      throw new Error(`CloudConvert conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async convertPDFToWord(fileBuffer: Buffer, originalFileName: string): Promise<Buffer> {
    const maxRetries = 3;
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting CloudConvert PDF to Word conversion for: ${originalFileName} (attempt ${attempt}/${maxRetries})`);
        
        // Create a job for PDF to DOCX conversion
        const job = await this.cloudConvert.jobs.create({
          tasks: {
            'import-pdf': {
              operation: 'import/upload'
            },
            'convert-to-word': {
              operation: 'convert',
              input: 'import-pdf',
              input_format: 'pdf',
              output_format: 'docx',
              options: {
                // Optimize for text extraction and formatting
                optimize_for_print: false,
                optimize_for_web: true
              }
            },
            'export-word': {
              operation: 'export/url',
              input: 'convert-to-word'
            }
          }
        });

        console.log(`CloudConvert job created with ID: ${job.id}`);

        // Upload the PDF file
        const uploadTask = job.tasks.filter(task => task.name === 'import-pdf')[0];
        if (!uploadTask || !uploadTask.result?.form) {
          throw new Error('Failed to get upload form from CloudConvert');
        }

        // Upload file using the form data with timeout
        const formData = new FormData();
        Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('file', new Blob([new Uint8Array(fileBuffer)]), originalFileName);

        const uploadController = new AbortController();
        const uploadTimeoutId = setTimeout(() => uploadController.abort(), 120000); // 2 minute timeout

        try {
          const uploadResponse = await fetch(uploadTask.result.form.url, {
            method: 'POST',
            body: formData,
            signal: uploadController.signal
          });
          clearTimeout(uploadTimeoutId);

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }
        } catch (uploadError) {
          clearTimeout(uploadTimeoutId);
          throw uploadError;
        }

        console.log('File uploaded successfully to CloudConvert');

        // Wait for the job to complete with timeout (10 minutes)
        const completedJob = await Promise.race([
          this.cloudConvert.jobs.wait(job.id),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('CloudConvert job timeout after 10 minutes')), 600000)
          )
        ]) as any;
        
        if (completedJob.status !== 'finished') {
          throw new Error(`Conversion failed with status: ${completedJob.status}`);
        }

        console.log('CloudConvert job completed successfully');

        // Get the export task to download the converted file
        const exportTask = completedJob.tasks.filter((task: any) => task.name === 'export-word')[0];
        if (!exportTask || !exportTask.result?.files?.[0]?.url) {
          throw new Error('Failed to get download URL from CloudConvert');
        }

        // Download the converted Word document with timeout
        const downloadController = new AbortController();
        const downloadTimeoutId = setTimeout(() => downloadController.abort(), 120000); // 2 minute timeout

        try {
          const downloadResponse = await fetch(exportTask.result.files[0].url, {
            signal: downloadController.signal
          });
          clearTimeout(downloadTimeoutId);

          if (!downloadResponse.ok) {
            throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
          }

          const convertedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
          console.log(`CloudConvert conversion completed. Output size: ${convertedBuffer.length} bytes`);
          
          return convertedBuffer;
        } catch (downloadError) {
          clearTimeout(downloadTimeoutId);
          throw downloadError;
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`CloudConvert conversion attempt ${attempt} failed:`, lastError.message);

        // Handle specific error types
        if (this.isRateLimitError(lastError)) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
          console.log(`Rate limit detected, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (this.isQuotaExceededError(lastError)) {
          throw new Error('CloudConvert quota exceeded. Please try again later or upgrade your plan.');
        }

        if (this.isAuthenticationError(lastError)) {
          throw new Error('CloudConvert authentication failed. Please check your API key configuration.');
        }

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry for other errors
        const waitTime = 1000 * attempt;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error(`CloudConvert conversion failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  private isRateLimitError(error: Error): boolean {
    return error.message.includes('rate limit') || 
           error.message.includes('429') ||
           error.message.includes('Too Many Requests');
  }

  private isQuotaExceededError(error: Error): boolean {
    return error.message.includes('quota') ||
           error.message.includes('limit exceeded') ||
           error.message.includes('402');
  }

  private isAuthenticationError(error: Error): boolean {
    return error.message.includes('401') ||
           error.message.includes('unauthorized') ||
           error.message.includes('authentication') ||
           error.message.includes('invalid api key');
  }

  async getConversionInfo(): Promise<{ service: string; features: string[] }> {
    return {
      service: 'CloudConvert API',
      features: [
        'High-quality PDF to Word conversion',
        'Preserves formatting and layout',
        'Handles complex documents with images and tables',
        'Professional-grade conversion engine',
        'Cloud-based processing for reliability'
      ]
    };
  }
}