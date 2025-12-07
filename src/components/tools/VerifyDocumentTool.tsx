'use client';

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  ScanLine, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload,
  ShieldCheck,
  Calendar,
  User,
  FileText
} from 'lucide-react';

const VerifyDocumentTool = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    verifySignature(decodedText);
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Document</h2>
        <p className="text-gray-600">Scan the QR code on the document to verify its authenticity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-500" />
            Scan QR Code
          </h3>
          <div id="reader" className="overflow-hidden rounded-lg"></div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Point your camera at the QR code on the signed document.
          </p>
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
            </div>
          )}

          {!isVerifying && error && (
            <div className="bg-red-50 rounded-lg p-6 border border-red-100 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Verification Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!isVerifying && !verificationResult && !error && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
              <ScanLine className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for scan...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyDocumentTool;
