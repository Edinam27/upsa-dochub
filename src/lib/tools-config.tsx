import React from 'react';
import {
  FileText,
  Scissors,
  Merge,
  Download,
  Shield,
  Droplets,
  Image,
  FileImage,
  Type,
  Search,
  Highlighter,
  RotateCcw,
  Crop,
  Zap,
  FileCheck,
  Lock,
  Unlock,
  Layers,
  ScanLine,
  Minimize2,
  Edit3,
  QrCode,
  CheckCircle
} from 'lucide-react';
import { Tool, ToolConfig } from './types';

// Tool definitions with their configurations
export const TOOLS: Record<string, Tool & ToolConfig> = {
  // Academic Tools
  'pdf-merge': {
    id: 'pdf-merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into a single document',
    icon: <Merge className="w-6 h-6" />,
    category: 'Academic Tools',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Combine unlimited PDFs',
      'Maintain original quality',
      'Custom page order',
      'Batch processing'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 20,
    supportsBatch: true,
    options: {
      quality: 'high'
    }
  },
  
  'pdf-split': {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Split a PDF into individual pages or custom ranges',
    icon: <Scissors className="w-6 h-6" />,
    category: 'Academic Tools',
    color: 'from-green-500 to-green-600',
    features: [
      'Split by pages',
      'Custom page ranges',
      'Extract specific pages',
      'Bulk download'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 1,
    supportsBatch: false,
    options: {
      quality: 'high'
    }
  },
  
  'pdf-extract': {
    id: 'pdf-extract',
    name: 'Extract Pages',
    description: 'Extract specific pages from PDF documents',
    icon: <FileCheck className="w-6 h-6" />,
    category: 'Academic Tools',
    color: 'from-purple-500 to-purple-600',
    features: [
      'Select specific pages',
      'Page range support',
      'Preview before extract',
      'Multiple selections'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 1,
    supportsBatch: false,
    options: {
      quality: 'high',
      pageRange: '1-5'
    }
  },
  
  'image-compress': {
    id: 'image-compress',
    name: 'Image Compression',
    description: 'Compress images to reduce file size while maintaining quality',
    icon: <Minimize2 className="w-6 h-6" />,
    category: 'Conversion Tools',
    color: 'from-green-500 to-green-600',
    features: [
      'Smart compression',
      'Quality preservation',
      'Multiple formats',
      'Batch processing'
    ],
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', 'image/*'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'high',
      compression: 0.8
    }
  },

  'add-signature': {
    id: 'add-signature',
    name: 'Add Signature',
    description: 'Add digital signatures to PDF documents',
    icon: <Edit3 className="w-6 h-6" />,
    category: 'Academic Tools',
    color: 'from-blue-500 to-blue-600',
    features: [
      'Digital signatures',
      'Custom signature styles',
      'Multiple positions',
      'Secure signing'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 1,
    supportsBatch: false,
    options: {
      quality: 'high'
    }
  },
  
  // Conversion Tools
  'pdf-to-images': {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Convert PDF pages to high-quality images',
    icon: <FileImage className="w-6 h-6" />,
    category: 'Conversion Tools',
    color: 'from-indigo-500 to-indigo-600',
    features: [
      'Multiple formats (PNG, JPG)',
      'Custom resolution',
      'Batch conversion',
      'Quality control'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 5,
    supportsBatch: true,
    options: {
      quality: 'high',
      outputFormat: 'png'
    }
  },
  
  'images-to-pdf': {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Convert images to a single PDF document',
    icon: <Image className="w-6 h-6" />,
    category: 'Conversion Tools',
    color: 'from-pink-500 to-pink-600',
    features: [
      'Multiple image formats',
      'Custom page size',
      'Image optimization',
      'Page ordering'
    ],
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', 'image/*'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 50,
    supportsBatch: true,
    options: {
      quality: 'high'
    }
  },
  
  'pdf-to-word': {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    icon: <Type className="w-6 h-6" />,
    category: 'Conversion Tools',
    color: 'from-blue-600 to-blue-700',
    features: [
      'Maintain formatting',
      'Editable text',
      'Image preservation',
      'Table support'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 5,
    supportsBatch: true,
    options: {
      quality: 'high',
      outputFormat: 'docx'
    }
  },
  
  'pdf-ocr': {
    id: 'pdf-ocr',
    name: 'OCR Text Extract',
    description: 'Extract text from scanned PDFs using OCR',
    icon: <ScanLine className="w-6 h-6" />,
    category: 'Conversion Tools',
    color: 'from-teal-500 to-teal-600',
    features: [
      'Advanced OCR engine',
      'Multiple languages',
      'Text searchable PDFs',
      'High accuracy'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'high'
    }
  },
  
  // Study Tools
  'pdf-compress': {
    id: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: <Zap className="w-6 h-6" />,
    category: 'Study Tools',
    color: 'from-red-500 to-red-600',
    features: [
      'Smart compression',
      'Quality preservation',
      'Size optimization',
      'Batch processing'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 200 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'medium',
      compression: 0.7
    }
  },
  
  'pdf-watermark': {
    id: 'pdf-watermark',
    name: 'Add Watermark',
    description: 'Add text or image watermarks to PDF pages',
    icon: <Droplets className="w-6 h-6" />,
    category: 'Study Tools',
    color: 'from-cyan-500 to-cyan-600',
    features: [
      'Text watermarks',
      'Image watermarks',
      'Custom positioning',
      'Transparency control'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'high',
      watermarkText: 'UPSA Student',
      watermarkPosition: 'center'
    }
  },
  
  'pdf-protect': {
    id: 'pdf-protect',
    name: 'Password Protect',
    description: 'Secure PDF files with password protection',
    icon: <Lock className="w-6 h-6" />,
    category: 'Study Tools',
    color: 'from-gray-600 to-gray-700',
    features: [
      'Password encryption',
      'Access control',
      'Print restrictions',
      'Copy protection'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'high',
      password: ''
    }
  },

  // Verification Tools
  'verified-signature': {
    id: 'verified-signature',
    name: 'Enhanced Signature Receipt',
    description: 'Add a secure, trackable signature with QR code verification',
    icon: <QrCode className="w-6 h-6" />,
    category: 'Verification Tools',
    color: 'from-violet-500 to-violet-600',
    features: [
      'Unique QR code generation',
      'Blockchain-like verification',
      'Tamper-proof tracking',
      'Identity verification'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 1,
    supportsBatch: false,
    options: {
      quality: 'high'
    }
  },

  'verify-document': {
    id: 'verify-document',
    name: 'Verify Document',
    description: 'Verify the authenticity of a signed document via QR code',
    icon: <CheckCircle className="w-6 h-6" />,
    category: 'Verification Tools',
    color: 'from-emerald-500 to-emerald-600',
    features: [
      'Instant QR scanning',
      'Database verification',
      'Signer identity check',
      'Timestamp validation'
    ],
    acceptedTypes: ['.pdf', 'application/pdf', '.png', '.jpg', '.jpeg'],
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 1,
    supportsBatch: false,
    options: {
      quality: 'high'
    }
  },
  
  'pdf-unlock': {
    id: 'pdf-unlock',
    name: 'Remove Password',
    description: 'Remove password protection from PDF files',
    icon: <Unlock className="w-6 h-6" />,
    category: 'Study Tools',
    color: 'from-emerald-500 to-emerald-600',
    features: [
      'Password removal',
      'Unlock restrictions',
      'Restore access',
      'Batch unlock'
    ],
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 10,
    supportsBatch: true,
    options: {
      quality: 'high',
      password: ''
    }
  }
};

// Tool categories
export const TOOL_CATEGORIES = {
  'Academic Tools': {
    name: 'Academic Tools',
    description: 'Essential tools for academic work and research',
    color: 'from-blue-500 to-purple-600',
    icon: <FileText className="w-6 h-6" />
  },
  'Conversion Tools': {
    name: 'Conversion Tools',
    description: 'Convert between different file formats',
    color: 'from-green-500 to-teal-600',
    icon: <RotateCcw className="w-6 h-6" />
  },
  'Study Tools': {
    name: 'Study Tools',
    description: 'Enhance your study materials and documents',
    color: 'from-orange-500 to-red-600',
    icon: <Layers className="w-6 h-6" />
  },
  'Verification Tools': {
    name: 'Verification Tools',
    description: 'Verify document authenticity and signatures',
    color: 'from-violet-500 to-emerald-600',
    icon: <Shield className="w-6 h-6" />
  }
};

// Get tools by category
export function getToolsByCategory(category: string): (Tool & ToolConfig)[] {
  return Object.values(TOOLS).filter(tool => tool.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
  return Object.keys(TOOL_CATEGORIES);
}

// Get tool by ID
export function getToolById(id: string): (Tool & ToolConfig) | undefined {
  return TOOLS[id];
}

// Get popular tools (based on usage or featured)
export function getPopularTools(): (Tool & ToolConfig)[] {
  const popularIds = ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-to-images', 'pdf-watermark', 'pdf-protect'];
  return popularIds.map(id => TOOLS[id]).filter(Boolean);
}

// Get recently used tools (this would typically come from user preferences)
export function getRecentTools(recentIds: string[] = []): (Tool & ToolConfig)[] {
  return recentIds.map(id => TOOLS[id]).filter(Boolean);
}

// Search tools
export function searchTools(query: string): (Tool & ToolConfig)[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(TOOLS).filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.category.toLowerCase().includes(lowercaseQuery) ||
    tool.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
  );
}

// Get tool recommendations based on file type
export function getRecommendedTools(fileType: string): (Tool & ToolConfig)[] {
  if (fileType === 'application/pdf' || fileType.endsWith('.pdf')) {
    return [
      TOOLS['pdf-split'],
      TOOLS['pdf-merge'],
      TOOLS['pdf-compress'],
      TOOLS['pdf-to-images']
    ].filter(Boolean);
  }
  
  if (fileType.startsWith('image/')) {
    return [
      TOOLS['images-to-pdf'],
      TOOLS['pdf-ocr']
    ].filter(Boolean);
  }
  
  return [];
}

// Validate tool configuration
export function validateToolConfig(toolId: string, files: File[]): {
  isValid: boolean;
  errors: string[];
} {
  const tool = TOOLS[toolId];
  if (!tool) {
    return {
      isValid: false,
      errors: ['Tool not found']
    };
  }
  
  const errors: string[] = [];
  
  // Check file count
  if (files.length > tool.maxFiles) {
    errors.push(`Maximum ${tool.maxFiles} files allowed`);
  }
  
  if (files.length === 0) {
    errors.push('At least one file is required');
  }
  
  // Check file types and sizes
  files.forEach((file, index) => {
    // Check file type
    const isValidType = tool.acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type || file.type.startsWith(type.replace('*', ''));
    });
    
    if (!isValidType) {
      errors.push(`File ${index + 1}: Invalid file type. Accepted: ${tool.acceptedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > tool.maxFileSize) {
      errors.push(`File ${index + 1}: File too large (max ${(tool.maxFileSize / 1024 / 1024).toFixed(0)}MB)`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default tools configuration
export default TOOLS;