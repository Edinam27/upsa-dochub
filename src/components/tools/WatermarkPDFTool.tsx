'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Droplets, 
  Download,
  AlertCircle,
  Loader2,
  Type,
  Image as ImageIcon,
  RotateCw,
  Move,
  Palette
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface WatermarkPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

type WatermarkType = 'text' | 'image';
type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

const WatermarkPDFTool: React.FC<WatermarkPDFToolProps> = ({ onProcess, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [watermarkText, setWatermarkText] = useState('UPSA DocHub');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>('center');
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(50);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#808080');
  const [error, setError] = useState<string>('');

  const positions = {
    'center': { name: 'Center', description: 'Middle of the page' },
    'top-left': { name: 'Top Left', description: 'Upper left corner' },
    'top-right': { name: 'Top Right', description: 'Upper right corner' },
    'bottom-left': { name: 'Bottom Left', description: 'Lower left corner' },
    'bottom-right': { name: 'Bottom Right', description: 'Lower right corner' },
    'top-center': { name: 'Top Center', description: 'Top center of page' },
    'bottom-center': { name: 'Bottom Center', description: 'Bottom center of page' }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      setWatermarkImage(acceptedFiles[0]);
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

  const { 
    getRootProps: getImageRootProps, 
    getInputProps: getImageInputProps, 
    isDragActive: isImageDragActive 
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAddWatermark = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      setError('Please enter watermark text.');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      setError('Please upload a watermark image.');
      return;
    }

    const options = {
      operation: 'watermark',
      watermarkType,
      watermarkText: watermarkType === 'text' ? watermarkText : undefined,
      watermarkImage: watermarkType === 'image' ? watermarkImage : undefined,
      position,
      opacity: opacity / 100,
      fontSize,
      rotation,
      color
    };

    try {
      await onProcess([file], options);
    } catch (err) {
      setError('Failed to add watermark. Please try again.');
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
      {/* Upload PDF Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Watermark Configuration */}
      {file && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Watermark Settings
          </h4>

          {/* Watermark Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setWatermarkType('text')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center space-x-3
                ${
                  watermarkType === 'text'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }
              `}
            >
              <Type className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Text Watermark</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add custom text</p>
              </div>
            </button>

            <button
              onClick={() => setWatermarkType('image')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-center space-x-3
                ${
                  watermarkType === 'image'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }
              `}
            >
              <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Image Watermark</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload logo/image</p>
              </div>
            </button>
          </div>

          {/* Text Watermark Settings */}
          {watermarkType === 'text' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Watermark Settings */}
          {watermarkType === 'image' && (
            <div className="space-y-4">
              <div
                {...getImageRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer
                  ${
                    isImageDragActive
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }
                `}
              >
                <input {...getImageInputProps()} />
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {watermarkImage ? watermarkImage.name : 'Upload watermark image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          )}

          {/* Position Settings */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <Move className="h-4 w-4" />
              <span>Position</span>
            </h5>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(positions).map(([pos, info]) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos as Position)}
                  className={`
                    p-3 text-sm border rounded-lg transition-all duration-200
                    ${
                      position === pos
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {info.name}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity and Rotation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Opacity: {opacity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <RotateCw className="h-4 w-4" />
                <span>Rotation: {rotation}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Preview Settings</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{watermarkType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Position:</span>
                  <span className="text-gray-900 dark:text-white">{positions[position].name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Opacity:</span>
                  <span className="text-gray-900 dark:text-white">{opacity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rotation:</span>
                  <span className="text-gray-900 dark:text-white">{rotation}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleAddWatermark}
          disabled={!file || isProcessing || (watermarkType === 'text' && !watermarkText.trim()) || (watermarkType === 'image' && !watermarkImage)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              file && !isProcessing && ((watermarkType === 'text' && watermarkText.trim()) || (watermarkType === 'image' && watermarkImage))
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding Watermark...</span>
            </>
          ) : (
            <>
              <Droplets className="h-4 w-4" />
              <span>Add Watermark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WatermarkPDFTool;