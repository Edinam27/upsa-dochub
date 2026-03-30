'use client';

import { motion } from 'framer-motion';
import { FileText, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection = () => {
  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/30 pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-100/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="relative z-10 container-max text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Logo and Title Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-64 h-16 md:w-80 md:h-20">
                <Image 
                  src="/logo.png" 
                  alt="JoedyTools Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text">PDF Tools</span>
                <br />
                Made Simple
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto">
                Free, secure, and professional PDF tools for everyone. Convert, merge, split, compress, and edit your documents directly in your browser.
              </p>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto my-12"
          >
            {[
              { icon: FileText, label: '12+ Tools', desc: 'Convert, merge, split & more' },
              { icon: Zap, label: 'Lightning Fast', desc: 'Quick document processing' },
              { icon: Shield, label: 'Secure & Private', desc: 'Local browser processing' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="card-hover p-6"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">{feature.label}</h3>
                  <p className="text-sm text-neutral-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTools}
              className="btn btn-primary btn-lg"
            >
              <span>Explore Tools</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary-outline btn-lg"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-16 pt-8 border-t border-neutral-200"
          >
            {[
              { value: '12+', label: 'Tools' },
              { value: 'Free', label: 'Always' },
              { value: '100%', label: 'Secure' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-neutral-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
            onClick={scrollToTools}
          >
            <ArrowRight className="h-6 w-6 text-neutral-400 rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
