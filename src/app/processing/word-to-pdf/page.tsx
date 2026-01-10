'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import WordToPDFTool from '@/components/tools/WordToPDFTool';

import { createPDFProcessor } from '@/lib/pdf-processors';

export default function WordToPDFProcessingPage() {
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
      const processor = createPDFProcessor('word-to-pdf', options);
      if (!processor) {
        throw new Error('Processor not found for word-to-pdf');
      }

      const results: any[] = [];
      for (const file of files) {
        // Cast to any to access process method generically
        const fileResults = await (processor as any).process(file);
        if (Array.isArray(fileResults)) {
          results.push(...fileResults);
        } else {
          results.push(fileResults);
        }
      }

      // Handle the processed files
      if (results.length > 0) {
        setProcessedFiles(results);
        setProcessingStatus('success');
        
        // Auto-download processed files
        results.forEach((processedFile: any) => {
          let url = processedFile.downloadUrl;
          let shouldRevoke = false;

          if (!url && processedFile.data) {
             const uint8Array = new Uint8Array(processedFile.data);
             const blob = new Blob([uint8Array], { type: processedFile.type });
             url = URL.createObjectURL(blob);
             shouldRevoke = true;
          } else if (!url && processedFile.blob) {
             url = URL.createObjectURL(processedFile.blob);
             shouldRevoke = true;
          }

          if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = processedFile.name || `converted-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (shouldRevoke) URL.revokeObjectURL(url);
          }
        });
      } else {
        throw new Error('No processed files generated');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Word to PDF Converter</h1>
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
                  <span className="text-blue-800 font-medium">Converting Word to PDF...</span>
                </>
              )}
              {processingStatus === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Conversion completed successfully! {processedFiles.length} file(s) processed.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Word to PDF Converter</h2>
              <p className="text-gray-600">
                Convert Word documents to PDF format quickly and easily.
              </p>
            </div>
            
            <WordToPDFTool 
              onProcess={handleStartProcessing} 
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Upload className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-gray-600 text-sm">
              Simply drag and drop your Word files or click to browse and select them.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FileText className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
            <p className="text-gray-600 text-sm">
              Maintains text content and basic structure while converting to PDF.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Download className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Instant Download</h3>
            <p className="text-gray-600 text-sm">
              Download your converted PDF documents immediately after processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
