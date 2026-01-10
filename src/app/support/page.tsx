'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  FileText, 
  Mail, 
  Phone, 
  Clock, 
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    {
      title: 'Getting Started',
      icon: <Book className="h-6 w-6" />,
      description: 'Learn the basics of using UPSA DocHub',
      links: [
        { title: 'Quick Start Guide', href: '/help#quick-start' },
        { title: 'How to Upload Files', href: '/how-to-use#upload' },
        { title: 'Understanding File Formats', href: '/help#formats' }
      ]
    },
    {
      title: 'Conversion Tools',
      icon: <FileText className="h-6 w-6" />,
      description: 'Help with PDF conversion features',
      links: [
        { title: 'PDF to Word Guide', href: '/how-to-use#pdf-to-word' },
        { title: 'PDF to Images', href: '/how-to-use#pdf-to-images' },
        { title: 'OCR Text Extraction', href: '/how-to-use#ocr' }
      ]
    },
    {
      title: 'Troubleshooting',
      icon: <AlertCircle className="h-6 w-6" />,
      description: 'Common issues and solutions',
      links: [
        { title: 'Upload Problems', href: '/help#troubleshooting' },
        { title: 'Conversion Errors', href: '/help#troubleshooting' },
        { title: 'Download Issues', href: '/help#troubleshooting' }
      ]
    },
    {
      title: 'Account & Billing',
      icon: <Info className="h-6 w-6" />,
      description: 'Account management and billing support',
      links: [
        { title: 'Account Settings', href: '/faq#account' },
        { title: 'Privacy Policy', href: '/privacy-policy' },
        { title: 'Terms of Service', href: '/terms-of-service' }
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      availability: 'Available 24/7',
      action: 'Start Chat',
      href: '#chat'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      href: '/contact-support'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: <Phone className="h-6 w-6 text-purple-600" />,
      availability: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Now',
      href: 'tel:+1-555-0123'
    }
  ];

  const quickLinks = [
    { title: 'FAQ', href: '/faq', description: 'Frequently asked questions' },
    { title: 'Help Center', href: '/help', description: 'Comprehensive guides and tutorials' },
    { title: 'How to Use', href: '/how-to-use', description: 'Step-by-step instructions' },
    { title: 'Contact Us', href: '/contact', description: 'Get in touch with our team' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the help you need to make the most of UPSA DocHub. Find answers, guides, and contact our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                <span>Learn more</span>
                <ExternalLink className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Support Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {supportCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {category.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Contact Support
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    {option.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{option.availability}</span>
                </div>
                <a
                  href={option.href}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  {option.action}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Updates */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            System Status
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-800">PDF Conversion</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-800">OCR Service</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-800">File Upload</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Don't hesitate to reach out if you can't find what you're looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-support"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Contact Support Team
            </Link>
            <Link
              href="/faq"
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              Browse FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}