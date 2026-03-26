'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Presentation,
  Settings,
  Layout,
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface PDFToPPTToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface ConversionSettings {
  outputFormat: 'pptx';
  detectLayout: boolean;
  pageRange: string;
  convertAllPages: boolean;
}

const PDFToPPTTool: React.FC<PDFToPPTToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'pptx',
    detectLayout: true,
    pageRange: '',
    convertAllPages: true
  });

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    // Validate page range
    if (!settings.convertAllPages && settings.pageRange) {
        if (!/^[\d\s,-]+$/.test(settings.pageRange) || !/\d/.test(settings.pageRange)) {
            setError('Invalid page range format. Please use numbers separated by commas (e.g., 1,3,5-8)');
            return;
        }
    }
    setError('');
    
    const options = {
      outputFormat: settings.outputFormat,
      detectLayout: settings.detectLayout,
      pageRange: settings.convertAllPages ? '' : settings.pageRange
    };
    
    await onProcess(files, options);
  };

  const canConvert = files.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Presentation className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to PowerPoint</h2>
        <p className="text-gray-600">
          Convert PDF documents to editable PowerPoint presentations
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={5}
          maxFileSize={50 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-orange-300 hover:border-orange-400"
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
            <Settings className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Conversion Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.detectLayout}
                  onChange={(e) => setSettings({ ...settings, detectLayout: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Preserve Layout</span>
                    <p className="text-sm text-gray-600">Maintain original slide layout and positioning</p>
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
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-gray-700">All pages</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={!settings.convertAllPages}
                  onChange={() => setSettings({ ...settings, convertAllPages: false })}
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
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
                  onChange={(e) => {
                    setSettings({ ...settings, pageRange: e.target.value });
                    setError('');
                  }}
                  placeholder="e.g., 1,3,5-8,10"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1,3,5-8,10)
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress isProcessing={true} />
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform active:scale-98 ${
          canConvert && !isProcessing
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Converting Presentation...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Presentation className="w-5 h-5" />
            <span>Convert to PowerPoint</span>
          </div>
        )}
      </button>

      {!canConvert && (
        <p className="text-center text-gray-500 text-sm">
          Upload a PDF file to enable conversion
        </p>
      )}
    </div>
  );
};

export default PDFToPPTTool;
