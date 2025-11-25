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
  Lock,
  Image,
  Layout,
  Printer
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface WordToPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface ConversionSettings {
  quality: 'high' | 'medium' | 'low';
  preserveHyperlinks: boolean;
  preserveBookmarks: boolean;
  embedFonts: boolean;
  optimizeForPrint: boolean;
  passwordProtect: boolean;
  password: string;
  pageOrientation: 'auto' | 'portrait' | 'landscape';
}

const WordToPDFTool: React.FC<WordToPDFToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 'high',
    preserveHyperlinks: true,
    preserveBookmarks: true,
    embedFonts: true,
    optimizeForPrint: false,
    passwordProtect: false,
    password: '',
    pageOrientation: 'auto'
  });

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    const options = {
      quality: settings.quality,
      preserveHyperlinks: settings.preserveHyperlinks,
      preserveBookmarks: settings.preserveBookmarks,
      embedFonts: settings.embedFonts,
      optimizeForPrint: settings.optimizeForPrint,
      passwordProtect: settings.passwordProtect,
      password: settings.passwordProtect ? settings.password : '',
      pageOrientation: settings.pageOrientation
    };
    
    await onProcess(files, options);
  };

  const qualityOptions = [
    {
      id: 'high',
      name: 'High Quality',
      description: 'Best quality, larger file size',
      color: 'green'
    },
    {
      id: 'medium',
      name: 'Medium Quality',
      description: 'Balanced quality and file size',
      color: 'blue'
    },
    {
      id: 'low',
      name: 'Low Quality',
      description: 'Smaller file size, reduced quality',
      color: 'orange'
    }
  ];

  const orientationOptions = [
    { id: 'auto', name: 'Auto', description: 'Detect from document' },
    { id: 'portrait', name: 'Portrait', description: 'Vertical orientation' },
    { id: 'landscape', name: 'Landscape', description: 'Horizontal orientation' }
  ];

  const canConvert = files.length > 0 && (!settings.passwordProtect || settings.password.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Word to PDF</h2>
        <p className="text-gray-600">
          Convert Word documents to high-quality PDF files
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={5}
          maxFileSize={50 * 1024 * 1024}
          acceptedTypes={['.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
          className="border-2 border-dashed border-indigo-300 hover:border-indigo-400"
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
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>
          </div>

          {/* Quality Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">PDF Quality</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {qualityOptions.map((quality) => {
                const isSelected = settings.quality === quality.id;
                return (
                  <button
                    key={quality.id}
                    onClick={() => setSettings({ ...settings, quality: quality.id as any })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-${quality.color}-500 bg-${quality.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2">
                      <span className={`font-medium ${
                        isSelected ? `text-${quality.color}-900` : 'text-gray-900'
                      }`}>
                        {quality.name}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      isSelected ? `text-${quality.color}-700` : 'text-gray-600'
                    }`}>
                      {quality.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Orientation */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Page Orientation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orientationOptions.map((orientation) => {
                const isSelected = settings.pageOrientation === orientation.id;
                return (
                  <button
                    key={orientation.id}
                    onClick={() => setSettings({ ...settings, pageOrientation: orientation.id as any })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="font-medium mb-1">{orientation.name}</div>
                    <p className={`text-sm ${
                      isSelected ? 'text-indigo-700' : 'text-gray-600'
                    }`}>
                      {orientation.description}
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
                  checked={settings.preserveHyperlinks}
                  onChange={(e) => setSettings({ ...settings, preserveHyperlinks: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Preserve Hyperlinks</span>
                    <p className="text-sm text-gray-600">Keep clickable links in PDF</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.preserveBookmarks}
                  onChange={(e) => setSettings({ ...settings, preserveBookmarks: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Preserve Bookmarks</span>
                    <p className="text-sm text-gray-600">Keep document navigation</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.embedFonts}
                  onChange={(e) => setSettings({ ...settings, embedFonts: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Embed Fonts</span>
                    <p className="text-sm text-gray-600">Ensure consistent appearance</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.optimizeForPrint}
                  onChange={(e) => setSettings({ ...settings, optimizeForPrint: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <Printer className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Optimize for Print</span>
                    <p className="text-sm text-gray-600">Better print quality</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Password Protection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Security</h4>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.passwordProtect}
                onChange={(e) => setSettings({ ...settings, passwordProtect: e.target.checked, password: '' })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Password Protection</span>
                  <p className="text-sm text-gray-600">Secure PDF with password</p>
                </div>
              </div>
            </label>

            {settings.passwordProtect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-7"
              >
                <input
                  type="password"
                  value={settings.password}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 1 character long
                </p>
              </motion.div>
            )}
          </div>

          {/* Conversion Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Conversion Preview</h4>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="w-16 h-20 bg-blue-100 border border-blue-300 rounded flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Word</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">→</span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-20 bg-red-100 border border-red-300 rounded flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-red-600" />
                  {settings.passwordProtect && (
                    <Lock className="w-3 h-3 text-red-800 absolute ml-8 mt-8" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  PDF {settings.passwordProtect && '(Protected)'}
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Converting with {settings.quality} quality
                {settings.passwordProtect && ', password protected'}
                {settings.optimizeForPrint && ', optimized for print'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress />
      )}

      {/* Convert Button */}
      <motion.button
        onClick={handleConvert}
        disabled={!canConvert || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canConvert && !isProcessing
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canConvert && !isProcessing ? { scale: 1.02 } : {}}
        whileTap={canConvert && !isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Converting to PDF...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </div>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div className="text-sm text-indigo-800">
            <p className="font-medium mb-1">Conversion Features:</p>
            <ul className="space-y-1 text-indigo-700">
              <li>• <strong>High Quality:</strong> Preserve document formatting and layout</li>
              <li>• <strong>Font Embedding:</strong> Ensure consistent appearance across devices</li>
              <li>• <strong>Security:</strong> Optional password protection</li>
              <li>• <strong>Hyperlinks:</strong> Maintain clickable links and bookmarks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordToPDFTool;