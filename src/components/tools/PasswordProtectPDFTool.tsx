'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  Shield, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PasswordProtectPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface PasswordOptions {
  userPassword: string;
  ownerPassword: string;
  permissions: {
    printing: boolean;
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
    fillingForms: boolean;
    contentAccessibility: boolean;
    documentAssembly: boolean;
    degradedPrinting: boolean;
  };
}

export default function PasswordProtectPDFTool({ onProcess, isProcessing }: PasswordProtectPDFToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    userPassword: '',
    ownerPassword: '',
    permissions: {
      printing: true,
      modifying: false,
      copying: false,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
      degradedPrinting: true
    }
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

  const handlePasswordChange = (type: 'user' | 'owner', value: string) => {
    setOptions(prev => ({
      ...prev,
      [`${type}Password`]: value
    }));
  };

  const handlePermissionChange = (permission: keyof PasswordOptions['permissions'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleProtect = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    if (!options.userPassword && !options.ownerPassword) {
      setError('Please set at least one password');
      return;
    }

    try {
      await onProcess(files, options);
      setFiles([]);
      setOptions({
        userPassword: '',
        ownerPassword: '',
        permissions: {
          printing: true,
          modifying: false,
          copying: false,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false,
          degradedPrinting: true
        }
      });
    } catch (err) {
      setError('Failed to protect PDF. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-upsa-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            Password Protect PDF
          </h2>
        </div>
        <p className="text-gray-600 mt-1">
          Add password protection and set permissions for your PDF files
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
            {isDragActive ? 'Drop PDF files here' : 'Upload PDF Files'}
          </p>
          <p className="text-gray-600">
            Drag and drop your PDF files here, or click to browse
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
                  <FileText className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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

      {/* Password Settings */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>Password Settings</span>
        </h3>
        
        {/* User Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Password (Required to open the PDF)
          </label>
          <div className="relative">
            <input
              type={showUserPassword ? 'text' : 'password'}
              value={options.userPassword}
              onChange={(e) => handlePasswordChange('user', e.target.value)}
              placeholder="Enter user password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowUserPassword(!showUserPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Owner Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Password (Required to change permissions)
          </label>
          <div className="relative">
            <input
              type={showOwnerPassword ? 'text' : 'password'}
              value={options.ownerPassword}
              onChange={(e) => handlePasswordChange('owner', e.target.value)}
              placeholder="Enter owner password (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowOwnerPassword(!showOwnerPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Document Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries({
            printing: 'Allow Printing',
            modifying: 'Allow Modifying',
            copying: 'Allow Copying Text',
            annotating: 'Allow Annotations',
            fillingForms: 'Allow Form Filling',
            contentAccessibility: 'Allow Content Accessibility',
            documentAssembly: 'Allow Document Assembly',
            degradedPrinting: 'Allow Degraded Printing'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.permissions[key as keyof PasswordOptions['permissions']]}
                onChange={(e) => handlePermissionChange(key as keyof PasswordOptions['permissions'], e.target.checked)}
                className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
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

      {/* Protect Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProtect}
        disabled={isProcessing || files.length === 0 || (!options.userPassword && !options.ownerPassword)}
        className="w-full bg-gradient-to-r from-upsa-blue to-upsa-gold text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Protecting...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Protect PDF{files.length > 1 ? 's' : ''}</span>
          </>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Features:</p>
            <ul className="space-y-1 text-xs">
              <li>• 128-bit AES encryption for maximum security</li>
              <li>• Separate user and owner passwords for different access levels</li>
              <li>• Granular permission controls for document usage</li>
              <li>• Compatible with all major PDF viewers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}