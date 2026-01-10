import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileInfo, ProcessingOptions, AppError } from '../types';

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File utilities
export const fileUtils = {
  // Format file size in human readable format
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file extension
  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  },

  // Check if file is PDF
  isPDF: (file: File): boolean => {
    return file.type === 'application/pdf' || fileUtils.getFileExtension(file.name) === 'pdf';
  },

  // Check if file is image
  isImage: (file: File): boolean => {
    return file.type.startsWith('image/');
  },

  // Check if file is document
  isDocument: (file: File): boolean => {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    return docTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },

  // Validate file type
  validateFileType: (file: File, acceptedTypes: string[]): boolean => {
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileUtils.getFileExtension(file.name) === type.slice(1);
      }
      return file.type === type || file.type.startsWith(type.replace('*', ''));
    });
  },

  // Generate unique file ID
  generateFileId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Create file preview URL
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file);
  },

  // Clean up preview URL
  revokePreviewUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  // Download file
  downloadFile: (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// String utilities
export const stringUtils = {
  // Truncate string with ellipsis
  truncate: (str: string, length: number): string => {
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  // Generate slug from string
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Remove special characters
  sanitize: (str: string): string => {
    return str.replace(/[<>"'&]/g, '');
  }
};

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Get relative time
  getRelativeTime: (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
};

// Validation utilities
export const validationUtils = {
  // Validate email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate page range
  validatePageRange: (range: string, totalPages: number): boolean => {
    if (!range.trim()) return false;
    
    const parts = range.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          return false;
        }
      } else {
        const page = parseInt(trimmed);
        if (isNaN(page) || page < 1 || page > totalPages) {
          return false;
        }
      }
    }
    return true;
  }
};

// Error utilities
export const errorUtils = {
  // Create standardized error
  createError: (code: string, message: string, details?: any): AppError => {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    };
  },

  // Get user-friendly error message
  getUserFriendlyMessage: (error: AppError): string => {
    const messages: Record<string, string> = {
      'FILE_TOO_LARGE': 'The file is too large. Please choose a smaller file.',
      'INVALID_FILE_TYPE': 'This file type is not supported. Please choose a PDF file.',
      'PROCESSING_FAILED': 'Failed to process the file. Please try again.',
      'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
      'QUOTA_EXCEEDED': 'You have exceeded the processing limit. Please try again later.',
      'CORRUPTED_FILE': 'The file appears to be corrupted. Please try with a different file.'
    };
    
    return messages[error.code] || error.message || 'An unexpected error occurred.';
  }
};

// Performance utilities
export const performanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Measure execution time
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const time = performance.now() - start;
    return { result, time };
  }
};

// Local storage utilities
export const storageUtils = {
  // Set item in localStorage
  setItem: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  // Get item from localStorage
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  },

  // Remove item from localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  // Clear all items
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// Color utilities
export const colorUtils = {
  // Generate random color
  randomColor: (): string => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Get contrast color (black or white)
  getContrastColor: (hex: string): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
};

// Animation utilities
export const animationUtils = {
  // Easing functions
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Common animation variants for framer-motion
  variants: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    stagger: {
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  }
};

// Export all utilities as default
export default {
  cn,
  fileUtils,
  stringUtils,
  dateUtils,
  validationUtils,
  errorUtils,
  performanceUtils,
  storageUtils,
  colorUtils,
  animationUtils
};