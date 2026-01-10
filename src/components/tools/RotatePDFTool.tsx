'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  RotateCw,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  RefreshCw
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface RotatePDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface RotationSettings {
  angle: number;
  applyToAllPages: boolean;
  specificPages: string;
}

const RotatePDFTool: React.FC<RotatePDFToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<RotationSettings>({
    angle: 90,
    applyToAllPages: true,
    specificPages: ''
  });

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
  };

  const handleRotate = async () => {
    if (files.length === 0) return;
    
    const options = {
      angle: settings.angle,
      applyToAllPages: settings.applyToAllPages,
      specificPages: settings.specificPages
    };
    
    await onProcess(files, options);
  };

  const rotationAngles = [
    { label: '90° Clockwise', value: 90, icon: RotateCw },
    { label: '180°', value: 180, icon: RefreshCw },
    { label: '270° (90° Counter)', value: 270, icon: RotateCcw }
  ];

  const canRotate = files.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RotateCw className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rotate PDF</h2>
        <p className="text-gray-600">
          Rotate PDF pages clockwise or counterclockwise
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

      {/* Rotation Settings */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Rotation Settings</h3>
          </div>

          {/* Rotation Angle */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Rotation Angle</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rotationAngles.map((rotation) => {
                const IconComponent = rotation.icon;
                return (
                  <button
                    key={rotation.value}
                    onClick={() => setSettings({ ...settings, angle: rotation.value })}
                    className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      settings.angle === rotation.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{rotation.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Apply To</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={settings.applyToAllPages}
                  onChange={() => setSettings({ ...settings, applyToAllPages: true, specificPages: '' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">All pages</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="pageSelection"
                  checked={!settings.applyToAllPages}
                  onChange={() => setSettings({ ...settings, applyToAllPages: false })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Specific pages</span>
              </label>
            </div>

            {!settings.applyToAllPages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-7"
              >
                <input
                  type="text"
                  value={settings.specificPages}
                  onChange={(e) => setSettings({ ...settings, specificPages: e.target.value })}
                  placeholder="e.g., 1,3,5-8,10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1,3,5-8,10)
                </p>
              </motion.div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-16 h-20 bg-white border border-gray-300 rounded flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-sm text-gray-600">Original</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {settings.angle === 90 && <RotateCw className="w-4 h-4 text-blue-600" />}
                  {settings.angle === 180 && <RefreshCw className="w-4 h-4 text-blue-600" />}
                  {settings.angle === 270 && <RotateCcw className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-20 bg-white border border-gray-300 rounded flex items-center justify-center mb-2 transition-transform duration-300"
                  style={{ transform: `rotate(${settings.angle}deg)` }}
                >
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Rotated {settings.angle}°</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress />
      )}

      {/* Rotate Button */}
      <motion.button
        onClick={handleRotate}
        disabled={!canRotate || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canRotate && !isProcessing
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canRotate && !isProcessing ? { scale: 1.02 } : {}}
        whileTap={canRotate && !isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Rotating PDF...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download Rotated PDF</span>
          </div>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Rotation Options:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>90° Clockwise:</strong> Rotate pages to the right</li>
              <li>• <strong>180°:</strong> Flip pages upside down</li>
              <li>• <strong>270° (90° Counter):</strong> Rotate pages to the left</li>
              <li>• Apply rotation to all pages or specific page ranges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatePDFTool;