'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Eraser, 
  Download,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Settings,
  Info,
  CheckCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface WatermarkRemovalToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

type RemovalMethod = 'auto' | 'manual' | 'advanced';
type FileType = 'pdf' | 'image';

const WatermarkRemovalTool: React.FC<WatermarkRemovalToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [removalMethod, setRemovalMethod] = useState<RemovalMethod>('auto');
  const [sensitivity, setSensitivity] = useState(50);
  const [preserveQuality, setPreserveQuality] = useState(true);
  const [targetWatermark, setTargetWatermark] = useState('camscanner');
  const [error, setError] = useState<string>('');

  const removalMethods = {
    'auto': {
      name: 'Auto Detection',
      description: 'Automatically detect and remove common watermarks',
      icon: <Settings className="h-5 w-5" />
    },
    'manual': {
      name: 'Manual Selection',
      description: 'Manually specify watermark characteristics',
      icon: <Eraser className="h-5 w-5" />
    },
    'advanced': {
      name: 'Advanced Processing',
      description: 'Use advanced algorithms for stubborn watermarks',
      icon: <Settings className="h-5 w-5" />
    }
  };

  const commonWatermarks = [
    { id: 'camscanner', name: 'CamScanner', description: 'Remove CamScanner image watermarks' },
    { id: 'adobe', name: 'Adobe Scan', description: 'Remove Adobe Scan image overlays' },
    { id: 'generic', name: 'Generic Image', description: 'Remove generic image watermarks' },
    { id: 'custom', name: 'Custom Pattern', description: 'Custom image watermark removal' }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): FileType => {
    return file.type === 'application/pdf' ? 'pdf' : 'image';
  };

  const handleRemoveWatermarks = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file.');
      return;
    }

    const options = {
      operation: 'watermark-removal',
      method: removalMethod,
      sensitivity: sensitivity / 100,
      preserveQuality,
      targetWatermark,
      removeBackground: removalMethod === 'advanced',
      enhanceContrast: removalMethod === 'advanced'
    };

    try {
      await onProcess(files, options);
    } catch (err) {
      setError('Failed to remove watermarks. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <Eraser className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Watermark Removal Tool
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Remove watermarks from PDFs and images using advanced processing algorithms. 
          Supports CamScanner, Adobe Scan, and other common watermarks.
        </p>
      </div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">Important Notice:</p>
            <ul className="space-y-1 text-xs">
              <li>• Watermark removal effectiveness depends on how the watermark was applied</li>
              <li>• Some watermarks may be permanently embedded and cannot be completely removed</li>
              <li>• Results may vary based on image quality and watermark complexity</li>
              <li>• Always ensure you have the right to modify the documents</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Upload Files'}
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Drag and drop your files here, or click to browse
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PDF</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">PNG</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">JPG</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">JPEG</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">GIF</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      {getFileType(file) === 'pdf' ? (
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {getFileType(file).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removal Settings */}
      {files.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Removal Settings
          </h4>

          {/* Removal Method */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Removal Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(removalMethods).map(([key, method]) => (
                <button
                  key={key}
                  onClick={() => setRemovalMethod(key as RemovalMethod)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all duration-200 flex items-start space-x-3
                    ${
                      removalMethod === key
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }
                  `}
                >
                  {method.icon}
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{method.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Watermark */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Watermark Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonWatermarks.map((watermark) => (
                <button
                  key={watermark.id}
                  onClick={() => setTargetWatermark(watermark.id)}
                  className={`
                    p-3 border-2 rounded-lg text-left transition-all duration-200
                    ${
                      targetWatermark === watermark.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }
                  `}
                >
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">{watermark.name}</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{watermark.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detection Sensitivity: {sensitivity}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preserveQuality}
                  onChange={(e) => setPreserveQuality(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Preserve Image Quality</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleRemoveWatermarks}
          disabled={files.length === 0 || isProcessing}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              files.length > 0 && !isProcessing
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Removing Watermarks...</span>
            </>
          ) : (
            <>
              <Eraser className="h-4 w-4" />
              <span>Remove Watermarks</span>
            </>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">How Image-Based Watermark Removal Works:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>CamScanner Detection:</strong> Automatically detects and removes CamScanner image watermarks</li>
              <li>• <strong>Image-Based Processing:</strong> Specialized algorithms for removing image overlay watermarks</li>
              <li>• <strong>Pattern Recognition:</strong> Identifies common watermark patterns and logos</li>
              <li>• <strong>Advanced Inpainting:</strong> Uses sophisticated algorithms to fill removed watermark areas</li>
              <li>• <strong>Quality Preservation:</strong> Advanced inpainting to maintain document clarity</li>
              <li>• <strong>Batch Processing:</strong> Process multiple files simultaneously</li>
            </ul>
            <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> CamScanner watermarks are image-based overlays. Our tool uses computer vision 
              techniques to detect and remove these visual watermarks while preserving the underlying document content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkRemovalTool;