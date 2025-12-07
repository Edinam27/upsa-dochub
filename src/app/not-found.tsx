'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  FileText,
  ArrowRight,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { getPopularTools } from '@/lib/tools-config';

export default function NotFound() {
  const popularTools = getPopularTools().slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative mb-8"
          >
            <div className="text-9xl font-bold text-gray-200 select-none">
              404
            </div>
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-32 h-32 bg-upsa-gold/20 rounded-full flex items-center justify-center">
                <Compass className="w-16 h-16 text-upsa-gold" />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Page Not Found
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back on track with our PDF tools.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-upsa-blue text-white px-8 py-4 rounded-lg hover:bg-upsa-blue/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Go Home</span>
            </Link>
            
            <Link
              href="/tools"
              className="inline-flex items-center space-x-2 bg-upsa-gold text-white px-8 py-4 rounded-lg hover:bg-upsa-gold/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Browse Tools</span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {/* Popular Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Popular Tools
              </h3>
            </div>
            
            <div className="space-y-3">
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color} text-white`}>
                    {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-4 h-4' })}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                      {tool.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tool.category}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
                </Link>
              ))}
            </div>
            
            <Link
              href="/tools"
              className="block text-center text-upsa-blue hover:text-upsa-blue/80 font-medium mt-4 transition-colors"
            >
              View All Tools →
            </Link>
          </div>
          
          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Links
              </h3>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  Homepage
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </Link>
              
              <Link
                href="/tools"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  All PDF Tools
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </Link>
              
              <a
                href="https://upsa.edu.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  UPSA Website
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </a>
              
              <a
                href="https://upsasip.com/student-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  Student Portal
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Help & Support */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Need Help?
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              If you're lost or need assistance with our PDF tools, we're here to help.
            </p>
            
            <div className="space-y-3">
              <a
                href="mailto:support@upsa.edu.gh"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  Contact Support
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </a>
              
              <Link
                href="/tools"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="font-medium text-gray-900 group-hover:text-upsa-blue transition-colors">
                  Browse All Tools
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-upsa-blue transition-colors" />
              </Link>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-upsa-blue to-upsa-gold rounded-xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Ready to Process Your PDFs?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get back to what matters most - your studies. Our PDF tools are designed 
            specifically for UPSA students to make document processing quick and easy.
          </p>
          
          <Link
            href="/tools"
            className="inline-flex items-center space-x-2 bg-white text-upsa-blue px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
          >
            <FileText className="w-5 h-5" />
            <span>Explore PDF Tools</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
