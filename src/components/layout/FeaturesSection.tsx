'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  Clock, 
  Award,
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="card-hover p-8 h-full space-y-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors"
        >
          <div className="text-primary-600">
            {icon}
          </div>
        </motion.div>
        
        <div>
          <h3 className="text-lg font-mono font-bold text-neutral-900 mb-2">
            {title}
          </h3>
          <p className="text-neutral-600 font-mono text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "All files are processed locally in your browser. No uploads to servers, complete privacy guaranteed.",
      delay: 0.1,
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Advanced algorithms ensure your documents are processed in seconds, not minutes.",
      delay: 0.2,
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Ready",
      description: "Fully responsive interface that works perfectly on phones, tablets, and desktops.",
      delay: 0.3,
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Built for Everyone",
      description: "Designed for all workflows with user-friendly, practical features.",
      delay: 0.4,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "No Registration",
      description: "Start using tools immediately without creating accounts or providing emails.",
      delay: 0.5,
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Professional Quality",
      description: "Industry-standard PDF processing with high-quality output for all your needs.",
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-mono font-bold tracking-tight mb-6">
            Why Choose <span className="text-joedy-cyan">JoedyTools</span>?
          </h2>
          <p className="text-xl text-neutral-600 font-mono max-w-3xl mx-auto">
            A complete PDF toolkit designed for global use — fast, secure, and private.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid-auto mb-20">
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

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="card p-12 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-mono font-bold text-neutral-900">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-neutral-600 font-mono max-w-2xl mx-auto">
                Join thousands of people who streamline their document processing with our free tools.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const toolsSection = document.getElementById('tools');
                  if (toolsSection) {
                    toolsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn btn-primary font-mono btn-lg"
              >
                Explore Tools
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
