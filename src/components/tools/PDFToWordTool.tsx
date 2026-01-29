'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Type,
  Image,
  Layout,
  Zap,
  Cloud,
  Shield,
  Lock
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface PDFToWordToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface ConversionSettings {
  outputFormat: 'docx' | 'doc';
  preserveLayout: boolean;
  extractImages: boolean;
  maintainFormatting: boolean;
  ocrEnabled: boolean;
  pageRange: string;
  convertAllPages: boolean;
}

const PDFToWordTool: React.FC<PDFToWordToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'docx',
    preserveLayout: true,
    extractImages: true,
    maintainFormatting: true,
    ocrEnabled: false,
    pageRange: '',
    convertAllPages: true
  });

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    const options = {
      outputFormat: settings.outputFormat,
      preserveLayout: settings.preserveLayout,
      extractImages: settings.extractImages,
      maintainFormatting: settings.maintainFormatting,
      ocrEnabled: settings.ocrEnabled,
      pageRange: settings.convertAllPages ? '' : settings.pageRange
    };
    
    await onProcess(files, options);
  };

  const formatOptions = [
    {
      id: 'docx',
      name: 'DOCX',
      description: 'Modern Word format (recommended)',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'doc',
      name: 'DOC',
      description: 'Legacy Word format',
      icon: FileText,
      color: 'indigo'
    }
  ];

  const canConvert = files.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to Word</h2>
        <p className="text-gray-600">
          Convert PDF documents to editable Word files
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={5}
          maxFileSize={50 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-blue-300 hover:border-blue-400"
        />
      </div>

      {/* Conversion Settings */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
          </div>

          {/* Output Format */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Output Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((format) => {
                const IconComponent = format.icon;
                const isSelected = settings.outputFormat === format.id;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSettings({ ...settings, outputFormat: format.id as any })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-${format.color}-500 bg-${format.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className={`w-5 h-5 ${
                        isSelected ? `text-${format.color}-600` : 'text-gray-600'
                      }`} />
                      <span className={`font-medium ${
                        isSelected ? `text-${format.color}-900` : 'text-gray-900'
                      }`}>
                        {format.name}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      isSelected ? `text-${format.color}-700` : 'text-gray-600'
                    }`}>
                      {format.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Conversion Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.preserveLayout}
                  onChange={(e) => setSettings({ ...settings, preserveLayout: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Preserve Layout</span>
                    <p className="text-sm text-gray-600">Maintain original document layout</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.extractImages}
                  onChange={(e) => setSettings({ ...settings, extractImages: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Extract Images</span>
                    <p className="text-sm text-gray-600">Include images in Word document</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.maintainFormatting}
                  onChange={(e) => setSettings({ ...settings, maintainFormatting: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Maintain Formatting</span>
                    <p className="text-sm text-gray-600">Preserve fonts, colors, and styles</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.ocrEnabled}
                  onChange={(e) => setSettings({ ...settings, ocrEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">OCR (Text Recognition)</span>
                    <p className="text-sm text-gray-600">Extract text from scanned PDFs</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Page Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Pages to Convert</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={settings.convertAllPages}
                  onChange={() => setSettings({ ...settings, convertAllPages: true, pageRange: '' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">All pages</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={!settings.convertAllPages}
                  onChange={() => setSettings({ ...settings, convertAllPages: false })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Specific pages</span>
              </label>
            </div>

            {!settings.convertAllPages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-7"
              >
                <input
                  type="text"
                  value={settings.pageRange}
                  onChange={(e) => setSettings({ ...settings, pageRange: e.target.value })}
                  placeholder="e.g., 1,3,5-8,10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1,3,5-8,10)
                </p>
              </motion.div>
            )}
          </div>

          {/* Conversion Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Conversion Preview</h4>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="w-16 h-20 bg-red-100 border border-red-300 rounded flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <span className="text-sm text-gray-600">PDF</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">→</span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-20 bg-blue-100 border border-blue-300 rounded flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">{settings.outputFormat.toUpperCase()}</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Converting to {settings.outputFormat.toUpperCase()} using local processing
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress isProcessing={true} />
      )}

      {/* Convert Button */}
      <motion.button
        onClick={handleConvert}
        disabled={!canConvert || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canConvert && !isProcessing
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canConvert && !isProcessing ? { scale: 1.02 } : {}}
        whileTap={canConvert && !isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Converting Document...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download Word Document</span>
          </div>
        )}
      </motion.button>

      {/* Privacy Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              Secure Client-Side Processing
            </p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Private & Secure:</strong> Files never leave your device</li>
              <li>• <strong>Fast Conversion:</strong> Instant processing without uploading</li>
              <li>• <strong>No Limits:</strong> Convert as many files as you want</li>
              <li>• <strong>Offline Capable:</strong> Works without internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToWordTool;