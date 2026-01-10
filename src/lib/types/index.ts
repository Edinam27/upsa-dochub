// Common types used throughout the application

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  features: string[];
}

export interface ProcessingOptions {
  quality?: 'low' | 'medium' | 'high';
  compression?: number;
  password?: string;
  userPassword?: string;
  ownerPassword?: string;
  permissions?: any;
  watermarkText?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  pageRange?: string;
  outputFormat?: 'pdf' | 'docx' | 'txt' | 'jpg' | 'png';
  fileType?: string;
  imageFiles?: Array<{ data: Uint8Array; type: string }>;
  compressionLevel?: 'low' | 'medium' | 'high';
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  startPage?: number;
  endPage?: number;
  additionalFiles?: Uint8Array[];
  signature?: any;
  position?: 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | { x: number; y: number };
  extractMode?: 'ranges' | 'selected' | 'individual';
  pageRanges?: Array<{ start: number; end: number }>;
  selectedPages?: number[];
  splitMode?: 'range' | 'pages' | 'size' | 'every';
  specificPages?: number[];
  everyNPages?: number;
  color?: string;
  method?: string;
  target?: string;
  sensitivity?: string;
  targetSize?: number;
  grayscale?: boolean;
  useRasterization?: boolean;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  preview?: string;
  pages?: number;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  result?: ProcessedFile;
  error?: string;
  uploadedAt?: string;
  path?: string;
  url?: string;
}

export interface ProcessedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  data: number[];
  processedAt: string;
  toolUsed: string;
  blob?: Blob;
  downloadUrl?: string;
  originalSize?: number;
  reductionPercent?: number;
  engineUsed?: string;
}

export interface UploadState {
  files: FileInfo[];
  isUploading: boolean;
  isDragOver: boolean;
  error: string | null;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentFile: string | null;
  error: string | null;
  results: ProcessedFile[];
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  acceptedTypes: string[];
  maxFileSize: number; // in bytes
  maxFiles: number;
  supportsBatch: boolean;
  options: ProcessingOptions;
}

// PDF Processing specific types
export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  thumbnail?: string;
}

export interface PDFDocument {
  id: string;
  name: string;
  pages: PDFPageInfo[];
  totalPages: number;
  file: File;
}

// OCR specific types
export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  lines: OCRLine[];
  paragraphs: OCRParagraph[];
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OCRLine {
  text: string;
  confidence: number;
  words: OCRWord[];
  bbox: BoundingBox;
}

export interface OCRParagraph {
  text: string;
  confidence: number;
  lines: OCRLine[];
  bbox: BoundingBox;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}



// Watermark types
export interface WatermarkConfig {
  type: 'text' | 'image';
  content: string; // text content or image URL
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
}

// Statistics types
export interface UsageStats {
  totalProcessed: number;
  toolUsage: Record<string, number>;
  averageProcessingTime: number;
  popularTools: string[];
  userSatisfaction: number;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
}

// User preferences (for future use)
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultQuality: 'low' | 'medium' | 'high';
  autoDownload: boolean;
  showTutorials: boolean;
  language: string;
  favoriteTools: string[];
}