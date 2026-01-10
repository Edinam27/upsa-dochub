
'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ArrowLeft,
  FileText,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { createPDFProcessor } from '@/lib/pdf-processors';
import { getFileFromStore, StoredFile } from '@/lib/file-store';

function CompressPDFContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<Blob | null>(null);
  const [stats, setStats] = useState({ originalSize: 0, newSize: 0 });
  
  const processingRef = useRef(false);

  useEffect(() => {
    const loadAndProcess = async () => {
      if (!id) {
        setStatus('error');
        setError('No file ID provided');
        return;
      }

      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const stored = await getFileFromStore(id);
        if (!stored) {
          throw new Error('File not found or expired');
        }

        setOriginalFile(stored.file);
        setStatus('processing');
        
        // Use the centralized PDF processor
        const processor = createPDFProcessor('compress', stored.options);
        if (!processor) throw new Error('Failed to create PDF processor');

        // The processor handles the heavy lifting (including rasterization if requested)
        const results = await processor.process(stored.file);
        const result = Array.isArray(results) ? results[0] : results;
        
        if (!result || !result.blob) {
            throw new Error('Processing failed to produce a valid result');
        }

        setCompressedPdf(result.blob);
        setStats({
          originalSize: stored.file.size,
          newSize: result.size
        });
        setStatus('success');
        setProgress(100);
        
      } catch (err) {
        console.error('Processing error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    loadAndProcess();
  }, [id]);

  const handleDownload = () => {
    if (!compressedPdf || !originalFile) return;
    
    const url = URL.createObjectURL(compressedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/tools/compress-pdf"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-semibold text-gray-900">Compress PDF</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    className="text-orange-500 transition-all duration-300 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700">{progress}%</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compressing your PDF...</h2>
              <p className="text-gray-500">Converting pages and optimizing images</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compression Complete!</h2>
              <p className="text-gray-600 mb-8">Your PDF has been successfully optimized.</p>

              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-10">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Original Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatFileSize(stats.originalSize)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Compressed Size</p>
                  <p className="text-lg font-bold text-green-700">{formatFileSize(stats.newSize)}</p>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full mt-2 inline-block">
                    {Math.round((1 - stats.newSize / stats.originalSize) * 100)}% Reduction
                  </span>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/30 transition-all flex items-center space-x-3 transform hover:-translate-y-1"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
              
              <div className="mt-8">
                <Link 
                  href="/tools/compress-pdf"
                  className="text-gray-500 hover:text-orange-600 transition-colors"
                >
                  Compress another file
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compression Failed</h2>
              <p className="text-red-600 mb-8 max-w-md mx-auto">{error}</p>
              <Link 
                href="/tools/compress-pdf"
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Try Again
              </Link>
            </div>
          )}

          {/* Loading State (Initial) */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-500">Initializing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompressPDFProcessingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <CompressPDFContent />
    </Suspense>
  );
}
