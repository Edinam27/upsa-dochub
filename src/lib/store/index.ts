import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FileInfo, ProcessingState, UserPreferences, UsageStats } from '../types';
import { fileUtils, errorUtils } from '../utils';

// File Upload Store
interface FileUploadState {
  files: FileInfo[];
  isUploading: boolean;
  isDragOver: boolean;
  error: string | null;
  maxFiles: number;
  maxFileSize: number;
  acceptedTypes: string[];
  
  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  setDragOver: (isDragOver: boolean) => void;
  setError: (error: string | null) => void;
  updateFileStatus: (fileId: string, status: FileInfo['status'], progress?: number) => void;
  updateFileResult: (fileId: string, result: any) => void;
  setUploadConfig: (config: { maxFiles?: number; maxFileSize?: number; acceptedTypes?: string[] }) => void;
}

export const useFileUploadStore = create<FileUploadState>(
  devtools(
    (set, get) => ({
      files: [],
      isUploading: false,
      isDragOver: false,
      error: null,
      maxFiles: 10,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      acceptedTypes: ['.pdf', 'application/pdf'],

      addFiles: (newFiles: File[]) => {
        const { files, maxFiles, maxFileSize, acceptedTypes } = get();
        
        // Validate file count
        if (files.length + newFiles.length > maxFiles) {
          set({ error: `Maximum ${maxFiles} files allowed` });
          return;
        }

        const validFiles: FileInfo[] = [];
        const errors: string[] = [];

        newFiles.forEach(file => {
          // Validate file size
          if (!fileUtils.validateFileSize(file, maxFileSize)) {
            errors.push(`${file.name}: File too large (max ${fileUtils.formatFileSize(maxFileSize)})`);
            return;
          }

          // Validate file type
          if (!fileUtils.validateFileType(file, acceptedTypes)) {
            errors.push(`${file.name}: Invalid file type`);
            return;
          }

          // Check for duplicates
          const isDuplicate = files.some(existingFile => 
            existingFile.name === file.name && existingFile.size === file.size
          );
          
          if (isDuplicate) {
            errors.push(`${file.name}: File already added`);
            return;
          }

          const fileInfo: FileInfo = {
            id: fileUtils.generateFileId(),
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            status: 'pending',
            progress: 0
          };

          // Create preview for images
          if (fileUtils.isImage(file)) {
            fileInfo.preview = fileUtils.createPreviewUrl(file);
          }

          validFiles.push(fileInfo);
        });

        if (errors.length > 0) {
          set({ error: errors.join('; ') });
        } else {
          set({ error: null });
        }

        if (validFiles.length > 0) {
          set({ files: [...files, ...validFiles] });
        }
      },

      removeFile: (fileId: string) => {
        const { files } = get();
        const fileToRemove = files.find(f => f.id === fileId);
        
        // Clean up preview URL
        if (fileToRemove?.preview) {
          fileUtils.revokePreviewUrl(fileToRemove.preview);
        }
        
        set({ files: files.filter(f => f.id !== fileId) });
      },

      clearFiles: () => {
        const { files } = get();
        
        // Clean up all preview URLs
        files.forEach(file => {
          if (file.preview) {
            fileUtils.revokePreviewUrl(file.preview);
          }
        });
        
        set({ files: [], error: null });
      },

      setDragOver: (isDragOver: boolean) => {
        set({ isDragOver });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      updateFileStatus: (fileId: string, status: FileInfo['status'], progress?: number) => {
        set(state => ({
          files: state.files.map(file => 
            file.id === fileId 
              ? { ...file, status, progress: progress ?? file.progress }
              : file
          )
        }));
      },

      updateFileResult: (fileId: string, result: any) => {
        set(state => ({
          files: state.files.map(file => 
            file.id === fileId 
              ? { ...file, result, status: 'completed' }
              : file
          )
        }));
      },

      setUploadConfig: (config) => {
        set(state => ({ ...state, ...config }));
      }
    }),
    { name: 'file-upload-store' }
  )
);

// Processing Store
interface ProcessingStore extends ProcessingState {
  // Actions
  startProcessing: (toolId: string, files: FileInfo[], options?: any) => void;
  updateProgress: (progress: number, currentFile?: string) => void;
  completeProcessing: (results: any[]) => void;
  failProcessing: (error: string) => void;
  resetProcessing: () => void;
}

export const useProcessingStore = create<ProcessingStore>(
  devtools(
    (set) => ({
      isProcessing: false,
      progress: 0,
      currentFile: null,
      error: null,
      results: [],

      startProcessing: (toolId: string, files: FileInfo[], options?: any) => {
        set({
          isProcessing: true,
          progress: 0,
          currentFile: files[0]?.name || null,
          error: null,
          results: []
        });
      },

      updateProgress: (progress: number, currentFile?: string) => {
        set(state => ({
          progress,
          currentFile: currentFile || state.currentFile
        }));
      },

      completeProcessing: (results: any[]) => {
        set({
          isProcessing: false,
          progress: 100,
          currentFile: null,
          error: null,
          results
        });
      },

      failProcessing: (error: string) => {
        set({
          isProcessing: false,
          progress: 0,
          currentFile: null,
          error,
          results: []
        });
      },

      resetProcessing: () => {
        set({
          isProcessing: false,
          progress: 0,
          currentFile: null,
          error: null,
          results: []
        });
      }
    }),
    { name: 'processing-store' }
  )
);

// User Preferences Store
interface UserPreferencesStore {
  preferences: UserPreferences;
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  addFavoriteTool: (toolId: string) => void;
  removeFavoriteTool: (toolId: string) => void;
  toggleFavoriteTool: (toolId: string) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  defaultQuality: 'medium',
  autoDownload: false,
  showTutorials: true,
  language: 'en',
  favoriteTools: []
};

export const useUserPreferencesStore = create<UserPreferencesStore>(
  devtools(
    persist(
      (set, get) => ({
        preferences: defaultPreferences,

        updatePreferences: (newPreferences: Partial<UserPreferences>) => {
          set(state => ({
            preferences: { ...state.preferences, ...newPreferences }
          }));
        },

        resetPreferences: () => {
          set({ preferences: defaultPreferences });
        },

        addFavoriteTool: (toolId: string) => {
          const { preferences } = get();
          if (!preferences.favoriteTools.includes(toolId)) {
            set(state => ({
              preferences: {
                ...state.preferences,
                favoriteTools: [...state.preferences.favoriteTools, toolId]
              }
            }));
          }
        },

        removeFavoriteTool: (toolId: string) => {
          set(state => ({
            preferences: {
              ...state.preferences,
              favoriteTools: state.preferences.favoriteTools.filter(id => id !== toolId)
            }
          }));
        },

        toggleFavoriteTool: (toolId: string) => {
          const { preferences } = get();
          if (preferences.favoriteTools.includes(toolId)) {
            set(state => ({
              preferences: {
                ...state.preferences,
                favoriteTools: state.preferences.favoriteTools.filter(id => id !== toolId)
              }
            }));
          } else {
            set(state => ({
              preferences: {
                ...state.preferences,
                favoriteTools: [...state.preferences.favoriteTools, toolId]
              }
            }));
          }
        }
      }),
      {
        name: 'user-preferences',
        partialize: (state) => ({ preferences: state.preferences })
      }
    ),
    { name: 'user-preferences-store' }
  )
);

// Usage Statistics Store
interface UsageStatsStore {
  stats: UsageStats;
  
  // Actions
  incrementToolUsage: (toolId: string) => void;
  updateProcessingTime: (time: number) => void;
  updateSatisfaction: (rating: number) => void;
  resetStats: () => void;
}

const defaultStats: UsageStats = {
  totalProcessed: 0,
  toolUsage: {},
  averageProcessingTime: 0,
  popularTools: [],
  userSatisfaction: 0
};

export const useUsageStatsStore = create<UsageStatsStore>(
  devtools(
    persist(
      (set, get) => ({
        stats: defaultStats,

        incrementToolUsage: (toolId: string) => {
          set(state => {
            const newToolUsage = {
              ...state.stats.toolUsage,
              [toolId]: (state.stats.toolUsage[toolId] || 0) + 1
            };
            
            const popularTools = Object.entries(newToolUsage)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([tool]) => tool);

            return {
              stats: {
                ...state.stats,
                totalProcessed: state.stats.totalProcessed + 1,
                toolUsage: newToolUsage,
                popularTools
              }
            };
          });
        },

        updateProcessingTime: (time: number) => {
          set(state => {
            const { totalProcessed, averageProcessingTime } = state.stats;
            const newAverage = totalProcessed > 0 
              ? (averageProcessingTime * (totalProcessed - 1) + time) / totalProcessed
              : time;
            
            return {
              stats: {
                ...state.stats,
                averageProcessingTime: newAverage
              }
            };
          });
        },

        updateSatisfaction: (rating: number) => {
          set(state => ({
            stats: {
              ...state.stats,
              userSatisfaction: rating
            }
          }));
        },

        resetStats: () => {
          set({ stats: defaultStats });
        }
      }),
      {
        name: 'usage-stats',
        partialize: (state) => ({ stats: state.stats })
      }
    ),
    { name: 'usage-stats-store' }
  )
);

// App State Store (for global app state)
interface AppState {
  isLoading: boolean;
  currentTool: string | null;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  
  // Actions
  setLoading: (isLoading: boolean) => void;
  setCurrentTool: (toolId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>(
  devtools(
    (set, get) => ({
      isLoading: false,
      currentTool: null,
      sidebarOpen: false,
      mobileMenuOpen: false,
      notifications: [],

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setCurrentTool: (toolId: string | null) => {
        set({ currentTool: toolId });
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open });
      },

      addNotification: (notification) => {
        const id = fileUtils.generateFileId();
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date()
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      }
    }),
    { name: 'app-store' }
  )
);

// Export all stores
// Note: Stores are already exported as const declarations above

// Export store types
export type {
  FileUploadState,
  ProcessingStore,
  UserPreferencesStore,
  UsageStatsStore,
  AppState
};