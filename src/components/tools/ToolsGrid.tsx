'use client';

import { motion } from 'framer-motion';
import { 
  Merge, 
  Split, 
  Archive, 
  Droplets,
  FileText,
  Presentation,
  FileImage,
  ScanLine,
  RotateCcw,
  Lock,
  Image,
  Zap,
  Minimize2,
  Edit3
} from 'lucide-react';
import ToolCard from './ToolCard';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  features: string[];
}

const ToolsGrid = () => {
  const tools: Tool[] = [
    // Academic Tools Category
    {
      id: 'pdf-merge',
      name: 'Merge PDFs',
      description: 'Combine multiple PDF files with drag-and-drop reordering',
      icon: <Merge className="h-6 w-6" />,
      category: 'Academic Tools',
      color: 'from-blue-500 to-blue-600',
      features: ['Drag & Drop', 'Custom Order', 'Batch Processing']
    },
    {
      id: 'pdf-split',
      name: 'Split PDF',
      description: 'Extract specific pages or split by page ranges',
      icon: <Split className="h-6 w-6" />,
      category: 'Academic Tools',
      color: 'from-green-500 to-green-600',
      features: ['Page Ranges', 'Single Pages', 'Custom Split']
    },
    {
      id: 'pdf-compress',
      name: 'Compress PDF',
      description: 'Reduce file size with quality options',
      icon: <Zap className="h-6 w-6" />,
      category: 'Academic Tools',
      color: 'from-orange-500 to-orange-600',
      features: ['Quality Control', 'Size Optimization', 'Fast Processing']
    },
    {
      id: 'pdf-watermark',
      name: 'Add Watermark',
      description: 'Text/image watermarks with positioning options',
      icon: <Droplets className="h-6 w-6" />,
      category: 'Academic Tools',
      color: 'from-purple-500 to-purple-600',
      features: ['Text & Image', 'Custom Position', 'Transparency']
    },

    // Conversion Tools Category
    {
      id: 'pdf-to-images',
      name: 'PDF to Images',
      description: 'Convert PDF pages to high-quality images',
      icon: <FileImage className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Multiple Formats', 'Custom Resolution', 'Quality Control']
    },
    {
      id: 'images-to-pdf',
      name: 'Images to PDF',
      description: 'Convert images to a single PDF document',
      icon: <Image className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-pink-500 to-pink-600',
      features: ['Multiple Formats', 'Layout Options', 'Quality Control']
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      description: 'Convert PDF documents to editable Word files',
      icon: <FileText className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-blue-600 to-blue-700',
      features: ['Editable Output', 'Text Recognition', 'Format Retention']
    },
    {
      id: 'pdf-ocr',
      name: 'OCR Text Extract',
      description: 'Extract text from scanned PDFs using OCR',
      icon: <ScanLine className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-teal-500 to-teal-600',
      features: ['Advanced OCR', 'Multiple Languages', 'High Accuracy']
    },

    // Study Tools Category
    {
      id: 'image-compress',
      name: 'Image Compression',
      description: 'Compress images to reduce file size while maintaining quality',
      icon: <Minimize2 className="h-6 w-6" />,
      category: 'Study Tools',
      color: 'from-yellow-500 to-orange-500',
      features: ['Quality Control', 'Batch Processing', 'Multiple Formats']
    },
    {
      id: 'add-signature',
      name: 'Add Signature',
      description: 'Add digital signatures to PDF documents',
      icon: <Edit3 className="h-6 w-6" />,
      category: 'Study Tools',
      color: 'from-indigo-500 to-purple-500',
      features: ['Digital Signature', 'Custom Position', 'Secure Signing']
    },
    {
      id: 'pdf-protect',
      name: 'Password Protect',
      description: 'Secure PDF files with password protection',
      icon: <Lock className="h-6 w-6" />,
      category: 'Study Tools',
      color: 'from-gray-600 to-gray-700',
      features: ['Strong Encryption', 'Access Control', 'Security Options']
    },
    {
      id: 'pdf-unlock',
      name: 'Remove Password',
      description: 'Remove password protection from PDF files',
      icon: <Lock className="h-6 w-6" />,
      category: 'Study Tools',
      color: 'from-emerald-500 to-emerald-600',
      features: ['Password Removal', 'Unlock Restrictions', 'Restore Access']
    },
    {
      id: 'pdf-extract',
      name: 'Extract Pages',
      description: 'Extract specific pages from PDF documents',
      icon: <RotateCcw className="h-6 w-6" />,
      category: 'Study Tools',
      color: 'from-purple-500 to-purple-600',
      features: ['Select Pages', 'Page Ranges', 'Multiple Selections']
    },
  ];

  const categories = ['Academic Tools', 'Conversion Tools', 'Study Tools'];

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Academic Tools':
        return 'Essential tools for academic document management and processing';
      case 'Conversion Tools':
        return 'Convert between different file formats with ease';
      case 'Study Tools':
        return 'Advanced tools to enhance your study and research workflow';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic Tools':
        return '📚';
      case 'Conversion Tools':
        return '🔄';
      case 'Study Tools':
        return '🎯';
      default:
        return '📄';
    }
  };

  return (
    <section id="tools" className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Complete <span className="gradient-text">PDF Toolkit</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to manage your academic documents. 
            From basic operations to advanced processing, all tools are designed with UPSA students in mind.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-white font-medium">✨ No Registration Required</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-white font-medium">🔒 100% Secure & Private</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-white font-medium">⚡ Lightning Fast</span>
            </div>
          </div>
        </motion.div>

        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">{getCategoryIcon(category)}</span>
                <h3 className="text-3xl font-bold text-white">{category}</h3>
              </div>
              <p className="text-gray-300 text-lg">{getCategoryDescription(category)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools
                .filter(tool => tool.category === category)
                .map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))
              }
            </div>
          </motion.div>
        ))}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to streamline your academic workflow?
            </h3>
            <p className="text-gray-300 mb-6">
              Choose any tool above to get started. No downloads, no registration - just instant PDF processing.
            </p>
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105">
              Start Processing Documents
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ToolsGrid;