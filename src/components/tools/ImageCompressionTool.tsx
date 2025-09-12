'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon,
  X, 
  Download,
  AlertCircle,
  Loader2,
  Settings,
  Info,
  CheckCircle,
  Minimize2,
  FileImage
} from 'lucide-react';

interface ImageCompressionToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface CompressionOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'original';
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  removeMetadata: boolean;
}

interface CompressedImage {
  originalFile: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
}

export default function ImageCompressionTool({ onProcess, isProcessing }: ImageCompressionToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<CompressionOptions>({
    quality: 80,
    format: 'jpeg',
    maxWidth: 1920,
    maxHeight: 1080,
    maintainAspectRatio: true,
    removeMetadata: true
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length !== acceptedFiles.length) {
      setError('Only image files are supported');
      return;
    }

    if (imageFiles.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setFiles(imageFiles);
    setError('');
    setCompressedImages([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleOptionChange = (key: keyof CompressionOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const compressImage = async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (options.maintainAspectRatio) {
          const aspectRatio = width / height;
          if (width > options.maxWidth) {
            width = options.maxWidth;
            height = width / aspectRatio;
          }
          if (height > options.maxHeight) {
            height = options.maxHeight;
            width = height * aspectRatio;
          }
        } else {
          width = Math.min(width, options.maxWidth);
          height = Math.min(height, options.maxHeight);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        const outputFormat = options.format === 'original' ? file.type : `image/${options.format}`;
        const quality = options.quality / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressionRatio = ((file.size - blob.size) / file.size) * 100;
              resolve({
                originalFile: file,
                compressedBlob: blob,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio,
                fileName: file.name.replace(/\.[^/.]+$/, '') + 
                  (options.format === 'original' ? '' : `.${options.format}`)
              });
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setIsCompressing(true);
    setError('');
    setProgress(0);
    setCompressedImages([]);

    try {
      const compressed: CompressedImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const compressedImage = await compressImage(file);
          compressed.push(compressedImage);
          setProgress(((i + 1) / files.length) * 100);
        } catch (err) {
          console.error(`Error compressing ${file.name}:`, err);
          setError(`Failed to compress ${file.name}`);
        }
      }

      setCompressedImages(compressed);
      
      // Image compression is handled entirely client-side
      // No need to call server-side processing
      
    } catch (err) {
      console.error('Compression error:', err);
      setError(`Failed to compress images: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadImage = (compressedImage: CompressedImage) => {
    const url = URL.createObjectURL(compressedImage.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressedImage.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    compressedImages.forEach(img => downloadImage(img));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Minimize2 className="w-5 h-5 text-upsa-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            Image Compression Tool
          </h2>
        </div>
        <p className="text-gray-600 mt-1">
          Compress images to reduce file size while maintaining quality
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-upsa-blue bg-blue-50'
              : 'border-gray-300 hover:border-upsa-blue hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : 'Upload Images for Compression'}
          </p>
          <p className="text-gray-600">
            Drag and drop image files here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF, WebP
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Selected Images:</h3>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Compression Settings */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Compression Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {options.quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={options.quality}
                onChange={(e) => handleOptionChange('quality', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower quality</span>
                <span>Higher quality</span>
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={options.format}
                onChange={(e) => handleOptionChange('format', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
              >
                <option value="original">Keep Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {/* Max Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Width (px)
              </label>
              <input
                type="number"
                value={options.maxWidth}
                onChange={(e) => handleOptionChange('maxWidth', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                min="100"
                max="4000"
              />
            </div>

            {/* Max Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Height (px)
              </label>
              <input
                type="number"
                value={options.maxHeight}
                onChange={(e) => handleOptionChange('maxHeight', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                min="100"
                max="4000"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Advanced Options</h4>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) => handleOptionChange('maintainAspectRatio', e.target.checked)}
                className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
              />
              <span className="text-sm text-gray-700">Maintain aspect ratio</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeMetadata}
                onChange={(e) => handleOptionChange('removeMetadata', e.target.checked)}
                className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
              />
              <span className="text-sm text-gray-700">Remove metadata (EXIF data)</span>
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Progress */}
      {isCompressing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Compressing images...</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-upsa-blue to-upsa-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Compress Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCompress}
        disabled={isProcessing || isCompressing || files.length === 0}
        className="w-full bg-gradient-to-r from-upsa-blue to-upsa-gold text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isCompressing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Compressing Images...</span>
          </>
        ) : isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Minimize2 className="w-5 h-5" />
            <span>Compress Images</span>
          </>
        )}
      </motion.button>

      {/* Results */}
      {compressedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Compression Results</h3>
            <button
              onClick={downloadAll}
              className="bg-upsa-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download All</span>
            </button>
          </div>
          
          {compressedImages.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileImage className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadImage(result)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Download compressed image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compression:</span>
                  <span className={`font-medium ${
                    result.compressionRatio > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.compressionRatio > 0 ? '-' : '+'}{Math.abs(result.compressionRatio).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      result.compressionRatio > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(Math.abs(result.compressionRatio), 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Image Compression Features:</p>
            <ul className="space-y-1 text-xs">
              <li>• Adjustable quality settings from 10% to 100%</li>
              <li>• Support for multiple output formats (JPEG, PNG, WebP)</li>
              <li>• Automatic image resizing with aspect ratio preservation</li>
              <li>• Batch processing for multiple images</li>
              <li>• Metadata removal for privacy and smaller file sizes</li>
              <li>• Real-time compression ratio feedback</li>
              <li>• Client-side processing - no server upload required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}