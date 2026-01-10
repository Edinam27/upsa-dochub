'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
  Eye
} from 'lucide-react';
import { useFileUploadStore } from '@/lib/store';
import { fileUtils, cn } from '@/lib/utils';
import { FileInfo } from '@/lib/types';

// Default values outside component to prevent re-creation
const DEFAULT_ACCEPTED_TYPES = ['.pdf', 'application/pdf'];

interface FileUploadProps {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
  onFilesAdded?: (files: FileInfo[]) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

export default function FileUpload({
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  onFilesAdded,
  disabled = false,
  showPreview = true
}: FileUploadProps) {
  const {
    files,
    isDragOver,
    error,
    addFiles,
    removeFile,
    clearFiles,
    setDragOver,
    setError,
    setUploadConfig
  } = useFileUploadStore();

  // Set upload configuration when component mounts
  React.useEffect(() => {
    setUploadConfig({ maxFiles, maxFileSize, acceptedTypes });
  }, [maxFiles, maxFileSize, acceptedTypes]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    addFiles(acceptedFiles);
  }, [addFiles, setError]);

  // Call onFilesAdded when files change
  React.useEffect(() => {
    if (files.length > 0) {
      onFilesAdded?.(files);
    }
  }, [files]); // Removed onFilesAdded from dependencies to prevent infinite loops

  const onDragEnter = useCallback(() => {
    setDragOver(true);
  }, [setDragOver]);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, [setDragOver]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: acceptedTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        acc[`application/${type.slice(1)}`] = [type];
      } else {
        acc[type] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize: maxFileSize,
    disabled,
    multiple: maxFiles > 1
  });

  const getFileIcon = (file: FileInfo) => {
    if (file.file && fileUtils.isPDF(file.file)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (file.file && fileUtils.isImage(file.file)) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: FileInfo['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleDownload = (file: FileInfo) => {
    if (file.result?.blob) {
      fileUtils.downloadFile(file.result.blob, file.result.name);
    }
  };

  const handlePreview = (file: FileInfo) => {
    if (file.preview) {
      window.open(file.preview, '_blank');
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
          'hover:border-upsa-gold hover:bg-upsa-gold/5',
          isDragActive || isDragOver
            ? 'border-upsa-gold bg-upsa-gold/10 scale-[1.02]'
            : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50'
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="space-y-4"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-upsa-blue to-upsa-gold rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop files here' : 'Upload your files'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or{' '}
              <span className="text-upsa-gold font-medium">browse</span>
            </p>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: {acceptedTypes.join(', ')}</p>
              <p>Maximum file size: {fileUtils.formatFileSize(maxFileSize)}</p>
              <p>Maximum files: {maxFiles}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Overlay for drag state */}
        <AnimatePresence>
          {(isDragActive || isDragOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-upsa-gold/20 rounded-xl flex items-center justify-center"
            >
              <div className="text-upsa-gold font-semibold text-lg">
                Drop files here
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">Upload Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Uploaded Files ({files.length})
            </h4>
            {files.length > 1 && (
              <button
                onClick={clearFiles}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h5>
                        {getStatusIcon(file.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {fileUtils.formatFileSize(file.size)}
                        </span>
                        
                        {file.status === 'processing' && file.progress !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-upsa-gold h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {file.progress}%
                            </span>
                          </div>
                        )}
                        
                        {file.status === 'error' && file.error && (
                          <span className="text-xs text-red-500">
                            {file.error}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {file.status === 'completed' && file.result && (
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      
                      {showPreview && file.preview && (
                        <button
                          onClick={() => handlePreview(file)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}