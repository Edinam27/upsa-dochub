'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Zap, 
  Download,
  AlertCircle,
  Loader2,
  Info,
  BarChart3
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CompressPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

type CompressionLevel = 'low' | 'medium' | 'high' | 'maximum';

const CompressPDFTool: React.FC<CompressPDFToolProps> = ({ onProcess, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [error, setError] = useState<string>('');
  const [estimatedReduction, setEstimatedReduction] = useState<number>(0);

  const compressionOptions = {
    low: {
      name: 'Low Compression',
      description: 'Minimal compression, best quality',
      reduction: '10-20%',
      quality: 'Excellent',
      estimatedPercent: 15
    },
    medium: {
      name: 'Medium Compression',
      description: 'Balanced compression and quality',
      reduction: '30-50%',
      quality: 'Very Good',
      estimatedPercent: 40
    },
    high: {
      name: 'High Compression',
      description: 'Strong compression, good quality',
      reduction: '50-70%',
      quality: 'Good',
      estimatedPercent: 60
    },
    maximum: {
      name: 'Maximum Compression',
      description: 'Highest compression, acceptable quality',
      reduction: '70-85%',
      quality: 'Acceptable',
      estimatedPercent: 75
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Calculate estimated reduction
      const reduction = compressionOptions[compressionLevel].estimatedPercent;
      setEstimatedReduction(reduction);
    }
  }, [compressionLevel]);

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

    const options = {
      operation: 'compress',
      compressionLevel,
      quality: compressionOptions[compressionLevel].quality.toLowerCase()
    };

    try {
      await onProcess([file], options);
    } catch (err) {
      setError('Failed to compress PDF. Please try again.');
    }
  };

  const handleCompressionChange = (level: CompressionLevel) => {
    setCompressionLevel(level);
    if (file) {
      const reduction = compressionOptions[level].estimatedPercent;
      setEstimatedReduction(reduction);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstimatedSize = () => {
    if (!file) return 0;
    return file.size * (1 - estimatedReduction / 100);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {isDragActive ? 'Drop PDF file here' : 'Upload PDF File'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </motion.div>
      )}

      {/* File Info */}
      {file && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Original size: {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            {estimatedReduction > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Estimated reduction: {estimatedReduction}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New size: ~{formatFileSize(getEstimatedSize())}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compression Options */}
      {file && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Compression Level
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(compressionOptions).map(([level, option]) => (
              <button
                key={level}
                onClick={() => handleCompressionChange(level as CompressionLevel)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all duration-200
                  ${
                    compressionLevel === level
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {option.name}
                  </h5>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-4 rounded-sm ${
                          i < (level === 'low' ? 1 : level === 'medium' ? 2 : level === 'high' ? 3 : 4)
                            ? 'bg-orange-500'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {option.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {option.reduction} reduction
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Quality: {option.quality}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Compression Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <h5 className="font-medium text-gray-900 dark:text-white">
                Compression Preview
              </h5>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Original Size:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated New Size:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatFileSize(getEstimatedSize())}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Space Saved:</span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatFileSize(file.size - getEstimatedSize())} ({estimatedReduction}%)
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Size Reduction</span>
                  <span>{estimatedReduction}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${estimatedReduction}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Compression Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Higher compression may reduce image quality in your PDF</li>
                <li>• Text-heavy PDFs compress better than image-heavy ones</li>
                <li>• You can always try different levels to find the best balance</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCompress}
          disabled={!file || isProcessing}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              file && !isProcessing
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Compressing...</span>
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
  );
};

export default CompressPDFTool;