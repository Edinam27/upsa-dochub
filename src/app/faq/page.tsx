'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What file formats does UPSA DocHub support?',
    answer: 'UPSA DocHub primarily supports PDF files for processing. You can upload PDF files up to 10MB in size. We support both regular PDFs and password-protected PDFs. The output formats vary by tool: Word documents (.docx), images (PNG, JPEG, WEBP), and plain text files.',
    category: 'General',
    tags: ['formats', 'pdf', 'upload', 'file types']
  },
  {
    id: '2',
    question: 'Is there a file size limit for uploads?',
    answer: 'Yes, the maximum file size for uploads is 10MB per file. This limit ensures optimal processing speed and server performance. If your file is larger, consider compressing it or splitting it into smaller sections.',
    category: 'General',
    tags: ['file size', 'limit', 'upload', '10mb']
  },
  {
    id: '3',
    question: 'How long does PDF processing take?',
    answer: 'Processing time varies depending on the file size, complexity, and the tool being used. Simple conversions typically take 30 seconds to 2 minutes. Complex documents with many images or pages may take up to 5 minutes. You\'ll see a progress indicator during processing.',
    category: 'Processing',
    tags: ['processing time', 'speed', 'duration']
  },
  {
    id: '4',
    question: 'Are my uploaded files secure and private?',
    answer: 'Yes, we take your privacy seriously. All uploaded files are processed securely and automatically deleted from our servers after 24 hours. We use encrypted connections (HTTPS) for all file transfers and do not store or share your documents with third parties.',
    category: 'Security',
    tags: ['security', 'privacy', 'files', 'deletion', 'https']
  },
  {
    id: '5',
    question: 'Can I convert password-protected PDFs?',
    answer: 'Yes, UPSA DocHub can process password-protected PDFs. You\'ll be prompted to enter the password during the upload process. The password is used only for processing and is not stored on our servers.',
    category: 'PDF Conversion',
    tags: ['password', 'protected pdf', 'security']
  },
  {
    id: '6',
    question: 'Why is my PDF to Word conversion not preserving formatting?',
    answer: 'Formatting preservation depends on the original PDF structure. PDFs created from text documents usually convert better than scanned PDFs. For best results, ensure your PDF has selectable text and was created digitally rather than scanned. Complex layouts with multiple columns or unusual fonts may require manual adjustment.',
    category: 'PDF Conversion',
    tags: ['formatting', 'pdf to word', 'conversion quality']
  },
  {
    id: '7',
    question: 'What image quality options are available for PDF to image conversion?',
    answer: 'You can choose from multiple output formats (PNG, JPEG, WEBP) and adjust the DPI (dots per inch) setting. Higher DPI produces better quality but larger file sizes. We recommend 150 DPI for general use, 300 DPI for high-quality prints, and 72 DPI for web use.',
    category: 'Image Conversion',
    tags: ['image quality', 'dpi', 'png', 'jpeg', 'webp']
  },
  {
    id: '8',
    question: 'How accurate is the OCR text extraction?',
    answer: 'OCR accuracy depends on the quality of the source document. Clear, high-resolution scanned documents typically achieve 95%+ accuracy. Handwritten text, poor image quality, or unusual fonts may reduce accuracy. For best results, use clean, well-lit scans with standard fonts.',
    category: 'OCR',
    tags: ['ocr', 'accuracy', 'text extraction', 'scanning']
  },
  {
    id: '9',
    question: 'Can I process multiple files at once?',
    answer: 'Currently, you can upload and process one file at a time per tool. However, you can use multiple browser tabs to process different files simultaneously. We\'re working on batch processing features for future updates.',
    category: 'Processing',
    tags: ['batch processing', 'multiple files', 'simultaneous']
  },
  {
    id: '10',
    question: 'What should I do if processing fails or gets stuck?',
    answer: 'If processing fails, try refreshing the page and uploading the file again. Check that your file meets our requirements (PDF format, under 10MB, not corrupted). If the problem persists, try using a different browser or contact our support team.',
    category: 'Troubleshooting',
    tags: ['processing failed', 'stuck', 'error', 'troubleshooting']
  },
  {
    id: '11',
    question: 'Is UPSA DocHub free to use?',
    answer: 'Yes, UPSA DocHub is currently free to use for all basic PDF processing features. We may introduce premium features in the future, but core functionality will remain free for educational and personal use.',
    category: 'General',
    tags: ['free', 'pricing', 'cost']
  },
  {
    id: '12',
    question: 'Can I use UPSA DocHub on mobile devices?',
    answer: 'Yes, UPSA DocHub is designed to work on mobile devices and tablets. The interface is responsive and touch-friendly. However, for the best experience with large files or complex editing, we recommend using a desktop or laptop computer.',
    category: 'General',
    tags: ['mobile', 'responsive', 'tablet', 'desktop']
  },
  {
    id: '13',
    question: 'What browsers are supported?',
    answer: 'UPSA DocHub works best with modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for optimal performance and security.',
    category: 'Technical',
    tags: ['browsers', 'chrome', 'firefox', 'safari', 'edge']
  },
  {
    id: '14',
    question: 'How do I download my processed files?',
    answer: 'After processing is complete, a download button will appear. Click it to download your converted file. The download will start automatically in most browsers. Check your browser\'s download folder if you can\'t find the file.',
    category: 'General',
    tags: ['download', 'processed files', 'save']
  },
  {
    id: '15',
    question: 'Can I edit PDFs directly in UPSA DocHub?',
    answer: 'Yes, our PDF Editor tool allows you to make basic edits including adding text, images, and signatures. For more advanced editing features, you might need specialized PDF editing software.',
    category: 'PDF Editing',
    tags: ['pdf editing', 'text editing', 'signatures']
  }
];

const categories = ['All', 'General', 'PDF Conversion', 'Image Conversion', 'OCR', 'Processing', 'Security', 'Troubleshooting', 'Technical', 'PDF Editing'];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-lg text-gray-600">
          Find answers to common questions about UPSA DocHub
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
               selectedCategory === 'all' 
                 ? 'bg-blue-600 text-white' 
                 : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
             }`}
             onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </button>
          {categories.slice(1).map((category) => (
            <button 
              key={category}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or selecting a different category.
              </p>
            </div>
          </div>
        ) : (
          filteredFAQs.map(faq => (
            <div key={faq.id} className="bg-white rounded-lg shadow-md">
              <button 
                className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(faq.id)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      {faq.category}
                    </span>
                  </div>
                </div>
                {openItems.includes(faq.id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-4">
                    {faq.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex gap-4">
          <a href="/contact-support" className="text-blue-600 hover:underline font-medium">
            Contact Support
          </a>
          <a href="/how-to-use" className="text-blue-600 hover:underline font-medium">
            How to Use Guide
          </a>
        </div>
      </div>
    </div>
  );
}