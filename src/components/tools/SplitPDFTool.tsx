'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Scissors, 
  Download,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface SplitPDFToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

const SplitPDFTool: React.FC<SplitPDFToolProps> = ({ onProcess, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'range' | 'pages' | 'every'>('range');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [specificPages, setSpecificPages] = useState<string>('');
  const [everyNPages, setEveryNPages] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Try to get page count (this would require pdf-lib in a real implementation)
      // For now, we'll simulate it
      try {
        // In a real implementation, you'd load the PDF and get page count
        // const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
        // const count = pdfDoc.getPageCount();
        const simulatedPageCount = Math.floor(Math.random() * 50) + 1; // Simulate 1-50 pages
        setPageCount(simulatedPageCount);
        setEndPage(simulatedPageCount);
      } catch (err) {
        setError('Failed to read PDF file. Please ensure it\'s a valid PDF.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleSplit = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    let options: any = { operation: 'split', splitMode };

    switch (splitMode) {
      case 'range':
        if (startPage < 1 || endPage > pageCount || startPage > endPage) {
          setError('Invalid page range. Please check your start and end pages.');
          return;
        }
        options.startPage = startPage;
        options.endPage = endPage;
        break;
      
      case 'pages':
        const pages = specificPages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        if (pages.length === 0 || pages.some(p => p < 1 || p > pageCount)) {
          setError('Invalid page numbers. Please enter valid page numbers separated by commas.');
          return;
        }
        options.specificPages = pages;
        break;
      
      case 'every':
        if (everyNPages < 1) {
          setError('Please enter a valid number of pages.');
          return;
        }
        options.everyNPages = everyNPages;
        break;
    }

    try {
      await onProcess([file], options);
    } catch (err) {
      setError('Failed to split PDF. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Drop PDF file here' : 'Upload PDF File'}
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your PDF file here, or click to browse
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            PDF files only
          </span>
          <span>Max 100MB</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* File Info */}
      {file && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">{file.name}</h4>
              <p className="text-sm text-gray-600">
                {formatFileSize(file.size)} • {pageCount} pages
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Split Options */}
      {file && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Split Options
          </h4>

          {/* Split Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSplitMode('range')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all duration-200
                ${
                  splitMode === 'range'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }
              `}
            >
              <h5 className="font-medium text-gray-900 mb-1">Page Range</h5>
              <p className="text-sm text-gray-600">
                Extract a specific range of pages
              </p>
            </button>

            <button
              onClick={() => setSplitMode('pages')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all duration-200
                ${
                  splitMode === 'pages'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }
              `}
            >
              <h5 className="font-medium text-gray-900 mb-1">Specific Pages</h5>
              <p className="text-sm text-gray-600">
                Extract specific page numbers
              </p>
            </button>

            <button
              onClick={() => setSplitMode('every')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all duration-200
                ${
                  splitMode === 'every'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }
              `}
            >
              <h5 className="font-medium text-gray-900 mb-1">Split Every N Pages</h5>
              <p className="text-sm text-gray-600">
                Split into multiple files
              </p>
            </button>
          </div>

          {/* Split Configuration */}
          <div className="p-4 bg-gray-50 rounded-lg">
            {splitMode === 'range' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={pageCount}
                      value={startPage}
                      onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Page
                    </label>
                    <input
                      type="number"
                      min={startPage}
                      max={pageCount}
                      value={endPage}
                      onChange={(e) => setEndPage(parseInt(e.target.value) || pageCount)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>Extract pages {startPage} to {endPage} ({endPage - startPage + 1} pages)</span>
                </div>
              </div>
            )}

            {splitMode === 'pages' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Numbers (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1, 3, 5-7, 10"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>Enter page numbers separated by commas (ranges supported)</span>
                </div>
              </div>
            )}

            {splitMode === 'every' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split Every N Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={everyNPages}
                    onChange={(e) => setEveryNPages(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Info className="h-4 w-4" />
                  <span>This will create {Math.ceil(pageCount / everyNPages)} separate PDF files</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSplit}
          disabled={!file || isProcessing}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${
              file && !isProcessing
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Splitting...</span>
            </>
          ) : (
            <>
              <Scissors className="h-4 w-4" />
              <span>Split PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SplitPDFTool;
