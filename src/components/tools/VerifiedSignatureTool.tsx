'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Download,
  QrCode,
  CheckCircle,
  PenTool,
  Move,
  Loader2,
  User,
  File as FileIcon
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import QRCode from 'qrcode';
import { PDFDocument, rgb } from 'pdf-lib';

interface VerifiedSignatureToolProps {
  onProcess?: (files: File[], options: any) => Promise<void>;
  isProcessing?: boolean;
}

const VerifiedSignatureTool: React.FC<VerifiedSignatureToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signerName, setSignerName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 80 }); // Percentages
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('type');
  const [signatureText, setSignatureText] = useState('');
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Generate preview of first page
  const generatePreview = async (file: File) => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Ensure worker is set up correctly
      if (typeof window !== 'undefined') {
        // Force worker URL to be set
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Use standard loading task pattern
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas
        }).promise;
        setPreviewUrl(canvas.toDataURL());
        setPdfDimensions({ width: viewport.width, height: viewport.height });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback or user notification could be added here
      alert(`Failed to generate PDF preview: ${(error as Error).message}`);
    }
  };

  const handleFileSelect = (files: any[]) => {
    if (files.length > 0) {
      const selectedFile = files[0].file;
      setFile(selectedFile);
      setDocumentName(selectedFile.name);
      generatePreview(selectedFile);
      setStep(2);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setDragActive(true);
    // Set transparent drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (containerRef.current && e.clientX !== 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Clamp values
      const clampedX = Math.max(0, Math.min(90, x));
      const clampedY = Math.max(0, Math.min(90, y));
      
      setSignaturePosition({ x: clampedX, y: clampedY });
    }
  };

  const handleDragEnd = () => {
    setDragActive(false);
  };

  const handleSign = async () => {
    if (!file || !signerName) return;

    setIsProcessing(true);
    try {
      // 1. Generate Hash from API
      const response = await fetch('/api/sign/generate-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, documentName })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // 2. Generate QR Code
      const qrDataUrl = await QRCode.toDataURL(data.hash, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // 3. Process PDF
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0]; // Currently supporting first page only for MVP
      const { width, height } = firstPage.getSize();

      // Embed QR Code
      const qrImage = await pdfDoc.embedPng(qrDataUrl);
      const qrDims = qrImage.scale(0.8); // Scale down slightly

      // Calculate positions (converting from percentage to PDF coordinates)
      // PDF coordinates start from bottom-left
      const x = (signaturePosition.x / 100) * width;
      const y = height - ((signaturePosition.y / 100) * height); // Flip Y axis

      // Draw QR Code
      firstPage.drawImage(qrImage, {
        x: x,
        y: y - qrDims.height, // Anchor top-left
        width: qrDims.width,
        height: qrDims.height,
      });

      // Draw Signature Text (Simple implementation)
      firstPage.drawText(`Signed by: ${signerName}`, {
        x: x + qrDims.width + 10,
        y: y - 20,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      firstPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: x + qrDims.width + 10,
        y: y - 40,
        size: 10,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Save PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Download
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setStep(3);
    } catch (error) {
      console.error('Signing error:', error);
      alert('Failed to sign document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Signature</h2>
        <p className="text-gray-600">Add a secure, trackable signature with QR code verification</p>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FileUpload
            onFilesAdded={handleFileSelect}
            acceptedTypes={['application/pdf']}
            maxFiles={1}
            maxFileSize={50 * 1024 * 1024}
          />
        </div>
      )}

      {/* Step 2: Configure & Sign */}
      {step === 2 && file && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" /> Signer Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-4">
                  Drag the signature box on the preview to position your signature.
                </p>
                
                <button
                  onClick={handleSign}
                  disabled={!signerName || isProcessing}
                  className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                    !signerName || isProcessing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  } transition-all duration-200`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>Sign Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="md:col-span-2">
            <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 min-h-[500px] flex items-center justify-center relative overflow-hidden">
              {previewUrl ? (
                <div 
                  ref={containerRef}
                  className="relative shadow-xl"
                  style={{ maxWidth: '100%' }}
                >
                  <img 
                    src={previewUrl} 
                    alt="PDF Preview" 
                    className="max-w-full h-auto rounded-lg"
                    draggable={false}
                  />
                  
                  {/* Draggable Signature Box */}
                  <div
                    draggable
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    className="absolute cursor-move group"
                    style={{
                      left: `${signaturePosition.x}%`,
                      top: `${signaturePosition.y}%`,
                      transform: 'translate(0, 0)', // Simple positioning
                    }}
                  >
                    <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-lg p-3 shadow-lg flex items-center gap-3 hover:border-solid transition-all">
                      <QrCode className="w-12 h-12 text-gray-800" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{signerName || 'Signer Name'}</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>
                      <Move className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 bg-white rounded-full p-0.5 border border-blue-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Generating preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Document Signed Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your document has been signed with a verifiable QR code. The hash has been stored securely.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setSignerName('');
                setPreviewUrl(null);
              }}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Sign Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedSignatureTool;
