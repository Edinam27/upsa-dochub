'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, Download, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PDFToImagesTool from '@/components/tools/PDFToImagesTool';

export default function PDFToImagesProcessingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  const handleStartProcessing = async (files: File[], options?: any) => {
    setIsProcessing(true);
    setProcessingStatus('processing');
    setErrorMessage('');
    setProcessedFiles([]);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('toolId', 'pdf-to-images');
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      // Handle the processed files
      if (result.data && result.data.length > 0) {
        setProcessedFiles(result.data);
        setProcessingStatus('success');
        
        // Auto-download processed files
        result.data.forEach((processedFile: any) => {
          const uint8Array = new Uint8Array(processedFile.data);
          const blob = new Blob([uint8Array], { type: processedFile.type });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = processedFile.name || `image-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
        throw new Error('No processed files received');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcessing = () => {
    setProcessingStatus('idle');
    setErrorMessage('');
    setProcessedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/tools"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Tools</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Image className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">PDF to Images Converter</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {processingStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-lg border",
              processingStatus === 'processing' && "bg-blue-50 border-blue-200",
              processingStatus === 'success' && "bg-green-50 border-green-200",
              processingStatus === 'error' && "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-center space-x-3">
              {processingStatus === 'processing' && (
                <>
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="text-blue-800 font-medium">Converting PDF to Images...</span>
                </>
              )}
              {processingStatus === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Conversion completed successfully! {processedFiles.length} image(s) generated.
                  </span>
                </>
              )}
              {processingStatus === 'error' && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <span className="text-red-800 font-medium">Conversion failed</span>
                    <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                  </div>
                </>
              )}
            </div>
            {(processingStatus === 'success' || processingStatus === 'error') && (
              <button
                onClick={resetProcessing}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Process another file
              </button>
            )}
          </motion.div>
        )}

        {/* Tool Component */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Convert PDF to Images</h2>
              <p className="text-gray-600">
                Upload your PDF files and convert each page to high-quality images (PNG/JPG)
              </p>
            </div>
            
            <PDFToImagesTool 
              onProcess={handleStartProcessing} 
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Upload className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Batch Processing</h3>
            <p className="text-gray-600 text-sm">
              Convert multiple PDF files at once, with each page extracted as a separate image.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Image className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">High Resolution</h3>
            <p className="text-gray-600 text-sm">
              Generate high-quality images with customizable resolution and format options.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Download className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Formats</h3>
            <p className="text-gray-600 text-sm">
              Export images in PNG, JPG, or other popular formats based on your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}