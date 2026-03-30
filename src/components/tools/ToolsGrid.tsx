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
  Edit3,
  QrCode,
  CheckCircle,
  FileSpreadsheet
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
  isLocked?: boolean;
}

const ToolsGrid = () => {
  const tools: Tool[] = [
    // Organize PDFs Category
    {
      id: 'pdf-merge',
      name: 'Merge PDFs',
      description: 'Combine multiple PDF files with drag-and-drop reordering',
      icon: <Merge className="h-6 w-6" />,
      category: 'Organize PDFs',
      color: 'from-primary-600 to-primary-500',
      features: ['Drag & Drop', 'Custom Order', 'Batch Processing']
    },
    {
      id: 'pdf-split',
      name: 'Split PDF',
      description: 'Extract specific pages or split by page ranges',
      icon: <Split className="h-6 w-6" />,
      category: 'Organize PDFs',
      color: 'from-accent-600 to-accent-500',
      features: ['Page Ranges', 'Single Pages', 'Custom Split']
    },
    {
      id: 'pdf-compress',
      name: 'Compress PDF',
      description: 'Reduce file size with quality options',
      icon: <Zap className="h-6 w-6" />,
      category: 'Organize PDFs',
      color: 'from-blue-600 to-blue-500',
      features: ['Quality Control', 'Size Optimization', 'Fast Processing']
    },
    {
      id: 'pdf-watermark',
      name: 'Add Watermark',
      description: 'Text/image watermarks with positioning options',
      icon: <Droplets className="h-6 w-6" />,
      category: 'Organize PDFs',
      color: 'from-cyan-600 to-cyan-500',
      features: ['Text & Image', 'Custom Position', 'Transparency']
    },

    // Conversion Tools Category
    {
      id: 'pdf-to-images',
      name: 'PDF to Images',
      description: 'Convert PDF pages to high-quality images',
      icon: <FileImage className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-primary-600 to-accent-500',
      features: ['Multiple Formats', 'Custom Resolution', 'Quality Control']
    },
    {
      id: 'images-to-pdf',
      name: 'Images to PDF',
      description: 'Convert images to a single PDF document',
      icon: <Image className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-accent-600 to-primary-500',
      features: ['Multiple Formats', 'Layout Options', 'Quality Control']
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      description: 'Convert PDF documents to editable Word DOCX files',
      icon: <FileText className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-blue-600 to-primary-500',
      features: ['Editable Output', 'Text Recognition', 'Format Retention']
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      description: 'Convert PDF tables to editable Excel spreadsheets',
      icon: <FileSpreadsheet className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-green-600 to-accent-500',
      features: ['Extract Tables', 'Maintain Structure', 'Editable Cells']
    },
    {
      id: 'pdf-to-ppt',
      name: 'PDF to PowerPoint',
      description: 'Convert PDF slides to editable PowerPoint presentations',
      icon: <Presentation className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-orange-600 to-primary-500',
      features: ['Convert Slides', 'Editable Text', 'Image Preservation']
    },
    {
      id: 'pdf-ocr',
      name: 'OCR Text Extract',
      description: 'Extract text from scanned PDFs using advanced OCR',
      icon: <ScanLine className="h-6 w-6" />,
      category: 'Conversion Tools',
      color: 'from-accent-600 to-blue-500',
      features: ['Advanced OCR', 'Multiple Languages', 'High Accuracy']
    },

    // Enhancement Tools Category
    {
      id: 'image-compress',
      name: 'Image Compression',
      description: 'Compress images to reduce file size while maintaining quality',
      icon: <Minimize2 className="h-6 w-6" />,
      category: 'Enhancement Tools',
      color: 'from-cyan-600 to-primary-500',
      features: ['Quality Control', 'Batch Processing', 'Multiple Formats']
    },
    {
      id: 'add-signature',
      name: 'Add Signature',
      description: 'Add digital signatures to PDF documents',
      icon: <Edit3 className="h-6 w-6" />,
      category: 'Enhancement Tools',
      color: 'from-blue-600 to-accent-500',
      features: ['Digital Signature', 'Custom Position', 'Secure Signing']
    },
    {
      id: 'pdf-protect',
      name: 'Password Protect',
      description: 'Secure PDF files with password protection',
      icon: <Lock className="h-6 w-6" />,
      category: 'Enhancement Tools',
      color: 'from-primary-600 to-blue-500',
      features: ['Strong Encryption', 'Access Control', 'Security Options']
    },
    {
      id: 'pdf-unlock',
      name: 'Remove Password',
      description: 'Remove password protection from PDF files',
      icon: <Lock className="h-6 w-6" />,
      category: 'Enhancement Tools',
      color: 'from-accent-600 to-cyan-500',
      features: ['Password Removal', 'Unlock Restrictions', 'Restore Access']
    },
    {
      id: 'pdf-extract',
      name: 'Extract Pages',
      description: 'Extract specific pages from PDF documents',
      icon: <RotateCcw className="h-6 w-6" />,
      category: 'Enhancement Tools',
      color: 'from-primary-600 to-accent-500',
      features: ['Select Pages', 'Page Ranges', 'Multiple Selections']
    },
    
    // Verification Tools Category
    {
      id: 'verified-signature',
      name: 'Enhanced Signature Receipt',
      description: 'Add a secure, trackable signature with QR code verification',
      icon: <QrCode className="h-6 w-6" />,
      category: 'Verification Tools',
      color: 'from-accent-600 to-primary-500',
      isLocked: true,
      features: ['QR Verification', 'Blockchain-like', 'Tamper-proof', 'Identity Check']
    },
    {
      id: 'verify-document',
      name: 'Verify Document',
      description: 'Verify the authenticity of a signed document via QR code',
      icon: <CheckCircle className="h-6 w-6" />,
      category: 'Verification Tools',
      color: 'from-green-600 to-accent-500',
      isLocked: true,
      features: ['Instant Scanning', 'Database Check', 'Signer Identity', 'Timestamp']
    }
  ];

  const categories = ['Organize PDFs', 'Conversion Tools', 'Enhancement Tools', 'Verification Tools'];

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Organize PDFs':
        return 'Essential tools to merge, split, and manage your PDF documents';
      case 'Conversion Tools':
        return 'Easily convert PDFs to Word, Excel, Images, and more';
      case 'Enhancement Tools':
        return 'Compress, secure, and edit your files for better workflows';
      case 'Verification Tools':
        return 'Secure document verification and authenticity checking';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Organize PDFs':
        return '📚';
      case 'Conversion Tools':
        return '🔄';
      case 'Enhancement Tools':
        return '🎯';
      case 'Verification Tools':
        return '🛡️';
      default:
        return '📄';
    }
  };

  return (
    <section id="tools" className="py-20 relative bg-gradient-to-b from-neutral-50 to-white">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Complete PDF Toolkit</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Everything you need to manage your documents. From basic operations to advanced processing, all tools are designed for you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['✨ No Registration', '🔒 100% Secure', '⚡ Lightning Fast'].map((badge, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="badge badge-primary"
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">{getCategoryIcon(category)}</span>
                <h3 className="text-3xl font-bold text-neutral-900">{category}</h3>
              </div>
              <p className="text-lg text-neutral-600">{getCategoryDescription(category)}</p>
            </div>

            <div className="grid-auto-4">
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
          className="mt-20"
        >
          <div className="card p-8 md:p-12 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold text-neutral-900">
                Ready to streamline your workflow?
              </h3>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Choose any tool above to get started. No downloads, no registration - just instant PDF processing.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg"
              >
                Start Processing Documents
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ToolsGrid;
