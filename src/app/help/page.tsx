'use client';

import { FileText, Image, Type, Edit, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Help Center
          </h1>
          <p className="text-center text-lg text-gray-600">
            Everything you need to know about using UPSA DocHub
          </p>
        </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Quick Start Guide
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Choose Your Tool</h4>
              <p className="text-gray-600">Select the PDF processing tool you need from our homepage or tools page.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Upload Your File</h4>
              <p className="text-gray-600">Drag and drop your PDF file or click to browse and select it from your device.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Process & Download</h4>
              <p className="text-gray-600">Click the process button and wait for conversion. Download your converted file when ready.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Guides */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Tool Guides</h2>

        {/* PDF to Word */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF to Word Converter
          </h3>
          <p className="text-gray-600 mb-4">
            Convert PDF documents to editable Word format
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">How it works:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Preserves original formatting and layout</li>
                <li>Maintains text structure and fonts</li>
                <li>Converts images and tables accurately</li>
                <li>Supports password-protected PDFs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Best practices:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Use high-quality PDF files for better results</li>
                <li>Ensure text is selectable (not scanned images)</li>
                <li>Check the converted document for formatting accuracy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PDF to Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Image className="h-5 w-5" />
            PDF to Images Converter
          </h3>
          <p className="text-gray-600 mb-4">
            Extract pages from PDF as high-quality images
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Convert all pages or select specific pages</li>
                <li>Multiple output formats: PNG, JPEG, WEBP</li>
                <li>Adjustable image quality and resolution</li>
                <li>Batch download as ZIP file</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Use PNG for documents with text for better clarity</li>
                <li>Choose JPEG for documents with many images to reduce file size</li>
                <li>Higher DPI settings produce larger but clearer images</li>
              </ul>
            </div>
          </div>
        </div>

        {/* OCR Text Extraction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Type className="h-5 w-5" />
            OCR Text Extraction
          </h3>
          <p className="text-gray-600 mb-4">
            Extract text from scanned PDFs and images
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Capabilities:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Recognizes text in multiple languages</li>
                <li>Handles handwritten text (with limitations)</li>
                <li>Preserves text structure and formatting</li>
                <li>Works with scanned documents and images</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">For best results:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Use clear, high-resolution scanned documents</li>
                <li>Ensure text is not skewed or rotated</li>
                <li>Good lighting and contrast improve accuracy</li>
                <li>Clean documents without stains or marks work better</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PDF Editor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Edit className="h-5 w-5" />
            PDF Editor
          </h3>
          <p className="text-gray-600 mb-4">
            Edit and modify PDF documents directly
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Editing features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Add, edit, and delete text</li>
                <li>Insert images and shapes</li>

                <li>Merge and split PDF pages</li>
                <li>Add digital signatures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Usage tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Save your work frequently while editing</li>
                <li>Use the undo/redo functions for quick corrections</li>
                <li>Preview changes before finalizing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* File Requirements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Requirements & Limitations
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Supported formats:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>PDF files (.pdf)</li>
              <li>Maximum file size: 10MB</li>
              <li>Password-protected PDFs supported</li>
              <li>Multi-page documents supported</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Processing limits:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Maximum 50 pages per document</li>
              <li>Processing time varies by file size</li>
              <li>Concurrent processing limit: 3 files</li>
              <li>Files are automatically deleted after 24 hours</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Troubleshooting
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800">Upload issues:</h4>
            <p className="text-sm text-gray-600">If upload fails, check file size (max 10MB) and ensure it's a valid PDF format.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Processing errors:</h4>
            <p className="text-sm text-gray-600">Try refreshing the page and uploading again. For persistent issues, contact support.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Download problems:</h4>
            <p className="text-sm text-gray-600">Ensure your browser allows downloads and check your download folder.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Quality issues:</h4>
            <p className="text-sm text-gray-600">For better results, use high-quality source files and appropriate settings.</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Need More Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you can't find the answer you're looking for, don't hesitate to reach out to our support team.
        </p>
        <div className="flex gap-4">
          <a href="/contact-support" className="text-blue-600 hover:underline text-sm font-medium">
            Contact Support
          </a>
          <a href="/faq" className="text-blue-600 hover:underline text-sm font-medium">
            View FAQ
          </a>
        </div>
      </div>
    </div>
  );
}