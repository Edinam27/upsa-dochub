'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Lock } from 'lucide-react';
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
  isLocked?: boolean;
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
    <Link href={tool.isLocked ? '#' : getToolRoute(tool.id)} className={`block ${tool.isLocked ? 'cursor-not-allowed' : ''}`}>
      <motion.div
        className="relative group cursor-pointer"
        onHoverStart={() => !tool.isLocked && setIsHovered(true)}
        onHoverEnd={() => !tool.isLocked && setIsHovered(false)}
        whileHover={!tool.isLocked ? { y: -8 } : {}}
        transition={{ duration: 0.3 }}
      >
      <div className={`bg-white rounded-2xl p-6 border transition-all duration-300 h-full relative overflow-hidden ${tool.isLocked ? 'border-gray-200 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}>
        
        {tool.isLocked && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-6">
            <div className="bg-gray-900/5 p-4 rounded-full mb-3">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <span className="text-gray-900 font-bold text-lg mb-1">Feature Locked</span>
            <span className="text-gray-500 text-sm">This tool is currently unavailable</span>
          </div>
        )}

        {/* Tool Icon */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            {tool.icon}
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 text-yellow-500 fill-yellow-400"
              />
            ))}
          </div>
        </div>

        {/* Tool Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00d2d3] transition-colors relative z-10">
          {tool.name}
        </h3>

        {/* Tool Description */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed relative z-10">
          {tool.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6 relative z-10">
          {tool.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0.7, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-1.5 h-1.5 bg-[#00d2d3] rounded-full"></div>
              <span className="text-gray-600 text-xs font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          className="flex items-center justify-between relative z-10"
          animate={{ opacity: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {tool.category}
          </span>
          <motion.div
            className="flex items-center space-x-1 text-[#00d2d3] group-hover:text-[#00a8a8]"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-medium">Use Tool</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#00d2d3]/5 to-[#001f3f]/5 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
          animate={{ opacity: isHovered ? 0.3 : 0 }}
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