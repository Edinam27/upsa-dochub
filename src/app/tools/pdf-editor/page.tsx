'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Type, 
  PenTool, 
  Settings, 
  Square, 
  Circle, 
  Palette, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Highlighter,
  Pen,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProcessingProgress from '@/components/upload/ProcessingProgress';

interface Annotation {
  id: string;
  type: 'highlight' | 'text' | 'draw';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  opacity: number;
  strokeWidth?: number;
  fontSize?: number;
  page: number;
  path?: string;
  points?: {x: number, y: number}[];
}

interface AnnotationSettings {
  highlightColor: string;
  textColor: string;
  opacity: number;
  strokeWidth: number;
  fontSize: number;
}

export default function PDFEditorPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationMode, setAnnotationMode] = useState<'highlight' | 'text' | 'draw'>('highlight');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{x: number, y: number}[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightStart, setHighlightStart] = useState<{x: number, y: number} | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [pendingAnnotation, setPendingAnnotation] = useState<Partial<Annotation> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<AnnotationSettings>({
    highlightColor: '#FFFF00',
    textColor: '#FF0000',
    opacity: 0.7,
    strokeWidth: 2,
    fontSize: 14
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PDF file from sessionStorage
    const storedPdfData = sessionStorage.getItem('pdfEditorFile');
    const storedPdfUrl = sessionStorage.getItem('pdfEditorUrl');
    
    if (storedPdfData && storedPdfUrl) {
      try {
        // Validate base64 format
        if (!storedPdfData.includes(',') || !storedPdfData.startsWith('data:')) {
          throw new Error('Invalid base64 format');
        }
        
        // Convert base64 back to File
        const base64Data = storedPdfData.split(',')[1];
        if (!base64Data) {
          throw new Error('No base64 data found');
        }
        
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new File([byteArray], 'document.pdf', { type: 'application/pdf' });
        
        setPdfFile(file);
        setPdfUrl(storedPdfUrl);
        
        // Annotations will be added by user interaction only
      } catch (error) {
        console.error('Error loading PDF from sessionStorage:', error);
        // Clear invalid data and redirect back to upload page
        sessionStorage.removeItem('pdfEditorFile');
        sessionStorage.removeItem('pdfEditorUrl');
        router.push('/tools/pdf-annotate');
      }
    } else {
      // Redirect back to upload page if no file found
      router.push('/tools/pdf-annotate');
    }
  }, [router]);

  const addAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: Date.now().toString()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX / zoom,
      y: (event.clientY - rect.top) * scaleY / zoom
    };
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const { x, y } = getCanvasCoordinates(event);

    if (annotationMode === 'text') {
      setPendingAnnotation({
        type: 'text',
        x,
        y,
        color: settings.textColor,
        opacity: settings.opacity,
        fontSize: settings.fontSize,
        page: currentPage
      });
      setShowTextInput(true);
    }
    // Highlight mode now uses mouse down/move/up for drag selection
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);
    
    if (annotationMode === 'draw') {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x, y }]);
    } else if (annotationMode === 'highlight') {
      setIsHighlighting(true);
      setHighlightStart({ x, y });
      setCurrentHighlight({ x, y, width: 0, height: settings.fontSize + 4 });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);
    
    if (isDrawing && annotationMode === 'draw') {
      setCurrentDrawPoints(prev => [...prev, { x, y }]);
    } else if (isHighlighting && highlightStart && annotationMode === 'highlight') {
      const width = Math.abs(x - highlightStart.x);
      const startX = Math.min(x, highlightStart.x);
      setCurrentHighlight({
        x: startX,
        y: highlightStart.y,
        width,
        height: settings.fontSize + 4
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentDrawPoints.length > 1) {
      addAnnotation({
        type: 'draw',
        x: Math.min(...currentDrawPoints.map(p => p.x)),
        y: Math.min(...currentDrawPoints.map(p => p.y)),
        points: currentDrawPoints,
        color: settings.textColor,
        opacity: settings.opacity,
        strokeWidth: settings.strokeWidth,
        page: currentPage
      });
      setCurrentDrawPoints([]);
    }
    
    if (isHighlighting && currentHighlight && currentHighlight.width > 5) {
      addAnnotation({
        type: 'highlight',
        x: currentHighlight.x,
        y: currentHighlight.y,
        width: currentHighlight.width,
        height: currentHighlight.height,
        color: settings.highlightColor,
        opacity: settings.opacity,
        page: currentPage
      });
    }
    
    setIsDrawing(false);
    setIsHighlighting(false);
    setHighlightStart(null);
    setCurrentHighlight(null);
  };

  const handleTextSubmit = () => {
    if (pendingAnnotation && textInput.trim()) {
      addAnnotation({
        ...pendingAnnotation,
        text: textInput.trim()
      } as Omit<Annotation, 'id'>);
      setTextInput('');
      setPendingAnnotation(null);
    }
    setShowTextInput(false);
  };

  const getCurrentPageAnnotations = () => {
    return annotations.filter(ann => ann.page === currentPage);
  };

  const handleSaveAndDownload = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('toolId', 'pdf-annotate');
      formData.append('annotations', JSON.stringify(annotations));
      formData.append('options', JSON.stringify({}));
      
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const processedFile = result.data[0];
          const uint8Array = new Uint8Array(processedFile.data);
          const blob = new Blob([uint8Array], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = processedFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          throw new Error(result.error || 'Failed to process PDF');
        }
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to process PDF');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error saving PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Annotations are only saved when user clicks Save & Download button

  const colors = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#800080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Black', value: '#000000' }
  ];

  const canSaveAndDownload = pdfFile; // Allow saving even without annotations

  if (!pdfFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading PDF editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/tools/pdf-annotate')}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">PDF Editor</h1>
          </div>
          <div className="text-sm text-gray-600">
            {pdfFile.name} • {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* PDF Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div 
                ref={pdfContainerRef}
                className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100"
                style={{ height: '600px' }}
              >
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  style={{ 
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-crosshair"
                  width={800}
                  height={600}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ 
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                />
                
                {/* Render Annotations */}
                {getCurrentPageAnnotations().map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: annotation.x * zoom,
                      top: annotation.y * zoom,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {annotation.type === 'highlight' && (
                      <div
                        style={{
                          width: (annotation.width || 100) * zoom,
                          height: (annotation.height || 20) * zoom,
                          backgroundColor: annotation.color,
                          opacity: annotation.opacity,
                          border: `2px solid ${annotation.color}`,
                          borderOpacity: 0.8
                        }}
                        className="rounded"
                      />
                    )}
                    {annotation.type === 'text' && (
                      <div
                        style={{
                          color: annotation.color,
                          fontSize: (annotation.fontSize || 14) * zoom,
                          opacity: annotation.opacity
                        }}
                        className="whitespace-nowrap"
                      >
                        {annotation.text}
                      </div>
                    )}
                    {annotation.type === 'draw' && annotation.points && annotation.points.length > 1 && (
                      <svg
                        width={800}
                        height={600}
                        className="absolute inset-0 pointer-events-none"
                        style={{ left: -annotation.x * zoom, top: -annotation.y * zoom }}
                      >
                        <polyline
                          points={annotation.points.map(p => `${p.x * zoom},${p.y * zoom}`).join(' ')}
                          stroke={annotation.color}
                          strokeWidth={(annotation.strokeWidth || 2) * zoom}
                          fill="none"
                          opacity={annotation.opacity}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
                
                {/* Current Drawing Path */}
                {isDrawing && currentDrawPoints.length > 1 && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    width={800}
                    height={600}
                  >
                    <polyline
                      points={currentDrawPoints.map(p => `${p.x * zoom},${p.y * zoom}`).join(' ')}
                      stroke={settings.textColor}
                      strokeWidth={settings.strokeWidth * zoom}
                      fill="none"
                      opacity={settings.opacity}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                
                {/* Current Highlight Selection */}
                {isHighlighting && currentHighlight && currentHighlight.width > 0 && (
                  <div
                    className="absolute pointer-events-none rounded"
                    style={{
                      left: currentHighlight.x * zoom,
                      top: currentHighlight.y * zoom,
                      width: currentHighlight.width * zoom,
                      height: currentHighlight.height * zoom,
                      backgroundColor: settings.highlightColor,
                      opacity: settings.opacity * 0.7,
                      border: `2px dashed ${settings.highlightColor}`,
                      borderOpacity: 1
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Annotation Tools Sidebar */}
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Annotation Mode</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setAnnotationMode('highlight')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    annotationMode === 'highlight'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Highlighter className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Highlight</span>
                </button>
                <button
                  onClick={() => setAnnotationMode('text')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    annotationMode === 'text'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Type className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Text</span>
                </button>
                <button
                  onClick={() => setAnnotationMode('draw')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    annotationMode === 'draw'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <PenTool className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Draw</span>
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      if (annotationMode === 'highlight') {
                        setSettings({ ...settings, highlightColor: color.value });
                      } else {
                        setSettings({ ...settings, textColor: color.value });
                      }
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      (annotationMode === 'highlight' ? settings.highlightColor : settings.textColor) === color.value
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {Math.round(settings.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.opacity}
                    onChange={(e) => setSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Stroke Width / Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {annotationMode === 'text' ? 'Font Size' : 'Stroke Width'}: {annotationMode === 'text' ? settings.fontSize : settings.strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min={annotationMode === 'text' ? '8' : '1'}
                    max={annotationMode === 'text' ? '24' : '10'}
                    step="1"
                    value={annotationMode === 'text' ? settings.fontSize : settings.strokeWidth}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (annotationMode === 'text') {
                        setSettings({ ...settings, fontSize: value });
                      } else {
                        setSettings({ ...settings, strokeWidth: value });
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Annotations List */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Annotations ({annotations.length})</h3>
                {annotations.length > 0 && (
                  <button
                    onClick={() => setAnnotations([])}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {annotations.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No annotations yet. Click on the PDF to add some!</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {annotations.map((annotation) => (
                    <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {annotation.type === 'highlight' && <Highlighter className="w-4 h-4 text-yellow-600" />}
                        {annotation.type === 'text' && <Type className="w-4 h-4 text-blue-600" />}
                        {annotation.type === 'draw' && <Pen className="w-4 h-4 text-green-600" />}
                        <span className="text-sm text-gray-700">
                          {annotation.type === 'text' ? annotation.text?.substring(0, 20) + '...' : `${annotation.type} annotation`}
                        </span>
                        <span className="text-xs text-gray-500">Page {annotation.page}</span>
                      </div>
                      <button
                        onClick={() => removeAnnotation(annotation.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save and Download */}
            <motion.button
              onClick={handleSaveAndDownload}
              disabled={!canSaveAndDownload || isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                canSaveAndDownload && !isProcessing
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={canSaveAndDownload && !isProcessing ? { scale: 1.02 } : {}}
              whileTap={canSaveAndDownload && !isProcessing ? { scale: 0.98 } : {}}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>{annotations.length > 0 ? `Save ${annotations.length} Annotations & Download` : 'Download PDF'}</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Text Input Modal */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Text Annotation</h3>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your annotation text..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowTextInput(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTextSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Annotation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress
          progress={75}
          currentFile={pdfFile.name}
          message="Processing annotations..."
        />
      )}
    </div>
  );
}