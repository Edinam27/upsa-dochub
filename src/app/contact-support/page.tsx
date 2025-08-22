'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Send, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Bug,
  Star,
  Zap,
  Shield
} from 'lucide-react';

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      alert('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
        attachments: []
      });
    }, 2000);
  };

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      availability: 'Available 24/7',
      responseTime: 'Instant',
      action: 'Start Chat',
      href: '#chat',
      color: 'green'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      icon: <Mail className="h-8 w-8 text-blue-600" />,
      availability: 'Always available',
      responseTime: 'Within 24 hours',
      action: 'Send Email',
      href: 'mailto:support@upsadochub.com',
      color: 'blue'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our technical team',
      icon: <Phone className="h-8 w-8 text-purple-600" />,
      availability: 'Mon-Fri, 9AM-6PM EST',
      responseTime: 'Immediate',
      action: 'Call Now',
      href: 'tel:+1-555-0123',
      color: 'purple'
    }
  ];

  const supportCategories = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle className="h-4 w-4" /> },
    { value: 'technical', label: 'Technical Issue', icon: <Bug className="h-4 w-4" /> },
    { value: 'billing', label: 'Billing & Account', icon: <User className="h-4 w-4" /> },
    { value: 'feature', label: 'Feature Request', icon: <Star className="h-4 w-4" /> },
    { value: 'bug', label: 'Bug Report', icon: <AlertCircle className="h-4 w-4" /> }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const responseTimeInfo = [
    {
      category: 'General Inquiries',
      time: '24-48 hours',
      icon: <HelpCircle className="h-5 w-5 text-blue-500" />
    },
    {
      category: 'Technical Issues',
      time: '4-12 hours',
      icon: <Bug className="h-5 w-5 text-orange-500" />
    },
    {
      category: 'Urgent Issues',
      time: '1-4 hours',
      icon: <Zap className="h-5 w-5 text-red-500" />
    },
    {
      category: 'Billing Questions',
      time: '12-24 hours',
      icon: <User className="h-5 w-5 text-green-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help? Our support team is here to assist you. Choose your preferred contact method or submit a support ticket below.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  {channel.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{channel.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{channel.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{channel.availability}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Response: {channel.responseTime}
                </div>
              </div>
              
              <a
                href={channel.href}
                className={`inline-block w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  channel.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  channel.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {channel.action}
              </a>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Support Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Submit Support Ticket
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {supportCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    * Required fields
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Response Times */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Times
              </h3>
              <div className="space-y-3">
                {responseTimeInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {info.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{info.category}</p>
                      <p className="text-xs text-gray-600">{info.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <p className="text-sm text-gray-600">support@upsadochub.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Phone</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Address</p>
                    <p className="text-sm text-gray-600">
                      UPSA DocHub<br />
                      123 Tech Street<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Support Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include detailed steps to reproduce issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mention your browser and operating system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Attach screenshots if applicable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Check our FAQ before submitting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}