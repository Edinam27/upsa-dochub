'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileCheck,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  Trash2
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface ExtractPagesToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface PageRange {
  start: number;
  end: number;
  id: string;
}

const ExtractPagesTool: React.FC<ExtractPagesToolProps> = ({ onProcess, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageRanges, setPageRanges] = useState<PageRange[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [newRangeStart, setNewRangeStart] = useState<string>('');
  const [newRangeEnd, setNewRangeEnd] = useState<string>('');
  const [extractMode, setExtractMode] = useState<'ranges' | 'individual'>('ranges');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const handleFilesAdded = (fileInfos: any[]) => {
    const selectedFiles = fileInfos.map(fileInfo => fileInfo.file);
    setFiles(selectedFiles);
    // In a real implementation, you would extract page count from PDF
    setTotalPages(10); // Mock value
    setPageRanges([]);
    setSelectedPages([]);
  };

  const addPageRange = () => {
    const start = parseInt(newRangeStart);
    const end = parseInt(newRangeEnd);
    
    if (start && end && start <= end && start >= 1 && end <= totalPages) {
      const newRange: PageRange = {
        start,
        end,
        id: Date.now().toString()
      };
      setPageRanges([...pageRanges, newRange]);
      setNewRangeStart('');
      setNewRangeEnd('');
    }
  };

  const removePageRange = (id: string) => {
    setPageRanges(pageRanges.filter(range => range.id !== id));
  };

  const togglePageSelection = (pageNumber: number) => {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter(p => p !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber]);
    }
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    
    const options = {
      extractMode,
      pageRanges: extractMode === 'ranges' ? pageRanges : [],
      selectedPages: extractMode === 'individual' ? selectedPages : []
    };
    
    await onProcess(files, options);
  };

  const canExtract = files.length > 0 && 
    ((extractMode === 'ranges' && pageRanges.length > 0) || 
     (extractMode === 'individual' && selectedPages.length > 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileCheck className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Extract PDF Pages</h2>
        <p className="text-gray-600">
          Extract specific pages or page ranges from your PDF document
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          maxFiles={1}
          maxFileSize={100 * 1024 * 1024}
          acceptedTypes={['.pdf', 'application/pdf']}
          className="border-2 border-dashed border-purple-300 hover:border-purple-400"
        />
      </div>

      {/* Page Selection */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Page Selection</h3>
          </div>

          {/* Extract Mode Toggle */}
          <div className="flex space-x-4">
            <button
              onClick={() => setExtractMode('ranges')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                extractMode === 'ranges'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Page Ranges
            </button>
            <button
              onClick={() => setExtractMode('individual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                extractMode === 'individual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual Pages
            </button>
          </div>

          {/* Page Ranges Mode */}
          {extractMode === 'ranges' && (
            <div className="space-y-4">
              <div className="flex space-x-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={newRangeStart}
                    onChange={(e) => setNewRangeStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={newRangeEnd}
                    onChange={(e) => setNewRangeEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={totalPages.toString()}
                  />
                </div>
                <button
                  onClick={addPageRange}
                  disabled={!newRangeStart || !newRangeEnd}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Range
                </button>
              </div>

              {/* Page Ranges List */}
              {pageRanges.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Selected Ranges:</h4>
                  {pageRanges.map((range) => (
                    <div
                      key={range.id}
                      className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-purple-800">
                        Pages {range.start} - {range.end}
                      </span>
                      <button
                        onClick={() => removePageRange(range.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Individual Pages Mode */}
          {extractMode === 'individual' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click on page numbers to select/deselect individual pages:
              </p>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => togglePageSelection(pageNum)}
                    className={`w-10 h-10 rounded-lg border-2 font-medium transition-colors ${
                      selectedPages.includes(pageNum)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              {selectedPages.length > 0 && (
                <p className="text-sm text-purple-600">
                  Selected pages: {selectedPages.sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress />
      )}

      {/* Extract Button */}
      <motion.button
        onClick={handleExtract}
        disabled={!canExtract || isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
          canExtract && !isProcessing
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canExtract && !isProcessing ? { scale: 1.02 } : {}}
        whileTap={canExtract && !isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Extracting Pages...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Extract Pages</span>
          </div>
        )}
      </motion.button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Extraction Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Use page ranges for consecutive pages (e.g., 1-5)</li>
              <li>• Use individual selection for specific non-consecutive pages</li>
              <li>• Each extracted page will be saved as a separate PDF file</li>
              <li>• Original document quality is preserved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractPagesTool;