'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  Settings,
  Layout,
  Shield,
  Lock
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface PDFToExcelToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface ConversionSettings {
  outputFormat: 'xlsx';
  detectTables: boolean;
  pageRange: string;
  convertAllPages: boolean;
}

const PDFToExcelTool: React.FC<PDFToExcelToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'xlsx',
    detectTables: true,
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
      detectTables: settings.detectTables,
      pageRange: settings.convertAllPages ? '' : settings.pageRange
    };
    
    await onProcess(files, options);
  };

  const canConvert = files.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to Excel</h2>
        <p className="text-gray-600">
          Convert PDF documents to editable Excel spreadsheets
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={5}
          maxFileSize={50 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-green-300 hover:border-green-400"
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
            <Settings className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Conversion Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.detectTables}
                  onChange={(e) => setSettings({ ...settings, detectTables: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Detect Tables</span>
                    <p className="text-sm text-gray-600">Automatically identify and format tables</p>
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
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="text-gray-700">All pages</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={!settings.convertAllPages}
                  onChange={() => setSettings({ ...settings, convertAllPages: false })}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
      <motion.button
        onClick={handleConvert}
        disabled={!canConvert || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canConvert && !isProcessing
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
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
            <span>Download Excel File</span>
          </div>
        )}
      </motion.button>

      {/* Privacy Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              Secure Client-Side Processing
            </p>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Private & Secure:</strong> Files never leave your device</li>
              <li>• <strong>Fast Conversion:</strong> Instant processing without uploading</li>
              <li>• <strong>No Limits:</strong> Convert as many files as you want</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToExcelTool;
