'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileImage,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  Image,
  Loader2,
  Palette
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';
import { FileInfo } from '@/lib/types';

interface PDFToImagesToolProps {
  onProcess?: (files: File[], options: any) => Promise<void>;
  isProcessing?: boolean;
}

interface ConversionSettings {
  outputFormat: 'png' | 'jpg' | 'webp';
  quality: 'high' | 'medium' | 'low';
  resolution: number;
  pageRange: 'all' | 'range' | 'specific';
  startPage?: number;
  endPage?: number;
  specificPages?: string;
}

const PDFToImagesTool: React.FC<PDFToImagesToolProps> = ({ onProcess, isProcessing: externalProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: 'png',
    quality: 'high',
    resolution: 300,
    pageRange: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = (fileInfos: FileInfo[]) => {
    setError('');
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file).filter((file): file is File => file !== undefined);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please upload at least one PDF file.');
      return;
    }

    // Validate page range settings
    if (settings.pageRange === 'range') {
      if (!settings.startPage || !settings.endPage) {
        setError('Please specify both start and end pages for range conversion.');
        return;
      }
      if (settings.startPage > settings.endPage) {
        setError('Start page must be less than or equal to end page.');
        return;
      }
    }

    if (settings.pageRange === 'specific' && !settings.specificPages) {
      setError('Please specify page numbers for specific page conversion.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // Additional validation before processing
      const fileToProcess = files[0];
      
      if (!fileToProcess) {
        setError('No file selected for conversion.');
        return;
      }
      
      if (!(fileToProcess instanceof File)) {
        setError('Selected item is not a valid file.');
        return;
      }
      
      // Process client-side using PDF.js
      await convertPDFToImagesClientSide(fileToProcess, settings);
    } catch (err) {
      setError('Failed to convert PDF to images. Please try again.');
      console.error('PDF conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPDFToImagesClientSide = async (file: File, settings: ConversionSettings) => {
    try {
      // Validate file input
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }
      
      // Import PDF.js dynamically via react-pdf
      const { pdfjs: pdfjsLib } = await import('react-pdf');
      
      // Set up worker for PDF.js
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }
      
      // Read file as ArrayBuffer using FileReader
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(reader.error || new Error('FileReader error'));
        reader.readAsArrayBuffer(file);
      });
      const getDocument = pdfjsLib.getDocument;
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      
      // Determine which pages to convert
      let pagesToConvert: number[] = [];
      
      if (settings.pageRange === 'all') {
        pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
      } else if (settings.pageRange === 'range' && settings.startPage && settings.endPage) {
        for (let i = settings.startPage; i <= Math.min(settings.endPage, pdf.numPages); i++) {
          pagesToConvert.push(i);
        }
      } else if (settings.pageRange === 'specific' && settings.specificPages) {
        // Parse specific pages (e.g., "1, 3, 5-7, 10")
        const pageRanges = settings.specificPages.split(',').map(s => s.trim());
        for (const range of pageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= Math.min(end, pdf.numPages); i++) {
              if (i > 0) pagesToConvert.push(i);
            }
          } else {
            const pageNum = parseInt(range);
            if (pageNum > 0 && pageNum <= pdf.numPages) {
              pagesToConvert.push(pageNum);
            }
          }
        }
        // Remove duplicates and sort
        pagesToConvert = [...new Set(pagesToConvert)].sort((a, b) => a - b);
      }
      
      // Set scale based on quality
      let scale = 1.0;
      switch (settings.quality) {
        case 'high':
          scale = 2.0;
          break;
        case 'medium':
          scale = 1.5;
          break;
        case 'low':
          scale = 1.0;
          break;
      }
      
      const images: { blob: Blob; filename: string }[] = [];
      
      // Convert each page to image
      for (const pageNum of pagesToConvert) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, `image/${settings.outputFormat}`, settings.outputFormat === 'jpg' ? 0.9 : undefined);
        });
        
        const filename = `${file.name.replace('.pdf', '')}_page_${pageNum}.${settings.outputFormat}`;
        images.push({ blob, filename });
      }
      
      // Download all images
      for (const { blob, filename } of images) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setError('');
      alert(`Successfully converted ${images.length} pages to ${settings.outputFormat.toUpperCase()} images!`);
      
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw error;
    }
  };

  const formatOptions = [
    { id: 'png', name: 'PNG', description: 'Best quality, larger file size', color: 'blue' },
    { id: 'jpg', name: 'JPG', description: 'Good quality, smaller file size', color: 'green' },
    { id: 'webp', name: 'WebP', description: 'Modern format, excellent compression', color: 'purple' }
  ];

  const qualityOptions = [
    { id: 'high', name: 'High Quality', description: '300 DPI, best for printing', color: 'green' },
    { id: 'medium', name: 'Medium Quality', description: '150 DPI, good for web', color: 'blue' },
    { id: 'low', name: 'Low Quality', description: '72 DPI, smallest file size', color: 'orange' }
  ];

  const pageRangeOptions = [
    { id: 'all', name: 'All Pages', description: 'Convert all pages in the PDF' },
    { id: 'range', name: 'Page Range', description: 'Convert a specific range of pages' },
    { id: 'specific', name: 'Specific Pages', description: 'Convert specific page numbers' }
  ];

  const canConvert = files.length > 0 && 
    (settings.pageRange === 'all' || 
     (settings.pageRange === 'range' && settings.startPage && settings.endPage) ||
     (settings.pageRange === 'specific' && settings.specificPages));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileImage className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF to Images</h2>
        <p className="text-gray-600">
          Convert PDF pages to high-quality image files
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          acceptedTypes={['application/pdf']}
          maxFiles={5}
          maxFileSize={100 * 1024 * 1024}
        />
        
        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Conversion Settings
              </h2>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Output Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formatOptions.map((format) => (
                <label
                  key={format.id}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    settings.outputFormat === format.id
                      ? 'border-indigo-600 ring-2 ring-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="outputFormat"
                    value={format.id}
                    checked={settings.outputFormat === format.id}
                    onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {format.name}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {format.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Image Quality
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {qualityOptions.map((quality) => (
                <label
                  key={quality.id}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    settings.quality === quality.id
                      ? 'border-indigo-600 ring-2 ring-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="quality"
                    value={quality.id}
                    checked={settings.quality === quality.id}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {quality.name}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {quality.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Page Range Settings */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pages to Convert
              </label>
              <div className="space-y-3">
                {pageRangeOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="pageRange"
                      value={option.id}
                      checked={settings.pageRange === option.id}
                      onChange={(e) => setSettings(prev => ({ ...prev, pageRange: e.target.value as any }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="block text-sm font-medium text-gray-900">
                        {option.name}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Range Input */}
              {settings.pageRange === 'range' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.startPage || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, startPage: parseInt(e.target.value) || undefined }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.endPage || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, endPage: parseInt(e.target.value) || undefined }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                </div>
              )}

              {/* Specific Pages Input */}
              {settings.pageRange === 'specific' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Numbers (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={settings.specificPages || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, specificPages: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="1, 3, 5-7, 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Examples: "1, 3, 5" or "1-5, 8, 10-12"
                  </p>
                </div>
              )}
            </div>
          )}

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
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">→</span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-20 bg-indigo-100 border border-indigo-300 rounded flex items-center justify-center mb-2">
                  <Image className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-600">
                  {settings.outputFormat.toUpperCase()} Images
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Converting to {settings.outputFormat.toUpperCase()} with {settings.quality} quality
                {settings.pageRange !== 'all' && ` (${settings.pageRange} pages)`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Converting to Images...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Convert to Images</span>
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
              <li>• <strong>Multiple Formats:</strong> PNG, JPG, and WebP support</li>
              <li>• <strong>Quality Control:</strong> Choose resolution and compression</li>
              <li>• <strong>Page Selection:</strong> Convert all pages or specific ranges</li>
              <li>• <strong>Batch Processing:</strong> Convert multiple PDFs at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToImagesTool;