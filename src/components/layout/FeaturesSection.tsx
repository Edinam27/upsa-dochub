'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  Clock, 
  Award
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
      className="group text-center"
    >
      <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "All files are processed locally in your browser. No uploads to servers, complete privacy guaranteed.",
      delay: 0.1,
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Advanced algorithms ensure your documents are processed in seconds, not minutes.",
      delay: 0.2,
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Ready",
      description: "Fully responsive interface that works perfectly on phones, tablets, and desktops.",
      delay: 0.3,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Built for Students",
      description: "Designed specifically for university workflows with academic-focused features.",
      delay: 0.4,
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "No Registration",
      description: "Start using tools immediately without creating accounts or providing emails.",
      delay: 0.5,
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Professional Quality",
      description: "Industry-standard PDF processing with high-quality output for academic use.",
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-blue-600">UPSA DocHub</span>?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A complete document management solution designed with UPSA students' academic needs in mind.
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

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of UPSA students who streamline their document processing with our free tools.
            </p>
            <button 
              onClick={() => {
                const toolsSection = document.getElementById('tools');
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200"
            >
              Explore Tools
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;