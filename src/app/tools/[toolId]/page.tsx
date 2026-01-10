'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Shield, 
  Zap,
  Download,
  Upload,
  Settings,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { TOOLS, getToolById } from '@/lib/tools-config';
import { useUserPreferencesStore, useUsageStatsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import FileUpload from '@/components/upload/FileUpload';
import ProcessingProgress from '@/components/upload/ProcessingProgress';
import MergePDFTool from '@/components/tools/MergePDFTool';
import SplitPDFTool from '@/components/tools/SplitPDFTool';
import CompressPDFTool from '@/components/tools/CompressPDFTool';
import WatermarkPDFTool from '@/components/tools/WatermarkPDFTool';
import PasswordProtectPDFTool from '@/components/tools/PasswordProtectPDFTool';
import OCRScannerTool from '@/components/tools/OCRScannerTool';
import ImagesToPDFTool from '@/components/tools/ImagesToPDFTool';
import ExtractPagesTool from '@/components/tools/ExtractPagesTool';
import PDFToImagesTool from '@/components/tools/PDFToImagesTool';

import RotatePDFTool from '@/components/tools/RotatePDFTool';
import RepairPDFTool from '@/components/tools/RepairPDFTool';
import PDFToWordTool from '@/components/tools/PDFToWordTool';
import WordToPDFTool from '@/components/tools/WordToPDFTool';
import WatermarkRemovalTool from '@/components/tools/WatermarkRemovalTool';
import ImageCompressionTool from '@/components/tools/ImageCompressionTool';
import AddSignatureTool from '@/components/tools/AddSignatureTool';
import UnlockPDFTool from '@/components/tools/UnlockPDFTool';
import VerifiedSignatureTool from '@/components/tools/VerifiedSignatureTool';
import VerifyDocumentTool from '@/components/tools/VerifyDocumentTool';

import { createPDFProcessor } from '@/lib/pdf-processors';

export default function ToolPage() {
  const params = useParams();
  const toolId = params.toolId as string;
  const tool = getToolById(toolId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { preferences, toggleFavoriteTool } = useUserPreferencesStore();
  const { incrementToolUsage } = useUsageStatsStore();
  
  // Redirect to 404 if tool not found
  if (!tool) {
    notFound();
  }
  
  const isFavorite = preferences.favoriteTools?.includes(toolId) || false;
  
  // Track tool usage
  useEffect(() => {
    incrementToolUsage(toolId);
  }, [toolId, incrementToolUsage]);
  
  const handleStartProcessing = async (files: File[], options?: any) => {
    setIsProcessing(true);
    try {
      const processor = createPDFProcessor(toolId, options);
      if (!processor) {
        throw new Error(`No processor found for tool: ${toolId}`);
      }

      let results: any[] = [];
      
      // Handle specific processors that accept File[] vs File
      if (toolId === 'pdf-merge' || toolId === 'merge') {
        // PDFMerger accepts File[]
        results = await (processor as any).process(files);
      } else {
        // For others (split, compress, etc.), process each file individually
        const allResults: any[] = [];
        for (const file of files) {
          // Cast processor to any to avoid strict type checks on process signature mismatch
          const fileResults = await (processor as any).process(file);
          if (Array.isArray(fileResults)) {
            allResults.push(...fileResults);
          } else {
            allResults.push(fileResults);
          }
        }
        results = allResults;
      }

      if (results && results.length > 0) {
        results.forEach((processedFile: any) => {
          // Trigger download
          // Check if processedFile has downloadUrl (client-side) or data (legacy/server-side)
          let url = processedFile.downloadUrl;
          
          if (!url && processedFile.data) {
             // Fallback for data array
             const uint8Array = new Uint8Array(processedFile.data);
             const blob = new Blob([uint8Array], { type: processedFile.type || 'application/pdf' });
             url = URL.createObjectURL(blob);
          }

          if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = processedFile.name || `processed-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Only revoke if we created it here (not if it came from processor)
            // But processor likely created it. 
          }
        });
        
        if (typeof window !== 'undefined') {
          const detail = { toolId, data: results };
          window.dispatchEvent(new CustomEvent('processing:result', { detail }));
        }
      } else {
        throw new Error('No processed files received');
      }
      return results;
    } catch (error) {
      console.error('Processing error:', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderToolComponent = () => {
    switch (toolId) {
      case 'pdf-merge':
        return <MergePDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-split':
        return <SplitPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-compress':
        return <CompressPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-watermark':
        return <WatermarkPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-protect':
        return <PasswordProtectPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-unlock':
        return <UnlockPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-ocr':
        return <OCRScannerTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'images-to-pdf':
        return <ImagesToPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-to-images':
        return <PDFToImagesTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-extract':
        return <ExtractPagesTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;

      case 'pdf-rotate':
        return <RotatePDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-repair':
        return <RepairPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'pdf-to-word':
        return <PDFToWordTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'word-to-pdf':
        return <WordToPDFTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'watermark-removal':
        return <WatermarkRemovalTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'image-compress':
        return <ImageCompressionTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'add-signature':
        return <AddSignatureTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'verified-signature':
        return <VerifiedSignatureTool onProcess={handleStartProcessing} isProcessing={isProcessing} />;
      case 'verify-document':
        return <VerifyDocumentTool />;
      default:
        return (
          <div className="p-6">
            <FileUpload 
              maxFiles={tool.maxFiles}
              maxFileSize={tool.maxFileSize}
              acceptedTypes={tool.acceptedTypes}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/tools"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white`}>
                  {tool.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tool.name}
                  </h1>
                  <p className="text-gray-600">
                    {tool.category} • {tool.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleFavoriteTool(toolId)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isFavorite
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Star className={cn('w-5 h-5', isFavorite && 'fill-current')} />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tool-Specific Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {renderToolComponent()}
            </motion.div>
            
            {/* Processing Section */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-upsa-gold" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Processing
                    </h2>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Your files are being processed...
                  </p>
                </div>
                
                <div className="p-6">
                  <ProcessingProgress />
                </div>
              </motion.div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-upsa-blue" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Tool Settings
                    </h2>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Customize processing options for this tool
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Quality Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Quality
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent">
                      <option value="high">High Quality</option>
                      <option value="medium">Medium Quality</option>
                      <option value="low">Low Quality (Faster)</option>
                    </select>
                  </div>
                  
                  {/* Compression Settings */}
                  {tool.id.includes('compress') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compression Level
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        defaultValue="5"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Light</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Page Range Settings */}
                  {(tool.id.includes('split') || tool.id.includes('extract')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 1-5, 8, 10-12"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  {/* Password Settings */}
                  {tool.id.includes('protect') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Protection
                      </label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tool Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Info className="w-5 h-5 text-upsa-blue" />
                <h3 className="text-lg font-semibold text-gray-900">
                  About This Tool
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  {tool.description}
                </p>
                
                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Supported Formats */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.acceptedTypes?.map((format, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {format}
                      </span>
                    )) || (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">
                  Secure Processing
                </h3>
              </div>
              
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>All processing happens locally in your browser</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your files never leave your device</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>No data is stored on our servers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>GDPR compliant and privacy-focused</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Quick Tips
                </h3>
              </div>
              
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>For best results, use high-quality PDF files</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Large files may take longer to process</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>You can process multiple files at once</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Use the settings panel for advanced options</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}