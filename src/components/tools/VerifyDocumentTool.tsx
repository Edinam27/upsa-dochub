'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ScanLine, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  Camera,
  Image as ImageIcon,
  FileType
} from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';

type ScanMode = 'camera' | 'image' | 'pdf';

const VerifyDocumentTool = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ScanMode>('camera');
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // Initialize/Cleanup Scanner for Camera Mode
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      if (activeMode === 'camera') {
        try {
          // Add a small delay to ensure the DOM element exists
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!document.getElementById('reader')) return;

          html5QrCode = new Html5Qrcode("reader");
          setScannerInstance(html5QrCode);

          await html5QrCode.start(
            { facingMode: "environment" },
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              // Optional: Pause scanner after success
              html5QrCode?.pause();
            },
            (errorMessage) => {
              // Ignore scan errors, they happen every frame
            }
          );
          setCameraPermissionError(false);
        } catch (err) {
          console.error("Error starting scanner", err);
          setCameraPermissionError(true);
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode?.clear();
        }).catch(console.error);
      }
    };
  }, [activeMode]);

  const onScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    verifySignature(decodedText);
  };

  const handleImageUpload = async (files: any[]) => {
    if (files.length === 0) return;
    const file = files[0].file;
    
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const html5QrCode = new Html5Qrcode("file-scanner-temp");
      const result = await html5QrCode.scanFile(file, true);
      onScanSuccess(result);
    } catch (err) {
      console.error("Error scanning image", err);
      setError("Could not find a valid QR code in this image.");
      setIsVerifying(false);
    }
  };

  const handlePdfUpload = async (files: any[]) => {
    if (files.length === 0) return;
    const file = files[0].file;

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Import PDF.js dynamically
      const { pdfjs } = await import('react-pdf');
      if (typeof window !== 'undefined') {
        const { PDF_WORKER_URL } = await import('@/lib/pdf-worker');
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      // We'll scan the first page, as that's where signatures usually are in this app
      // For more robustness, we could loop through pages
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better QR resolution
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) throw new Error("Could not create canvas context");

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to File
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to process PDF page.");
          setIsVerifying(false);
          return;
        }
        
        const imageFile = new File([blob], "page-scan.png", { type: "image/png" });
        
        try {
          const html5QrCode = new Html5Qrcode("file-scanner-temp");
          const result = await html5QrCode.scanFile(imageFile, true);
          onScanSuccess(result);
        } catch (err) {
          console.error("Error scanning PDF page", err);
          setError("Could not find a valid QR code on the first page of this PDF.");
          setIsVerifying(false);
        }
      }, 'image/png');

    } catch (err) {
      console.error("Error processing PDF", err);
      setError("Failed to read the PDF file.");
      setIsVerifying(false);
    }
  };

  const verifySignature = async (hash: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/sign/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerificationResult(data);
    } catch (err: any) {
      setError(err.message);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setVerificationResult(null);
    setError(null);
    setIsVerifying(false);
    if (activeMode === 'camera' && scannerInstance) {
      scannerInstance.resume();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Document</h2>
        <p className="text-gray-600">Scan the QR code on the document to verify its authenticity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-500" />
            Input Source
          </h3>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => setActiveMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeMode === 'camera' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
            <button
              onClick={() => setActiveMode('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeMode === 'image' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => setActiveMode('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeMode === 'pdf' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileType className="w-4 h-4" />
              PDF
            </button>
          </div>

          {/* Mode Content */}
          <div className="flex-1 min-h-[300px] flex flex-col justify-center">
            {activeMode === 'camera' && (
              <div className="relative rounded-lg overflow-hidden bg-black aspect-square max-w-[300px] mx-auto w-full">
                {cameraPermissionError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-sm">Camera permission denied or unavailable.</p>
                  </div>
                ) : (
                  <div id="reader" className="w-full h-full"></div>
                )}
              </div>
            )}

            {activeMode === 'image' && (
              <div className="w-full">
                <FileUpload
                  onFilesAdded={handleImageUpload}
                  acceptedTypes={['image/png', 'image/jpeg', 'image/webp']}
                  maxFiles={1}
                  label="Upload QR Code Image"
                />
                <div id="file-scanner-temp" className="hidden"></div>
              </div>
            )}

            {activeMode === 'pdf' && (
              <div className="w-full">
                <FileUpload
                  onFilesAdded={handlePdfUpload}
                  acceptedTypes={['application/pdf']}
                  maxFiles={1}
                  label="Upload Signed PDF"
                />
                <div id="file-scanner-temp" className="hidden"></div>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            Verification Result
          </h3>

          {isVerifying && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Verifying signature...</p>
            </div>
          )}

          {!isVerifying && verificationResult && (
            <div className={`rounded-lg p-6 ${verificationResult.valid ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                {verificationResult.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h4 className={`font-bold ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {verificationResult.valid ? 'Valid Signature' : 'Invalid Signature'}
                  </h4>
                  <p className={`text-sm ${verificationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {verificationResult.valid ? 'This document is authentic.' : 'This QR code is not recognized.'}
                  </p>
                </div>
              </div>

              {verificationResult.valid && (
                <div className="space-y-3 pt-4 border-t border-green-200/50">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Signed By</p>
                      <p className="text-sm text-green-700">{verificationResult.signerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Document Name</p>
                      <p className="text-sm text-green-700">{verificationResult.documentName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Signed Date</p>
                      <p className="text-sm text-green-700">
                        {new Date(verificationResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={resetScan}
                className="mt-4 w-full py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Verify Another
              </button>
            </div>
          )}

          {!isVerifying && error && (
            <div className="bg-red-50 rounded-lg p-6 border border-red-100 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Verification Failed</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button 
                onClick={resetScan}
                className="w-full py-2 bg-white border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-50"
              >
                Try Again
              </button>
            </div>
          )}

          {!isVerifying && !verificationResult && !error && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
              <ScanLine className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for input...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyDocumentTool;
