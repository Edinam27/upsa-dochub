'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { useProcessingStore } from '@/lib/store';
import { fileUtils, dateUtils } from '@/lib/utils';

interface ProcessingProgressProps {
  className?: string;
  onDownloadAll?: () => void;
  onReset?: () => void;
}

export default function ProcessingProgress({
  className,
  onDownloadAll,
  onReset
}: ProcessingProgressProps) {
  const {
    isProcessing,
    progress,
    currentFile,
    error,
    results,
    resetProcessing
  } = useProcessingStore();

  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState(0);

  // Track processing start time
  React.useEffect(() => {
    if (isProcessing && !startTime) {
      setStartTime(new Date());
    } else if (!isProcessing) {
      setStartTime(null);
    }
  }, [isProcessing, startTime]);

  // Update elapsed time
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 100);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, startTime]);

  const formatElapsedTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const estimatedTimeRemaining = React.useMemo(() => {
    if (!isProcessing || progress === 0 || !startTime) return null;
    
    const elapsed = elapsedTime;
    const estimated = (elapsed / progress) * (100 - progress);
    
    return formatElapsedTime(estimated);
  }, [isProcessing, progress, elapsedTime, startTime]);

  const handleDownloadAll = () => {
    if (results.length > 0) {
      onDownloadAll?.();
    }
  };

  const handleReset = () => {
    resetProcessing();
    onReset?.();
  };

  if (!isProcessing && !error && results.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-upsa-blue to-upsa-gold p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            
            <div>
              <h3 className="font-semibold text-lg">
                {isProcessing ? 'Processing Files' : error ? 'Processing Failed' : 'Processing Complete'}
              </h3>
              {currentFile && (
                <p className="text-white/80 text-sm">
                  Current: {currentFile}
                </p>
              )}
            </div>
          </div>
          
          {!isProcessing && (
            <button
              onClick={handleReset}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-upsa-blue to-upsa-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            
            {/* Time Information */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Elapsed: {formatElapsedTime(elapsedTime)}</span>
              </div>
              
              {estimatedTimeRemaining && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Est. remaining: {estimatedTimeRemaining}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-800 font-medium mb-1">Processing Failed</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Processed Files ({results.length})
                </h4>
                
                {results.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    className="flex items-center space-x-2 bg-upsa-gold text-white px-4 py-2 rounded-lg hover:bg-upsa-gold/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                )}
              </div>
              
              <div className="grid gap-3">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {result.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {fileUtils.formatFileSize(result.size)} • {result.type}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => result.blob && fileUtils.downloadFile(result.blob, result.name)}
                        className="flex items-center space-x-2 text-upsa-blue hover:text-upsa-blue/80 font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {!isProcessing && !error && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="text-green-800 font-medium">Processing Complete!</h4>
                  <p className="text-green-700 text-sm mt-1">
                    Successfully processed {results.length} file{results.length > 1 ? 's' : ''}.
                    All files are ready for download.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Tips */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-blue-800 font-medium text-sm">Processing Tips</h4>
                <ul className="text-blue-700 text-xs mt-1 space-y-1">
                  <li>• Keep this tab open while processing</li>
                  <li>• Larger files may take longer to process</li>
                  <li>• Your files are processed locally for privacy</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}