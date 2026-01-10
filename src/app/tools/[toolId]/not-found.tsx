'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Home,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { TOOLS, getPopularTools } from '@/lib/tools-config';

export default function ToolNotFound() {
  const popularTools = getPopularTools().slice(0, 6);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </motion.div>
          
          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Tool Not Found
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            The PDF tool you're looking for doesn't exist or may have been moved. 
            Let's help you find what you need.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/tools"
              className="inline-flex items-center space-x-2 bg-upsa-blue text-white px-6 py-3 rounded-lg hover:bg-upsa-blue/90 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Browse All Tools</span>
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Popular Tools */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border-t border-gray-200 pt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Popular PDF Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link href={`/tools/${tool.id}`}>
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-upsa-gold group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-upsa-blue transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {tool.category}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {tool.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {tool.features.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{tool.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-8 mt-12 text-center"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Need Help Finding a Tool?
          </h3>
          <p className="text-blue-800 mb-6">
            Can't find the PDF tool you're looking for? We're here to help you process your documents efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search All Tools</span>
            </Link>
            
            <a
              href="mailto:support@upsa.edu.gh"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 border border-blue-300 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>Contact Support</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}