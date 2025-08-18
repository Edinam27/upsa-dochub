'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Highlighter,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface AnnotatePDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

const AnnotatePDFTool: React.FC<AnnotatePDFToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleFilesSelected = useCallback((selectedFiles: any[]) => {
    // Convert FileInfo objects to File objects
    const files = selectedFiles.map(fileInfo => {
      // FileInfo objects have a 'file' property that contains the actual File
      return fileInfo.file || fileInfo;
    }).filter(file => file instanceof File);
    setFiles(files);
  }, []);

  const handleOpenEditor = async () => {
    if (files.length === 0) return;
    
    try {
      // Store the file in sessionStorage for the editor to access
      const file = files[0];
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      
      const base64Data = await base64Promise;
      const fileUrl = URL.createObjectURL(file);
      
      // Store base64 data and URL
      sessionStorage.setItem('pdfEditorFile', base64Data);
      sessionStorage.setItem('pdfEditorUrl', fileUrl);
      
      // Navigate to the editor
      router.push('/tools/pdf-editor');
    } catch (error) {
      console.error('Error preparing file for editor:', error);
      // Handle error - could show a toast or alert
    }
  };

  const canOpenEditor = files.length > 0 && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Highlighter className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Annotate PDF</h2>
        <p className="text-gray-600">
          Upload your PDF and open the editor to add highlights, notes, and annotations
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesSelected}
          maxFiles={1}
          maxFileSize={50 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-yellow-300 hover:border-yellow-400"
        />
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{files[0].name}</h3>
              <p className="text-sm text-gray-500">
                {(files[0].size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Open Editor Button */}
      <motion.button
        onClick={handleOpenEditor}
        disabled={!canOpenEditor}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canOpenEditor
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canOpenEditor ? { scale: 1.02 } : {}}
        whileTap={canOpenEditor ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-2">
          <ExternalLink className="w-5 h-5" />
          <span>Open PDF Editor</span>
        </div>
      </motion.button>



      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Annotation Features:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Highlight:</strong> Mark important text with colored backgrounds</li>
              <li>• <strong>Text Notes:</strong> Add comments and notes anywhere on the page</li>
              <li>• <strong>Draw:</strong> Create freehand drawings and shapes</li>
              <li>• Customize colors, opacity, and sizes for all annotation types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatePDFTool;