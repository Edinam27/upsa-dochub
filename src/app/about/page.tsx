'use client';

import { 
  FileText, 
  Image, 
  ScanText, 
  Edit, 
  Shield, 
  Zap, 
  Users, 
  Target, 
  Heart,
  Mail,
  Github,
  Globe,
  Award,
  Clock,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About UPSA DocHub
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empowering students, professionals, and businesses with powerful, free PDF processing tools. 
          Transform your documents with ease and confidence.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Award className="h-3 w-3 mr-1" />
            100% Free
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Shield className="h-3 w-3 mr-1" />
            Secure & Private
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Zap className="h-3 w-3 mr-1" />
            Fast Processing
          </span>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            Our Mission
          </h2>
          <p className="text-gray-600">
            To democratize document processing by providing free, accessible, and powerful PDF tools 
            that help students, educators, and professionals work more efficiently. We believe that 
            essential document tools should be available to everyone, regardless of their budget.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            Our Vision
          </h2>
          <p className="text-gray-600">
            To become the go-to platform for document processing in educational and professional 
            environments across Africa and beyond. We envision a world where document barriers 
            don't limit productivity or learning opportunities.
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-2">What We Offer</h2>
        <p className="text-center text-gray-600 mb-6">
          Comprehensive PDF processing tools designed for your needs
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                 <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">PDF to Word</h3>
              <p className="text-sm text-gray-600">
                Convert PDF documents to editable Word files with high accuracy and formatting preservation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Image className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">PDF to Images</h3>
              <p className="text-sm text-gray-600">
                Extract pages as high-quality PNG or JPG images for presentations and sharing.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ScanText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">OCR Processing</h3>
              <p className="text-sm text-gray-600">
                Extract text from scanned documents and images with advanced optical character recognition.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">PDF Editor</h3>
              <p className="text-sm text-gray-600">
                Edit and modify PDF documents directly in your browser.
              </p>
            </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Why Choose UPSA DocHub?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-gray-600">
                Your documents are processed securely and deleted within 24 hours. We never store or share your files.
              </p>
            </div>

            <div className="text-center">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Advanced processing algorithms ensure quick conversions without compromising quality.
              </p>
            </div>

            <div className="text-center">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">User-Friendly</h3>
              <p className="text-sm text-gray-600">
                Intuitive interface designed for users of all technical levels. No registration required.
              </p>
            </div>

            <div className="text-center">
              <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Accessible Anywhere</h3>
              <p className="text-sm text-gray-600">
                Works on any device with a web browser. No software installation needed.
              </p>
            </div>

            <div className="text-center">
              <Award className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-gray-600">
                Professional-grade processing engines deliver accurate and reliable results.
              </p>
            </div>

            <div className="text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">24/7 Available</h3>
              <p className="text-sm text-gray-600">
                Access our tools anytime, anywhere. Perfect for urgent document processing needs.
              </p>
            </div>
        </div>
      </div>

      {/* About UPSA */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6">
          About University of Professional Studies, Accra (UPSA)
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            UPSA DocHub is proudly developed in association with the University of Professional Studies, Accra (UPSA), 
            Ghana's premier institution for professional and business education. UPSA has been at the forefront of 
            innovative education and technology solutions since its establishment.
          </p>
          <p className="text-gray-600">
            This project reflects UPSA's commitment to leveraging technology to solve real-world problems and 
            improve accessibility to essential tools for students, faculty, and the broader community.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300">Educational Excellence</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300">Innovation Hub</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300">Community Impact</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300">Technology Leadership</span>
          </div>
        </div>
      </div>

      {/* Technical Information */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-2">Technical Excellence</h2>
        <p className="text-center text-gray-600 mb-6">
          Built with modern technologies for optimal performance
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Frontend Technologies</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">Next.js 14</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">React 18</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">TypeScript</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">Tailwind CSS</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">Shadcn/ui</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Processing & Security</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">CloudConvert API</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">Tesseract.js OCR</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">HTTPS Encryption</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800">Auto-deletion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Free to Use</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-500 mb-2">24h</div>
            <div className="text-sm text-gray-600">File Auto-deletion</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500 mb-2">4+</div>
            <div className="text-sm text-gray-600">Processing Tools</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-500 mb-2">∞</div>
            <div className="text-sm text-gray-600">Usage Limit</div>
          </div>
        </div>
      </div>

      {/* Get Started */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-2">Ready to Get Started?</h2>
        <p className="text-center text-gray-600 mb-6">
          Choose from our powerful PDF processing tools
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/processing/pdf-to-word">
            <div className="w-full h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <FileText className="h-6 w-6" />
              <span>PDF to Word</span>
            </div>
          </Link>
          <Link href="/processing/pdf-to-images">
            <div className="w-full h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <Image className="h-6 w-6" />
              <span>PDF to Images</span>
            </div>
          </Link>
          <Link href="/processing/ocr">
            <div className="w-full h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <ScanText className="h-6 w-6" />
              <span>OCR Processing</span>
            </div>
          </Link>
          <Link href="/tools">
            <div className="w-full h-auto p-4 flex flex-col items-center gap-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <Edit className="h-6 w-6" />
              <span>All Tools</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5" />
          Get in Touch
        </h2>
        <p className="text-gray-600 mb-6">
          We'd love to hear from you
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Email Support</h4>
            <p className="text-sm text-gray-600 mb-2">Get help with any questions</p>
            <a href="mailto:support@upsadochub.com" className="text-blue-600 hover:underline text-sm">
              support@upsadochub.com
            </a>
          </div>
          <div className="text-center">
            <Github className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Open Source</h4>
            <p className="text-sm text-gray-600 mb-2">Contribute to our project</p>
            <a href="#" className="text-blue-600 hover:underline text-sm">
              View on GitHub
            </a>
          </div>
          <div className="text-center">
            <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">UPSA Website</h4>
            <p className="text-sm text-gray-600 mb-2">Learn more about UPSA</p>
            <a href="https://upsa.edu.gh" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              upsa.edu.gh
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 my-6"></div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Have questions or need help? Visit our{' '}
            <Link href="/support" className="text-blue-600 hover:underline">Support Center</Link>
            {' '}or{' '}
            <Link href="/contact-support" className="text-blue-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}