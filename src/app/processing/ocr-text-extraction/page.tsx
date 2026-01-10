'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Upload, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import OCRScannerTool from '@/components/tools/OCRScannerTool';

export default function OCRTextExtractionProcessingPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  const handleStartProcessing = async (files: File[], options?: any) => {
    setIsProcessing(true);
    setProcessingStatus('processing');
    setErrorMessage('');
    setExtractedText('');
    setProcessedFiles([]);
    
    try {
      // OCRScannerTool processes client-side and passes results in options
      if (options && options.results && options.results.length > 0) {
        const results = options.results;
        const processedData = results.map((r: any) => ({
             name: r.fileName.replace(/\.[^/.]+$/, ".txt"),
             data: r.text, 
             type: 'text/plain'
        }));
        
        setProcessedFiles(processedData);
        setProcessingStatus('success');
        
        // Extract text content for preview
        const textContent = results.map((r: any) => r.text).join('\n\n');
        setExtractedText(textContent);
        
        // Auto-download processed files
        processedData.forEach((processedFile: any) => {
          const blob = new Blob([processedFile.data], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = processedFile.name || `extracted-text-${Date.now()}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
         // Fallback if no results provided (shouldn't happen with OCRScannerTool)
         throw new Error('No OCR results received');
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
    setExtractedText('');
    setProcessedFiles([]);
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-text-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
                <FileText className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">OCR Text Extraction</h1>
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
                  <span className="text-blue-800 font-medium">Extracting text from PDF...</span>
                </>
              )}
              {processingStatus === 'success' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Text extraction completed successfully! {extractedText.length} characters extracted.
                  </span>
                </>
              )}
              {processingStatus === 'error' && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <span className="text-red-800 font-medium">Text extraction failed</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Extract Text from PDF</h2>
              <p className="text-gray-600">
                Upload your PDF files and extract all text content using advanced OCR technology
              </p>
            </div>
            
            <OCRScannerTool 
              onProcess={handleStartProcessing} 
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Text Preview */}
        {extractedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Extracted Text Preview</h3>
                </div>
                <button
                  onClick={downloadText}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Text</span>
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {extractedText}
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Upload className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Advanced OCR</h3>
            <p className="text-gray-600 text-sm">
              Extract text from scanned PDFs and images with high accuracy using advanced OCR technology.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FileText className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Text Preservation</h3>
            <p className="text-gray-600 text-sm">
              Maintain original text formatting and structure while extracting content from PDF documents.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Download className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Formats</h3>
            <p className="text-gray-600 text-sm">
              Export extracted text in various formats including plain text, with preview capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}