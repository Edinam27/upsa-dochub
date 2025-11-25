'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Upload, Download, Settings, Info, Type, Pen, Image as ImageIcon } from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import { ProcessingOptions } from '@/lib/types';

interface AddSignatureToolProps {
  onProcess: (files: File[], options: ProcessingOptions) => void;
  isProcessing: boolean;
}

type SignatureType = 'draw' | 'type' | 'upload';

export default function AddSignatureTool({ onProcess, isProcessing }: AddSignatureToolProps) {
  const [signatureType, setSignatureType] = useState<SignatureType>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [signatureFont, setSignatureFont] = useState('cursive');
  const [signatureColor, setSignatureColor] = useState('#000000');
  const [signatureSize, setSignatureSize] = useState(24);
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 80 }); // Percentage from top-left
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFileSelect = useCallback((fileInfos: any[]) => {
    const files = fileInfos.map(fileInfo => fileInfo.file);
    setSelectedFiles(files);
  }, []);

  const isSignatureReady = useMemo(() => {
    if (signatureType === 'draw') {
      return hasDrawnSignature;
    } else if (signatureType === 'type') {
      return signatureText.trim().length > 0;
    } else if (signatureType === 'upload') {
      return signatureImage !== null;
    }
    return false;
  }, [signatureType, signatureText, signatureImage, hasDrawnSignature]);

  const handleProcess = useCallback(() => {
    if (selectedFiles.length === 0 || !isSignatureReady) return;

    const signatureData = {
      type: signatureType,
      ...(signatureType === 'draw' && {
        canvas: canvasRef.current?.toDataURL()
      }),
      ...(signatureType === 'type' && {
        text: signatureText,
        font: signatureFont,
        color: signatureColor,
        size: signatureSize
      }),
      ...(signatureType === 'upload' && {
        image: signatureImage
      })
    };

    const options: ProcessingOptions = {
      signature: signatureData,
      position
    };

    onProcess(selectedFiles, options);
  }, [selectedFiles, signatureType, signatureText, signatureFont, signatureColor, signatureSize, signatureImage, position, onProcess]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasDrawnSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawnSignature(false);
      }
    }
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignatureImage(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-500 rounded-lg p-2">
            <Edit3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Signature</h2>
            <p className="text-gray-600">Add digital signatures to your PDF documents</p>
          </div>
        </div>
        
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Signature Options:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Draw your signature using mouse or touch</li>
                <li>Type your name with various fonts</li>
                <li>Upload an image of your signature</li>
                <li>Position the signature anywhere on the document</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Signature Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSignatureType('draw');
              setHasDrawnSignature(false);
            }}
            className={`p-4 rounded-lg border-2 transition-colors ${
              signatureType === 'draw'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Pen className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Draw</div>
            <div className="text-xs text-gray-500">Draw your signature</div>
          </button>
          
          <button
            onClick={() => {
              setSignatureType('type');
              setHasDrawnSignature(false);
            }}
            className={`p-4 rounded-lg border-2 transition-colors ${
              signatureType === 'type'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Type className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Type</div>
            <div className="text-xs text-gray-500">Type your name</div>
          </button>
          
          <button
            onClick={() => {
              setSignatureType('upload');
              setHasDrawnSignature(false);
            }}
            className={`p-4 rounded-lg border-2 transition-colors ${
              signatureType === 'upload'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Upload</div>
            <div className="text-xs text-gray-500">Upload image</div>
          </button>
        </div>
      </motion.div>

      {/* Signature Creation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Create Signature</h3>
        
        {signatureType === 'draw' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw your signature below:
              </label>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="border border-gray-300 rounded-lg cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <button
                onClick={clearCanvas}
                className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {signatureType === 'type' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font
                </label>
                <select
                  value={signatureFont}
                  onChange={(e) => setSignatureFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="cursive">Cursive</option>
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {signatureSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={signatureSize}
                  onChange={(e) => setSignatureSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={signatureColor}
                  onChange={(e) => setSignatureColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {signatureText && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div
                  style={{
                    fontFamily: signatureFont,
                    fontSize: `${signatureSize}px`,
                    color: signatureColor
                  }}
                >
                  {signatureText}
                </div>
              </div>
            )}
          </div>
        )}

        {signatureType === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Signature Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {signatureImage && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {signatureImage.name}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Position Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Position Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horizontal Position: {position.x}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.x}
              onChange={(e) => setPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertical Position: {position.y}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(e) => setPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <FileUpload
           onFilesAdded={handleFileSelect}
           acceptedTypes={['application/pdf']}
           maxFiles={1}
           maxFileSize={10 * 1024 * 1024} // 10MB
           disabled={isProcessing}
         />
         
         {selectedFiles.length > 0 && (
           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
             <div className="flex items-center gap-2">
               <Upload className="h-4 w-4 text-blue-600" />
               <span className="text-sm font-medium text-blue-900">Selected File:</span>
               <span className="text-sm text-blue-700">{selectedFiles[0].name}</span>
             </div>
           </div>
         )}
         
         {selectedFiles.length > 0 && (
           <div className="mt-4">
             {!isSignatureReady && (
               <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                 <p className="text-sm text-yellow-800">
                   {signatureType === 'draw' && 'Please draw your signature above'}
                   {signatureType === 'type' && 'Please enter your name above'}
                   {signatureType === 'upload' && 'Please upload a signature image above'}
                 </p>
               </div>
             )}
             <button
               onClick={handleProcess}
               disabled={isProcessing || !isSignatureReady}
               className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
             >
               {isProcessing ? 'Adding Signature...' : 'Add Signature to PDF'}
             </button>
           </div>
         )}
      </motion.div>
    </div>
  );
}