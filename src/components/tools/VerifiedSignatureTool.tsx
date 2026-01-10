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

  // New State for enhancements
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [signatureSize, setSignatureSize] = useState(0.8);
  const [fontSize, setFontSize] = useState(12);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Generate preview of specific page
  const generatePreview = async (file: File, pageNumber: number) => {
    try {
      const { pdfjs: pdfjsLib } = await import('react-pdf');
      
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }

      const arrayBuffer = await file.arrayBuffer();
      const getDocument = pdfjsLib.getDocument;
      const loadingTask = getDocument({ data: arrayBuffer });
      
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);

      // Clamp page number
      const targetPage = Math.max(1, Math.min(pageNumber, pdf.numPages));
      const page = await pdf.getPage(targetPage);
      
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
      alert(`Failed to generate PDF preview: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    if (file) {
      generatePreview(file, currentPage);
    }
  }, [currentPage, file]);

  const handleFileSelect = (files: any[]) => {
    if (files.length > 0) {
      const selectedFile = files[0].file;
      setFile(selectedFile);
      setDocumentName(selectedFile.name);
      setCurrentPage(1); // Reset to first page
      // generatePreview called by useEffect
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

      // Check for offline mode
      if (data.offline) {
        const proceed = window.confirm(
          'Warning: Database connection failed.\n\n' +
          'This signature will be generated in OFFLINE mode. It cannot be verified online later because no database entry will be created.\n\n' +
          'Do you want to proceed with an unverified signature?'
        );
        
        if (!proceed) {
          setIsProcessing(false);
          return;
        }
      } else {
        // Only set verification ID if online
        setVerificationId(data.id);
      }

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
      
      const pageIndex = currentPage - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) {
        throw new Error(`Invalid page number. Document has ${pages.length} pages.`);
      }
      
      const pageToSign = pages[pageIndex];
      const { width, height } = pageToSign.getSize();

      // Embed QR Code
      const qrImage = await pdfDoc.embedPng(qrDataUrl);
      const qrDims = qrImage.scale(signatureSize); 

      // Calculate positions (converting from percentage to PDF coordinates)
      // PDF coordinates start from bottom-left
      const x = (signaturePosition.x / 100) * width;
      const y = height - ((signaturePosition.y / 100) * height); // Flip Y axis

      // Draw QR Code
      pageToSign.drawImage(qrImage, {
        x: x,
        y: y - qrDims.height, // Anchor top-left
        width: qrDims.width,
        height: qrDims.height,
      });

      // Draw Signature Text (Simple implementation)
      pageToSign.drawText(`Signed by: ${signerName}`, {
        x: x + qrDims.width + 10,
        y: y - 20,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      
      pageToSign.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: x + qrDims.width + 10,
        y: y - 40,
        size: Math.max(8, fontSize - 2),
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
      alert(`Failed to sign document: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Signature Receipt</h2>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Number (Total: {numPages})
                </label>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature Size: {signatureSize}
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.1"
                  value={signatureSize}
                  onChange={(e) => setSignatureSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
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
                      <QrCode 
                        style={{ width: `${48 * signatureSize}px`, height: `${48 * signatureSize}px` }} 
                        className="text-gray-800" 
                      />
                      <div>
                        <p 
                          style={{ fontSize: `${fontSize}px` }}
                          className="font-bold text-gray-900"
                        >
                          {signerName || 'Signer Name'}
                        </p>
                        <p 
                          style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}
                          className="text-gray-500"
                        >
                          {new Date().toLocaleDateString()}
                        </p>
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
          
          {verificationId && (
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-6 max-w-sm mx-auto">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Verification Record ID</p>
              <code className="text-sm font-mono text-green-700 break-all select-all">
                {verificationId}
              </code>
            </div>
          )}

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
