'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  features: string[];
}

interface ToolCardProps {
  tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to get the correct route for each tool
  const getToolRoute = (toolId: string) => {
    switch (toolId) {
      case 'pdf-to-word':
        return '/processing/pdf-to-word';
      case 'pdf-to-images':
        return '/processing/pdf-to-images';
      case 'pdf-ocr':
        return '/processing/ocr-text-extraction';
      default:
        return `/tools/${toolId}`;
    }
  };

  return (
    <Link href={getToolRoute(tool.id)} className="block">
      <motion.div
        className="relative group cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 h-full">
        {/* Tool Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300`}>
            {tool.icon}
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 text-yellow-400 fill-current"
              />
            ))}
          </div>
        </div>

        {/* Tool Name */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
          {tool.name}
        </h3>

        {/* Tool Description */}
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {tool.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {tool.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0.7, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-400 text-xs">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          className="flex items-center justify-between"
          animate={{ opacity: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {tool.category}
          </span>
          <motion.div
            className="flex items-center space-x-1 text-yellow-400 group-hover:text-yellow-300"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-medium">Use Tool</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          animate={{ opacity: isHovered ? 0.1 : 0 }}
        />

        {/* Popular Badge for certain tools */}
        {['merge-pdf', 'compress-pdf', 'word-to-pdf', 'ocr-scanner'].includes(tool.id) && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </div>
          </div>
        )}

        {/* New Badge for newer tools */}
        {['organize-pages'].includes(tool.id) && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              New
            </div>
          </div>
        )}
      </div>

        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${tool.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
        />
      </motion.div>
    </Link>
  );
};

export default ToolCard;