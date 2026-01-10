'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Wrench,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface RepairPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface RepairSettings {
  repairMode: 'basic' | 'advanced' | 'aggressive';
  fixCorruption: boolean;
  rebuildStructure: boolean;
  optimizeAfterRepair: boolean;
  removeInvalidObjects: boolean;
}

const RepairPDFTool: React.FC<RepairPDFToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<RepairSettings>({
    repairMode: 'basic',
    fixCorruption: true,
    rebuildStructure: false,
    optimizeAfterRepair: true,
    removeInvalidObjects: true
  });

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
  };

  const handleRepair = async () => {
    if (files.length === 0) return;
    
    const options = {
      repairMode: settings.repairMode,
      fixCorruption: settings.fixCorruption,
      rebuildStructure: settings.rebuildStructure,
      optimizeAfterRepair: settings.optimizeAfterRepair,
      removeInvalidObjects: settings.removeInvalidObjects
    };
    
    await onProcess(files, options);
  };

  const repairModes = [
    {
      id: 'basic',
      name: 'Basic Repair',
      description: 'Fix common issues and minor corruption',
      icon: Shield,
      color: 'green'
    },
    {
      id: 'advanced',
      name: 'Advanced Repair',
      description: 'Deep analysis and structure rebuilding',
      icon: Wrench,
      color: 'blue'
    },
    {
      id: 'aggressive',
      name: 'Aggressive Repair',
      description: 'Maximum recovery for severely damaged files',
      icon: Zap,
      color: 'red'
    }
  ];

  const canRepair = files.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Repair PDF</h2>
        <p className="text-gray-600">
          Fix corrupted or damaged PDF files and restore functionality
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={5}
          maxFileSize={100 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-orange-300 hover:border-orange-400"
        />
      </div>

      {/* Repair Settings */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Repair Settings</h3>
          </div>

          {/* Repair Mode */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Repair Mode</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {repairModes.map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = settings.repairMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSettings({ ...settings, repairMode: mode.id as any })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-${mode.color}-500 bg-${mode.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className={`w-5 h-5 ${
                        isSelected ? `text-${mode.color}-600` : 'text-gray-600'
                      }`} />
                      <span className={`font-medium ${
                        isSelected ? `text-${mode.color}-900` : 'text-gray-900'
                      }`}>
                        {mode.name}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      isSelected ? `text-${mode.color}-700` : 'text-gray-600'
                    }`}>
                      {mode.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repair Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Repair Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.fixCorruption}
                  onChange={(e) => setSettings({ ...settings, fixCorruption: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Fix Corruption</span>
                  <p className="text-sm text-gray-600">Repair corrupted data structures</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.rebuildStructure}
                  onChange={(e) => setSettings({ ...settings, rebuildStructure: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Rebuild Structure</span>
                  <p className="text-sm text-gray-600">Reconstruct PDF internal structure</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.removeInvalidObjects}
                  onChange={(e) => setSettings({ ...settings, removeInvalidObjects: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Remove Invalid Objects</span>
                  <p className="text-sm text-gray-600">Delete broken or invalid PDF objects</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.optimizeAfterRepair}
                  onChange={(e) => setSettings({ ...settings, optimizeAfterRepair: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Optimize After Repair</span>
                  <p className="text-sm text-gray-600">Optimize file size after repair</p>
                </div>
              </label>
            </div>
          </div>

          {/* Repair Process Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Repair Process</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600">1</span>
                </div>
                <span className="text-sm text-gray-700">Analyze PDF structure and identify issues</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-orange-600">2</span>
                </div>
                <span className="text-sm text-gray-700">
                  Apply {settings.repairMode} repair techniques
                </span>
              </div>
              {settings.rebuildStructure && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-600">3</span>
                  </div>
                  <span className="text-sm text-gray-700">Rebuild PDF structure</span>
                </div>
              )}
              {settings.optimizeAfterRepair && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-orange-600">4</span>
                  </div>
                  <span className="text-sm text-gray-700">Optimize repaired file</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Generate repaired PDF</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress />
      )}

      {/* Repair Button */}
      <motion.button
        onClick={handleRepair}
        disabled={!canRepair || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canRepair && !isProcessing
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canRepair && !isProcessing ? { scale: 1.02 } : {}}
        whileTap={canRepair && !isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Repairing PDF...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download Repaired PDF</span>
          </div>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">Repair Capabilities:</p>
            <ul className="space-y-1 text-orange-700">
              <li>• <strong>Basic:</strong> Fix common corruption and reading errors</li>
              <li>• <strong>Advanced:</strong> Rebuild damaged structures and cross-references</li>
              <li>• <strong>Aggressive:</strong> Maximum recovery for severely damaged files</li>
              <li>• Remove invalid objects and optimize file structure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPDFTool;