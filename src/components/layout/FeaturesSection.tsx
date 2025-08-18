'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  Clock, 
  Award,
  Download,
  Globe,
  Heart,
  CheckCircle
} from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 h-full hover-lift">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl text-gray-900 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "100% Secure & Private",
      description: "All files are processed locally in your browser. No uploads to servers, no data collection, complete privacy guaranteed.",
      delay: 0.1,
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast Processing",
      description: "Advanced algorithms ensure your documents are processed in seconds, not minutes. Optimized for academic workflows.",
      delay: 0.2,
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile-First Design",
      description: "Fully responsive interface that works perfectly on phones, tablets, and desktops. Process documents anywhere, anytime.",
      delay: 0.3,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Built for UPSA Students",
      description: "Designed specifically for university workflows with features like student ID watermarking and academic templates.",
      delay: 0.4,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "No Registration Required",
      description: "Start using tools immediately without creating accounts, providing emails, or any sign-up process.",
      delay: 0.5,
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Professional Quality",
      description: "Industry-standard PDF processing with high-quality output suitable for academic submissions and professional use.",
      delay: 0.6,
    },
  ];

  const benefits = [
    "Process unlimited documents for free",
    "No file size restrictions",
    "Batch processing capabilities",
    "Real-time preview and editing",
    "Automatic file cleanup for privacy",
    "Keyboard shortcuts for power users",
    "Offline functionality with PWA",
    "Regular updates with new features"
  ];

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-blue-900/30">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose <span className="gradient-text">UPSA DocHub</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            More than just PDF tools - a complete document management solution 
            designed with UPSA students' academic needs in mind.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>

        {/* Additional Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Benefits List */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">
              Everything You Need for Academic Success
            </h3>
            <p className="text-gray-300 mb-8">
              UPSA DocHub provides all the tools you need to manage your academic documents 
              efficiently, from assignment submissions to research papers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">Zero Downloads</h4>
                  <p className="text-gray-300">Works entirely in your browser</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">Universal Access</h4>
                  <p className="text-gray-300">Works on any device, anywhere</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">Student-Focused</h4>
                  <p className="text-gray-300">Built specifically for UPSA</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/20">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Document Workflow?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of UPSA students who have already streamlined their academic document processing. 
              Start using our tools today - no registration required!
            </p>
            <button 
              onClick={() => {
                const toolsSection = document.getElementById('tools');
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              Get Started Now - It's Free!
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;