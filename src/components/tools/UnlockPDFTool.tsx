'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  Unlock, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react';

interface UnlockPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface UnlockOptions {
  password: string;
}

export default function UnlockPDFTool({ onProcess, isProcessing }: UnlockPDFToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [options, setOptions] = useState<UnlockOptions>({
    password: ''
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are supported');
      return;
    }

    if (pdfFiles.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    setFiles(pdfFiles);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handlePasswordChange = (value: string) => {
    setOptions(prev => ({
      ...prev,
      password: value
    }));
  };

  const handleUnlock = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    if (!options.password.trim()) {
      setError('Please enter the password for the PDF');
      return;
    }

    try {
      await onProcess(files, options);
      setFiles([]);
      setOptions({
        password: ''
      });
    } catch (err) {
      setError('Failed to unlock PDF. Please check the password and try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Unlock className="w-5 h-5 text-upsa-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            Remove Password Protection
          </h2>
        </div>
        <p className="text-gray-600 mt-1">
          Remove password protection from your PDF files
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
            {isDragActive ? 'Drop PDF files here' : 'Upload Protected PDF Files'}
          </p>
          <p className="text-gray-600">
            Drag and drop your password-protected PDF files here, or click to browse
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Selected Files:</h3>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FileText className="w-5 h-5 text-red-500" />
                    <Lock className="w-3 h-3 text-gray-600 absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Password Protected
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

      {/* Password Input */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>Password Required</span>
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter the password to unlock the PDF
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={options.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter PDF password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This password will be used to unlock and remove protection from the PDF
          </p>
        </div>
      </div>

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

      {/* Unlock Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUnlock}
        disabled={isProcessing || files.length === 0 || !options.password.trim()}
        className="w-full bg-gradient-to-r from-upsa-blue to-upsa-gold text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Unlocking...</span>
          </>
        ) : (
          <>
            <Unlock className="w-5 h-5" />
            <span>Remove Password{files.length > 1 ? 's' : ''}</span>
          </>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Unlock Features:</p>
            <ul className="space-y-1 text-xs">
              <li>• Remove password protection from PDF files</li>
              <li>• Eliminate all access restrictions and permissions</li>
              <li>• Batch processing for multiple protected files</li>
              <li>• Secure processing - passwords are not stored</li>
              <li>• Compatible with all standard PDF encryption methods</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Notice:</p>
            <p className="text-xs">
              Only use this tool on PDF files that you own or have permission to unlock. 
              Removing password protection from copyrighted or restricted documents may violate terms of use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}