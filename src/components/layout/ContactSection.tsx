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
            Need help with our PDF tools? Have questions about UPSA DocHub? 
            We're here to support your academic journey.
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* UPSA Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-upsa-blue/10 rounded-lg">
                <MapPin className="h-6 w-6 text-upsa-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">University Campus</h3>
            </div>
            <p className="text-gray-600 mb-4">
              University of Professional Studies, Accra
            </p>
            <p className="text-sm text-gray-500 mb-4">
              East Legon, Accra, Ghana
            </p>
            <Link
              href="https://upsa.edu.gh/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-upsa-blue hover:text-upsa-blue/80 transition-colors"
            >
              <span>Visit UPSA Website</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Student Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-upsa-gold/10 rounded-lg">
                <Mail className="h-6 w-6 text-upsa-gold" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Student Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              For technical support with PDF tools
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Available during academic hours
            </p>
            <Link
              href="https://upsasip.com/student-portal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-upsa-gold hover:text-upsa-gold/80 transition-colors"
            >
              <span>Student Portal</span>
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
              className="flex items-center space-x-3 p-4 bg-upsa-blue/5 rounded-lg hover:bg-upsa-blue/10 transition-colors group"
            >
              <div className="p-2 bg-upsa-blue/10 rounded-lg group-hover:bg-upsa-blue/20 transition-colors">
                <Mail className="h-5 w-5 text-upsa-blue" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Browse Tools</h4>
                <p className="text-sm text-gray-600">Explore all PDF tools</p>
              </div>
            </Link>
            
            <Link
              href="https://upsasip.com/student-portal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-upsa-gold/5 rounded-lg hover:bg-upsa-gold/10 transition-colors group"
            >
              <div className="p-2 bg-upsa-gold/10 rounded-lg group-hover:bg-upsa-gold/20 transition-colors">
                <ExternalLink className="h-5 w-5 text-upsa-gold" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Student Portal</h4>
                <p className="text-sm text-gray-600">Access your account</p>
              </div>
            </Link>
            
            <Link
              href="https://upsa.edu.gh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">UPSA Website</h4>
                <p className="text-sm text-gray-600">University homepage</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
