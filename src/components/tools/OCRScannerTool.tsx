'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon,
  X, 
  Scan,
  Download,
  Copy,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2
} from 'lucide-react';

interface OCRScannerToolProps {
  onProcess: (files: File[], options: any) => Promise<void>;
  isProcessing: boolean;
}

interface OCROptions {
  language: string;
  outputFormat: 'text' | 'pdf' | 'docx';
  preserveFormatting: boolean;
  enhanceImage: boolean;
  detectTables: boolean;
}

interface OCRResult {
  text: string;
  confidence: number;
  fileName: string;
}

interface OCRProgress {
  status: string;
  progress: number;
  fileName: string;
}

export default function OCRScannerTool({ onProcess, isProcessing }: OCRScannerToolProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<OCRResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<OCRProgress[]>([]);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const [options, setOptions] = useState<OCROptions>({
    language: 'eng',
    outputFormat: 'text',
    preserveFormatting: true,
    enhanceImage: true,
    detectTables: false
  });

  // Initialize PDF.js on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initPdfJs = async () => {
        try {
          const { pdfjs: pdfjsLib } = await import('react-pdf');
          const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
          // Set worker source to CDN URL
          pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
          setPdfLibLoaded(true);
        } catch (error) {
          console.error('Failed to initialize PDF.js:', error);
        }
      };
      initPdfJs();
    }
  }, []);

  // Convert PDF to images using PDF.js
  const convertPDFToImages = async (file: File, onProgress?: (progress: number) => void): Promise<string[]> => {
    if (!pdfLibLoaded) {
      throw new Error('PDF.js library not loaded yet. Please try again.');
    }

    const { pdfjs: pdfjsLib } = await import('react-pdf');
    const arrayBuffer = await file.arrayBuffer();
    const getDocument = pdfjsLib.getDocument;
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR quality
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        images.push(imageDataUrl);
      }
      
      // Report progress
      if (onProgress) {
        onProgress((pageNum / pdf.numPages) * 100);
      }
    }
    
    return images;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const supportedFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );
    
    if (supportedFiles.length !== acceptedFiles.length) {
      setError('Only PDF and image files are supported');
      return;
    }

    if (supportedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setFiles(supportedFiles);
    setError('');
    setResults([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleOptionChange = (key: keyof OCROptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleScan = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsScanning(true);
    setError('');
    setResults([]);
    setProgress([]);

    try {
      const ocrResults: OCRResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Initialize progress for this file
        setProgress(prev => [...prev, {
          status: 'Initializing...',
          progress: 0,
          fileName: file.name
        }]);

        try {
          // For PDF files, we need to convert to image first
          if (file.type === 'application/pdf') {
            setProgress(prev => prev.map(p => 
              p.fileName === file.name 
                ? { ...p, status: 'Converting PDF to images...', progress: 10 }
                : p
            ));
            
            const images = await convertPDFToImages(file, (progress) => {
              setProgress(prev => prev.map(p => 
                p.fileName === file.name 
                  ? { ...p, status: `Converting PDF... ${Math.round(progress)}%`, progress: Math.round(progress * 0.3) + 10 }
                  : p
              ));
            });
            
            // Process each page image with OCR
            let combinedText = '';
            let totalConfidence = 0;
            
            for (let pageIndex = 0; pageIndex < images.length; pageIndex++) {
              const pageProgress = ((pageIndex + 1) / images.length) * 60; // 60% for OCR processing
              
              setProgress(prev => prev.map(p => 
                p.fileName === file.name 
                  ? { ...p, status: `Processing page ${pageIndex + 1}/${images.length}...`, progress: 40 + pageProgress }
                  : p
              ));
              
              const pageResult = await Tesseract.recognize(
                images[pageIndex],
                options.language,
                {
                  logger: (m) => {
                    if (m.status === 'recognizing text') {
                      const ocrProgress = Math.round(m.progress * 100);
                      setProgress(prev => prev.map(p => 
                        p.fileName === file.name 
                          ? { ...p, status: `OCR Page ${pageIndex + 1}/${images.length}: ${ocrProgress}%`, progress: 40 + pageProgress + (m.progress * (60 / images.length)) }
                          : p
                      ));
                    }
                  }
                }
              );
              
              combinedText += `\n\n--- Page ${pageIndex + 1} ---\n${pageResult.data.text}`;
              totalConfidence += pageResult.data.confidence;
            }
            
            ocrResults.push({
              text: combinedText.trim(),
              confidence: totalConfidence / images.length,
              fileName: file.name
            });
            
            continue; // Skip the regular image processing below
          }

          // Process image files with Tesseract
          const result = await Tesseract.recognize(
            file,
            options.language,
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  const progressPercent = Math.round(m.progress * 100);
                  setProgress(prev => prev.map(p => 
                    p.fileName === file.name 
                      ? { ...p, status: `Recognizing text... ${progressPercent}%`, progress: progressPercent }
                      : p
                  ));
                }
              }
            }
          );

          ocrResults.push({
            text: result.data.text,
            confidence: result.data.confidence,
            fileName: file.name
          });

          setProgress(prev => prev.map(p => 
            p.fileName === file.name 
              ? { ...p, status: 'Completed', progress: 100 }
              : p
          ));

        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          setProgress(prev => prev.map(p => 
            p.fileName === file.name 
              ? { ...p, status: `Error: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`, progress: 0 }
              : p
          ));
        }
      }

      setResults(ocrResults);
      
      // Call the parent onProcess function if needed
      if (ocrResults.length > 0) {
        await onProcess(files, { ...options, results: ocrResults });
      }
      
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(`Failed to scan files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadText = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Scan className="w-5 h-5 text-upsa-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            OCR Scanner
          </h2>
        </div>
        <p className="text-gray-600 mt-1">
          Extract text from images and scanned PDFs using optical character recognition
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
            {isDragActive ? 'Drop files here' : 'Upload Files for OCR'}
          </p>
          <p className="text-gray-600">
            Drag and drop PDF files or images here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, PNG, JPG, JPEG, GIF, BMP, TIFF
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
                  {file.type === 'application/pdf' ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
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

      {/* OCR Options */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">OCR Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={options.language}
              onChange={(e) => handleOptionChange('language', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
            >
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
              <option value="rus">Russian</option>
              <option value="chi_sim">Chinese (Simplified)</option>
              <option value="jpn">Japanese</option>
              <option value="kor">Korean</option>
            </select>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              value={options.outputFormat}
              onChange={(e) => handleOptionChange('outputFormat', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
            >
              <option value="text">Plain Text</option>
              <option value="pdf">Searchable PDF</option>
              <option value="docx">Word Document</option>
            </select>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 text-sm">Advanced Options</h4>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.preserveFormatting}
              onChange={(e) => handleOptionChange('preserveFormatting', e.target.checked)}
              className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
            />
            <span className="text-sm text-gray-700">Preserve original formatting</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.enhanceImage}
              onChange={(e) => handleOptionChange('enhanceImage', e.target.checked)}
              className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
            />
            <span className="text-sm text-gray-700">Enhance image quality before OCR</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.detectTables}
              onChange={(e) => handleOptionChange('detectTables', e.target.checked)}
              className="w-4 h-4 text-upsa-blue border-gray-300 rounded focus:ring-upsa-gold"
            />
            <span className="text-sm text-gray-700">Detect and preserve table structures</span>
          </label>
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

      {/* Progress Indicators */}
      {progress.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Processing Progress</h3>
          {progress.map((prog, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{prog.fileName}</span>
                <span className="text-sm text-gray-600">{prog.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-upsa-blue to-upsa-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${prog.progress}%` }}
                />
              </div>
              <div className="flex items-center space-x-2">
                {prog.status.includes('Error') ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : prog.progress === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                <span className="text-sm text-gray-600">{prog.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scan Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleScan}
        disabled={isProcessing || isScanning || files.length === 0 || !pdfLibLoaded}
        className="w-full bg-gradient-to-r from-upsa-blue to-upsa-gold text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Scanning with Tesseract.js...</span>
          </>
        ) : isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Processing...</span>
          </>
        ) : !pdfLibLoaded ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading PDF.js...</span>
          </>
        ) : (
          <>
            <Scan className="w-5 h-5" />
            <span>Start OCR Scan</span>
          </>
        )}
      </motion.button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Extracted Text</h3>
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      Confidence: {result.confidence.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(result.text)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadText(result.text, result.fileName)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                      title="Download as text file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="bg-white border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {result.text}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Powered by Tesseract.js:</p>
            <ul className="space-y-1 text-xs">
              <li>• Client-side OCR processing with Tesseract.js</li>
              <li>• Supports 100+ languages and character sets</li>
              <li>• Real-time progress tracking and confidence scoring</li>
              <li>• Works with PNG, JPG, JPEG, GIF, BMP, and TIFF images</li>
              <li>• PDF support with automatic page-by-page processing</li>
              <li>• No server upload required - all processing happens locally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}