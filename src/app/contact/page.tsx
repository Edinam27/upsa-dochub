'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Bug, HelpCircle, Star } from 'lucide-react';

export default function ContactPage() {
  // Removed toast hook
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Message sent! We'll get back to you within 24 hours.");
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      alert("Error sending message. Please try again later or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Contact Us
        </h1>
        <p className="text-center text-lg text-gray-600">
          Get in touch with our support team for help with UPSA DocHub
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send us a message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Support</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Question</option>
                    <option value="general">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your inquiry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please provide detailed information about your inquiry..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
            <p className="text-gray-600 mb-4">
              Reach out to us through any of these channels
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">support@upsadochub.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-600">+233 (0) 123-456-789</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-gray-600">
                    University of Professional Studies<br />
                    Accra, Ghana
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Support Hours
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Monday - Friday</span>
                <span className="text-sm font-medium">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Saturday</span>
                <span className="text-sm font-medium">9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sunday</span>
                <span className="text-sm font-medium">Closed</span>
              </div>
              <hr className="my-4 border-gray-200" />
              <p className="text-xs text-gray-600">
                All times are in Ghana Standard Time (GMT)
              </p>
            </div>
          </div>

          {/* Quick Help */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quick Help
            </h3>
            <div className="space-y-3">
              <a href="/faq" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">FAQ</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Find answers to common questions
                </p>
              </a>
              <a href="/how-to-use" className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">User Guide</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Learn how to use our tools
                </p>
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Times</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-sm">Urgent</span>
                </div>
                <span className="text-sm font-medium">2-4 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span className="text-sm">High</span>
                </div>
                <span className="text-sm font-medium">4-8 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded" />
                  <span className="text-sm">Medium</span>
                </div>
                <span className="text-sm font-medium">24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 border border-gray-400 rounded" />
                  <span className="text-sm">Low</span>
                </div>
                <span className="text-sm font-medium">2-3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Support Options */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Other Ways to Get Help</h2>
        <p className="text-gray-600 mb-6">
          Explore these additional resources for immediate assistance
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <Bug className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Report a Bug</h3>
            <p className="text-sm text-gray-600 mb-3">
              Found an issue? Help us improve by reporting bugs.
            </p>
            <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
              Report Bug
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Star className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Feature Request</h3>
            <p className="text-sm text-gray-600 mb-3">
              Suggest new features or improvements.
            </p>
            <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
              Suggest Feature
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <MessageSquare className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Community Forum</h3>
            <p className="text-sm text-gray-600 mb-3">
              Connect with other users and get community support.
            </p>
            <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
              Visit Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}