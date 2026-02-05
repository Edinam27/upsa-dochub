
'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Zap, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { saveFileToStore } from '@/lib/file-store';

interface CompressPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

const CompressPDFTool: React.FC<CompressPDFToolProps> = ({ onProcess, isProcessing: externalProcessing }) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'grayscale' | 'extreme'>('grayscale');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const compressionOptions = {
    grayscale: {
      name: 'Convert to Grayscale',
      description: 'Converts document to black & white. Best for text documents and forms.',
      quality: 0.8,
      grayscale: true,
      useRasterization: true,
      estimatedPercent: 50
    },
    extreme: {
      name: 'Extreme Compression',
      description: 'Maximum compression by rasterizing content. Best for archiving.',
      quality: 0.4,
      grayscale: false,
      useRasterization: true,
      estimatedPercent: 85
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleCompress = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const selectedOption = compressionOptions[compressionLevel];
      const options = {
        operation: 'compress',
        compressionLevel,
        quality: selectedOption.quality,
        grayscale: selectedOption.grayscale,
        useRasterization: selectedOption.useRasterization
      };
      await onProcess([file], options);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error starting compression:', err);
      setError('Failed to start compression. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
            ${
              isDragActive
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop PDF file here' : 'Upload PDF File'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              PDF files only
            </span>
            <span>Max 100MB</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-600">
                    Size: {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={isProcessing}
              >
                Change File
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(compressionOptions).map(([level, option]) => (
              <button
                key={level}
                onClick={() => setCompressionLevel(level as 'grayscale' | 'extreme')}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all duration-200
                  ${
                    compressionLevel === level
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">
                    {option.name}
                  </h5>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {option.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600 font-medium">
                    ~{option.estimatedPercent}% reduction
                  </span>
                </div>
              </button>
            ))}
          </div>



          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                ${
                  !isProcessing
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Compress PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressPDFTool;
