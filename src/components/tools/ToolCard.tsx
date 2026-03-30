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
        className="relative group"
        onHoverStart={() => !tool.isLocked && setIsHovered(true)}
        onHoverEnd={() => !tool.isLocked && setIsHovered(false)}
        whileHover={!tool.isLocked ? { y: -8 } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className={`card-interactive relative overflow-hidden h-full ${tool.isLocked ? 'opacity-60' : ''}`}>
          
          {tool.isLocked && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
              <div className="bg-neutral-900/5 p-4 rounded-full mb-3">
                <Lock className="w-8 h-8 text-neutral-500" />
              </div>
              <span className="text-neutral-900 font-bold text-lg mb-1">Coming Soon</span>
              <span className="text-neutral-600 text-sm">This feature is being developed</span>
            </div>
          )}

          <div className="p-6 space-y-4 relative z-10">
            {/* Header with Icon and Rating */}
            <div className="flex items-start justify-between">
              <motion.div
                className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${tool.color} text-white shadow-md`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {tool.icon}
              </motion.div>
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
            </div>

            {/* Tool Name */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                {tool.name}
              </h3>
            </div>

            {/* Tool Description */}
            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-2">
              {tool.description}
            </p>

            {/* Features */}
            <div className="space-y-2 pt-2">
              {tool.features.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                  <span className="text-neutral-600 text-xs font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <span className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">
                {tool.category}
              </span>
              <motion.div
                className="flex items-center space-x-1 text-primary-600 font-medium text-sm"
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span>Use</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </div>
          </div>

          {/* Glow Effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${tool.color} rounded-xl blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}
            animate={{ opacity: isHovered ? 0.1 : 0 }}
          />
        </div>
      </motion.div>
    </Link>
  );
};

export default ToolCard;
