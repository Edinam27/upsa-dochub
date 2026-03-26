'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help with our PDF tools? Have questions about JoedyTools? 
            We're here to support you.
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              For help with the tools or to report a problem
            </p>
            <p className="text-sm text-gray-500 mb-4">
              We respond as quickly as possible
            </p>
            <Link
              href="/support"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Visit Support</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Community & Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            </div>
            <p className="text-gray-600 mb-4">
              New features, improvements, and tips
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Check back regularly for updates
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <span>Read FAQs</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Office Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Service Hours</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p className="text-sm">
                <span className="font-medium">Monday - Friday:</span> 8:00 AM - 6:00 PM
              </p>
              <p className="text-sm">
                <span className="font-medium">Saturday:</span> 9:00 AM - 2:00 PM
              </p>
              <p className="text-sm">
                <span className="font-medium">Sunday:</span> Closed
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              PDF tools are available 24/7 online
            </p>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/tools"
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Browse Tools</h4>
                <p className="text-sm text-gray-600">Explore all PDF tools</p>
              </div>
            </Link>
            
            <Link
              href="/support"
              className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
            >
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <ExternalLink className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Support</h4>
                <p className="text-sm text-gray-600">Get help and guidance</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
