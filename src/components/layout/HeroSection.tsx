'use client';

import { motion } from 'framer-motion';
import { GraduationCap, FileText, Zap, Shield, ArrowRight, Sparkles, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.1),transparent_50%)]" />
      </div>
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/5 rounded-full" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-500/5 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo and Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <GraduationCap className="h-12 w-12 text-blue-600 mr-3" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                UPSA <span className="text-blue-600">DocHub</span>
              </h1>
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Professional PDF tools for students and academics
          </p>
          <p className="text-gray-500 max-w-xl mx-auto">
            Convert, merge, split, and manage your documents with ease
          </p>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">12+ PDF Tools</h3>
            <p className="text-gray-600 text-sm">Convert, merge, split, compress and more</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Processing</h3>
            <p className="text-gray-600 text-sm">Quick and efficient document handling</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">All processing happens locally in your browser</p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={scrollToTools}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Explore Tools</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <Link
            href="https://upsasip.com/student-portal"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <BookOpen className="h-5 w-5" />
            <span>Student Portal</span>
          </Link>
        </motion.div>
        
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center"
        >
          <div>
            <div className="text-2xl font-bold text-blue-600">12+</div>
            <div className="text-sm text-gray-600">Tools</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">Free</div>
            <div className="text-sm text-gray-600">Always</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">Secure</div>
            <div className="text-sm text-gray-600">Local</div>
          </div>
        </motion.div>

        {/* Simple Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="cursor-pointer"
            onClick={scrollToTools}
          >
            <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;