'use client';

import { useState } from 'react';
import { 
  FileText, 
  Image, 
  Type, 
  Edit, 
  Upload, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Zap,
  Shield,
  Clock,
  Droplets,
  Unlock,
  Crop
} from 'lucide-react';

export default function HowToUsePage() {
  const [activeTab, setActiveTab] = useState('pdf-to-word');
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    // Academic Tools
    {
      id: 'pdf-merge',
      title: 'Merge PDFs',
      icon: <FileText className="h-6 w-6" />,
      description: 'Combine multiple PDF files into a single document',
      category: 'Academic Tools',
      steps: [
        {
          title: 'Upload PDF Files',
          description: 'Select multiple PDF files you want to combine',
          details: 'You can upload up to 20 PDF files at once. Each file can be up to 100MB.',
          tips: ['Arrange files in the order you want them merged', 'Check file names to ensure correct sequence']
        },
        {
          title: 'Arrange File Order',
          description: 'Drag and drop files to reorder them as needed',
          details: 'The final merged PDF will follow the order shown in the file list.',
          tips: ['Preview each file to confirm content', 'Use descriptive names for better organization']
        },
        {
          title: 'Start Merging',
          description: 'Click "Merge PDFs" to combine all files',
          details: 'Processing time depends on the number and size of files being merged.',
          tips: ['Keep browser tab open during processing', 'Larger files take more time to merge']
        },
        {
          title: 'Download Merged PDF',
          description: 'Download your combined PDF document',
          details: 'The merged file maintains the original quality and formatting of all source files.',
          tips: ['Verify all pages are included', 'Save with a descriptive filename']
        }
      ]
    },
    {
      id: 'pdf-split',
      title: 'Split PDF',
      icon: <FileText className="h-6 w-6" />,
      description: 'Split a PDF into individual pages or custom ranges',
      category: 'Academic Tools',
      steps: [
        {
          title: 'Upload PDF File',
          description: 'Select the PDF file you want to split',
          details: 'Supports PDF files up to 100MB. The tool will show a preview of all pages.',
          tips: ['Ensure the PDF is not password-protected', 'Check page count before splitting']
        },
        {
          title: 'Choose Split Method',
          description: 'Select how you want to split the PDF',
          details: 'Options include: split into individual pages, extract specific pages, or split by page ranges.',
          tips: ['Individual pages for separate documents', 'Page ranges for chapters or sections']
        },
        {
          title: 'Select Pages/Ranges',
          description: 'Specify which pages or ranges to extract',
          details: 'You can select individual pages (1,3,5) or ranges (1-10, 15-20).',
          tips: ['Preview pages before splitting', 'Use ranges for continuous sections']
        },
        {
          title: 'Download Split Files',
          description: 'Download individual PDF files or a ZIP archive',
          details: 'Multiple files are packaged in a ZIP for easy download and organization.',
          tips: ['Check all extracted files', 'Rename files for better organization']
        }
      ]
    },
    {
      id: 'pdf-extract',
      title: 'Extract Pages',
      icon: <FileText className="h-6 w-6" />,
      description: 'Extract specific pages from PDF documents',
      category: 'Academic Tools',
      steps: [
        {
          title: 'Upload PDF Document',
          description: 'Select the PDF file containing pages to extract',
          details: 'Supports files up to 100MB with preview functionality for page selection.',
          tips: ['Use high-quality PDFs for better results', 'Check page numbering before extraction']
        },
        {
          title: 'Preview and Select Pages',
          description: 'View thumbnails and select specific pages to extract',
          details: 'Click on page thumbnails to select/deselect them for extraction.',
          tips: ['Use Ctrl+click for multiple selections', 'Preview content before selecting']
        },
        {
          title: 'Set Page Ranges',
          description: 'Alternatively, specify page ranges using numbers',
          details: 'Enter ranges like "1-5, 10, 15-20" to extract multiple sections.',
          tips: ['Use commas to separate individual pages', 'Use hyphens for continuous ranges']
        },
        {
          title: 'Extract and Download',
          description: 'Process extraction and download the selected pages',
          details: 'Extracted pages maintain original quality and formatting.',
          tips: ['Verify all selected pages are included', 'Save with descriptive filename']
        }
      ]
    },
    
    // Conversion Tools
    {
      id: 'pdf-to-word',
      title: 'PDF to Word',
      icon: <Type className="h-6 w-6" />,
      description: 'Convert PDF documents to editable Word format',
      category: 'Conversion Tools',
      steps: [
        {
          title: 'Upload Your PDF',
          description: 'Click the upload area or drag and drop your PDF file',
          details: 'Supported formats: .pdf files up to 50MB. Password-protected PDFs are supported.',
          tips: ['Ensure your PDF contains selectable text for best results', 'Scanned PDFs may require OCR processing']
        },
        {
          title: 'Choose Conversion Settings',
          description: 'Select your preferred output format and quality',
          details: 'Options include maintaining original formatting, extracting text only, or preserving layout.',
          tips: ['Use "Preserve Layout" for documents with complex formatting', 'Choose "Text Only" for simple documents']
        },
        {
          title: 'Start Conversion',
          description: 'Click "Convert to Word" to begin processing',
          details: 'Processing time depends on file size and complexity. Most files convert in under 30 seconds.',
          tips: ['Keep the browser tab open during conversion', 'Large files may take longer to process']
        },
        {
          title: 'Download Result',
          description: 'Download your converted Word document',
          details: 'The converted file will be available as a .docx format compatible with Microsoft Word.',
          tips: ['Review the converted document for accuracy', 'Save the file to your preferred location']
        }
      ]
    },
    {
      id: 'pdf-to-images',
      title: 'PDF to Images',
      icon: <Image className="h-6 w-6" />,
      description: 'Extract pages from PDF as high-quality images',
      category: 'Conversion Tools',
      steps: [
        {
          title: 'Upload PDF File',
          description: 'Select the PDF you want to convert to images',
          details: 'Supports multi-page PDFs. Each page will be converted to a separate image.',
          tips: ['Higher resolution PDFs produce better image quality', 'Consider file size when uploading large documents']
        },
        {
          title: 'Select Pages',
          description: 'Choose which pages to convert (all or specific pages)',
          details: 'You can convert all pages or select specific page ranges (e.g., 1-5, 10, 15-20).',
          tips: ['Preview pages before conversion', 'Select only needed pages to save processing time']
        },
        {
          title: 'Choose Image Format',
          description: 'Select output format: PNG, JPEG, or WEBP',
          details: 'PNG offers best quality, JPEG provides smaller file sizes, WEBP balances both.',
          tips: ['Use PNG for text-heavy documents', 'Choose JPEG for image-heavy documents', 'WEBP offers modern compression']
        },
        {
          title: 'Set Quality & Resolution',
          description: 'Adjust image quality and DPI settings',
          details: 'Higher DPI produces larger, clearer images. Quality affects file size and clarity.',
          tips: ['300 DPI is ideal for printing', '150 DPI works well for web use', 'Balance quality with file size needs']
        },
        {
          title: 'Download Images',
          description: 'Get your converted images as individual files or ZIP',
          details: 'Multiple images are automatically packaged in a ZIP file for easy download.',
          tips: ['Check all images before closing the browser', 'Rename files if needed for organization']
        }
      ]
    },
    {
      id: 'images-to-pdf',
      title: 'Images to PDF',
      icon: <Image className="h-6 w-6" />,
      description: 'Convert images to a single PDF document',
      category: 'Conversion Tools',
      steps: [
        {
          title: 'Upload Image Files',
          description: 'Select multiple images you want to convert to PDF',
          details: 'Supports JPG, PNG, GIF, BMP, and WEBP formats. Up to 50 images, 50MB each.',
          tips: ['Arrange images in desired order', 'Use consistent image sizes for better results']
        },
        {
          title: 'Arrange Image Order',
          description: 'Drag and drop to reorder images as needed',
          details: 'The PDF pages will follow the order shown in the image list.',
          tips: ['Preview images before conversion', 'Remove unwanted images from the list']
        },
        {
          title: 'Set Page Settings',
          description: 'Choose page size, orientation, and image fitting options',
          details: 'Options include A4, Letter, custom sizes, and how images fit on pages.',
          tips: ['A4 is standard for documents', 'Choose "Fit to page" for mixed image sizes']
        },
        {
          title: 'Create PDF',
          description: 'Generate and download your PDF document',
          details: 'All images are combined into a single PDF with optimized quality.',
          tips: ['Check page order in the final PDF', 'Save with a descriptive filename']
        }
      ]
    },
    {
      id: 'pdf-ocr',
      title: 'OCR Text Extraction',
      icon: <Type className="h-6 w-6" />,
      description: 'Extract text from scanned PDFs and images',
      category: 'Conversion Tools',
      steps: [
        {
          title: 'Upload Document',
          description: 'Upload your scanned PDF or image file',
          details: 'Supports PDF, PNG, JPEG, and TIFF formats. Works best with clear, high-contrast text.',
          tips: ['Ensure text is clearly visible', 'Avoid skewed or rotated documents', 'Good lighting improves accuracy']
        },
        {
          title: 'Select Language',
          description: 'Choose the primary language of your document',
          details: 'Supports multiple languages including English, Spanish, French, German, and more.',
          tips: ['Select the correct language for better accuracy', 'Mixed-language documents may need manual review']
        },
        {
          title: 'Configure OCR Settings',
          description: 'Adjust recognition settings for optimal results',
          details: 'Options include text detection sensitivity, layout preservation, and output format.',
          tips: ['Use high sensitivity for faded text', 'Enable layout preservation for formatted documents']
        },
        {
          title: 'Process & Review',
          description: 'Start OCR processing and review extracted text',
          details: 'The system will analyze the document and extract all readable text.',
          tips: ['Review extracted text for accuracy', 'Edit any recognition errors before downloading']
        },
        {
          title: 'Export Results',
          description: 'Download as text file, Word document, or copy to clipboard',
          details: 'Multiple export options available to suit your workflow needs.',
          tips: ['Choose the format that works best for your needs', 'Save a backup copy of important extractions']
        }
      ]
    },
    // Study Tools
    {
      id: 'pdf-compress',
      title: 'Compress PDF',
      icon: <Zap className="h-6 w-6" />,
      description: 'Reduce PDF file size while maintaining quality',
      category: 'Study Tools',
      steps: [
        {
          title: 'Upload PDF Files',
          description: 'Select PDF files you want to compress',
          details: 'Supports files up to 200MB. Batch processing available for multiple files.',
          tips: ['Larger files benefit more from compression', 'Check original file size before compressing']
        },
        {
          title: 'Choose Compression Level',
          description: 'Select compression strength: Low, Medium, or High',
          details: 'Higher compression reduces file size more but may affect quality slightly.',
          tips: ['Medium compression balances size and quality', 'High compression for email attachments']
        },
        {
          title: 'Preview Compression',
          description: 'Review estimated file size reduction before processing',
          details: 'Shows original size, compressed size, and percentage reduction.',
          tips: ['Check compression ratio', 'Ensure quality meets your needs']
        },
        {
          title: 'Download Compressed PDF',
          description: 'Get your optimized PDF with reduced file size',
          details: 'Compressed files maintain readability while using less storage space.',
          tips: ['Compare with original for quality', 'Save storage space for large documents']
        }
      ]
    },
    {
      id: 'pdf-watermark',
      title: 'Add Watermark',
      icon: <Droplets className="h-6 w-6" />,
      description: 'Add text or image watermarks to PDF pages',
      category: 'Study Tools',
      steps: [
        {
          title: 'Upload PDF Document',
          description: 'Select the PDF file to add watermarks to',
          details: 'Supports batch processing for multiple files up to 100MB each.',
          tips: ['Ensure PDF is not password-protected', 'Preview document before watermarking']
        },
        {
          title: 'Choose Watermark Type',
          description: 'Select text watermark or upload an image watermark',
          details: 'Text watermarks are customizable. Image watermarks support PNG, JPG formats.',
          tips: ['Text watermarks are more flexible', 'Use transparent PNG images for best results']
        },
        {
          title: 'Configure Watermark Settings',
          description: 'Set position, transparency, size, and rotation',
          details: 'Customize appearance including opacity, color, font, and placement on pages.',
          tips: ['Lower opacity for subtle watermarks', 'Test different positions for best visibility']
        },
        {
          title: 'Apply and Download',
          description: 'Process watermarking and download the result',
          details: 'Watermarks are permanently embedded in the PDF on all specified pages.',
          tips: ['Preview result before finalizing', 'Keep original file as backup']
        }
      ]
    },
    {
      id: 'pdf-protect',
      title: 'Password Protect',
      icon: <Shield className="h-6 w-6" />,
      description: 'Secure PDF files with password protection',
      category: 'Study Tools',
      steps: [
        {
          title: 'Upload PDF Files',
          description: 'Select PDF files you want to password protect',
          details: 'Supports batch processing for multiple files up to 100MB each.',
          tips: ['Ensure files are not already password-protected', 'Organize files before processing']
        },
        {
          title: 'Set Password',
          description: 'Create a strong password for your PDF files',
          details: 'Use a combination of letters, numbers, and symbols for better security.',
          tips: ['Use strong, memorable passwords', 'Avoid common passwords', 'Store password securely']
        },
        {
          title: 'Configure Permissions',
          description: 'Set restrictions for printing, copying, and editing',
          details: 'Control what users can do with the PDF even after entering the password.',
          tips: ['Restrict printing for confidential documents', 'Disable copying for sensitive content']
        },
        {
          title: 'Download Protected PDF',
          description: 'Get your password-protected PDF files',
          details: 'Protected files require the password to open and respect set permissions.',
          tips: ['Test password before sharing', 'Keep unprotected backup if needed']
        }
      ]
    },
    {
      id: 'pdf-unlock',
      title: 'Remove Password',
      icon: <Unlock className="h-6 w-6" />,
      description: 'Remove password protection from PDF files',
      category: 'Study Tools',
      steps: [
        {
          title: 'Upload Protected PDF',
          description: 'Select the password-protected PDF file',
          details: 'Only works with PDFs where you know the password. Supports batch processing.',
          tips: ['Have the correct password ready', 'Ensure you have permission to unlock']
        },
        {
          title: 'Enter Password',
          description: 'Provide the current password for the PDF',
          details: 'Enter the exact password used to protect the PDF file.',
          tips: ['Check for caps lock and special characters', 'Copy-paste if password is complex']
        },
        {
          title: 'Verify Access',
          description: 'System verifies password and prepares for unlocking',
          details: 'The tool checks password validity and analyzes protection settings.',
          tips: ['Wait for verification to complete', 'Ensure password is correct']
        },
        {
          title: 'Download Unlocked PDF',
          description: 'Get your PDF file without password protection',
          details: 'Unlocked file has all restrictions removed and can be freely accessed.',
          tips: ['Secure the unlocked file appropriately', 'Consider if protection is still needed']
        }
      ]
    },
    {
      id: 'watermark-removal',
      title: 'Remove Watermarks',
      icon: <Crop className="h-6 w-6" />,
      description: 'Remove watermarks from PDF documents and images',
      category: 'Study Tools',
      steps: [
        {
          title: 'Upload Files',
          description: 'Select PDF or image files with watermarks to remove',
          details: 'Supports PDF, PNG, JPG formats. Batch processing available for multiple files.',
          tips: ['Works best with standard watermarks', 'Higher quality files give better results']
        },
        {
          title: 'Select Removal Method',
          description: 'Choose automatic detection or manual watermark selection',
          details: 'Automatic mode detects common watermarks. Manual mode lets you specify areas.',
          tips: ['Try automatic first for common watermarks', 'Use manual for custom watermarks']
        },
        {
          title: 'Configure Settings',
          description: 'Adjust sensitivity and processing options',
          details: 'Fine-tune detection sensitivity and quality preservation settings.',
          tips: ['Higher sensitivity for faint watermarks', 'Lower sensitivity to preserve content']
        },
        {
          title: 'Process and Download',
          description: 'Remove watermarks and download clean files',
          details: 'Processing maintains original quality while removing identified watermarks.',
          tips: ['Review results for quality', 'Compare with original to ensure content integrity']
        }
      ]
    },
    {
      id: 'pdf-editor',
      title: 'PDF Editor',
      icon: <Edit className="h-6 w-6" />,
      description: 'Edit and modify PDF documents directly',
      category: 'Study Tools',
      steps: [
        {
          title: 'Open PDF in Editor',
          description: 'Upload and open your PDF in the editing interface',
          details: 'The editor loads your PDF with full editing capabilities and tool palette.',
          tips: ['Wait for complete loading before editing', 'Use zoom controls for precise editing']
        },
        {
          title: 'Select Editing Tool',
          description: 'Choose from text, image, or shape tools',
          details: 'Each tool offers specific editing capabilities for different content types.',
          tips: ['Text tool for adding/editing text', 'Image tool for adding pictures and graphics']
        },
        {
          title: 'Make Your Edits',
          description: 'Add, modify, or delete content as needed',
          details: 'Click and drag to select areas, double-click text to edit, use toolbar for formatting.',
          tips: ['Save frequently while editing', 'Use undo/redo for quick corrections', 'Preview changes before finalizing']
        },
        {
          title: 'Save Changes',
          description: 'Save your edited PDF with all modifications',
          details: 'Changes are saved to a new PDF file, preserving the original document.',
          tips: ['Choose a descriptive filename', 'Keep original file as backup', 'Verify all changes before closing']
        }
      ]
    }
  ];

  const currentFeature = features.find(f => f.id === activeTab);

  const generalTips = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: 'Faster Processing',
      description: 'Use smaller files and simpler layouts for quicker conversion times'
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      title: 'Security',
      description: 'All files are automatically deleted from our servers after 24 hours'
    },
    {
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      title: 'Quality Check',
      description: 'Always review converted files before using them for important tasks'
    },
    {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      title: 'Batch Processing',
      description: 'Process multiple files efficiently by uploading them in sequence'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How to Use UPSA DocHub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Step-by-step guides to help you master all features and get the most out of our PDF tools.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveTab(feature.id);
                    setCurrentStep(0);
                  }}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === feature.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {feature.icon}
                  {feature.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Feature Content */}
        {currentFeature && (
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Steps Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {currentFeature.icon}
                  {currentFeature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{currentFeature.description}</p>
                
                <div className="space-y-3">
                  {currentFeature.steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        currentStep === index
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          currentStep === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`text-sm font-medium ${
                          currentStep === index ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {currentFeature.steps[currentStep].title}
                    </h2>
                    <p className="text-gray-600">
                      {currentFeature.steps[currentStep].description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Details:</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {currentFeature.steps[currentStep].details}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-3">Pro Tips:</h4>
                  <ul className="space-y-2">
                    {currentFeature.steps[currentStep].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Previous Step
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {currentFeature.steps.length}
                  </span>
                  
                  <button
                    onClick={() => setCurrentStep(Math.min(currentFeature.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === currentFeature.steps.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            General Tips for Best Results
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {generalTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {tip.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Now that you know how to use our tools, try them out! Upload your first file and experience the power of UPSA DocHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Start Converting
            </a>
            <a
              href="/support"
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              View Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}