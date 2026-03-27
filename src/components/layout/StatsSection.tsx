'use client';

import { motion } from 'framer-motion';
import { Users, FileText, Clock, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon, value, label, delay }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = targetValue / 50;
      const counter = setInterval(() => {
        setCount((prev) => {
          if (prev >= targetValue) {
            clearInterval(counter);
            return targetValue;
          }
          return Math.min(prev + increment, targetValue);
        });
      }, 30);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [targetValue, delay]);

  const formatValue = (num: number) => {
    if (value.includes('K')) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    if (value.includes('%')) {
      return `${Math.round(num)}%`;
    }
    return Math.round(num).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="text-center group"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-[#00d2d3] to-[#00a8a8] rounded-full text-[#001f3f] group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-white mb-2">
          {formatValue(count)}
        </div>
        <div className="text-gray-300 font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-6 w-6" />,
      value: "5000",
      label: "Users Served",
      delay: 0.1,
    },
    {
      icon: <FileText className="h-6 w-6" />,
      value: "25000",
      label: "Documents Processed",
      delay: 0.2,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      value: "99",
      label: "Uptime Reliability",
      delay: 0.3,
    },
    {
      icon: <Award className="h-6 w-6" />,
      value: "12",
      label: "Professional Tools",
      delay: 0.4,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001f3f]/90 to-[#003366]/90">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#00d2d3]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#00a8a8]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by <span className="gradient-text">Users Worldwide</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of users who rely on JoedyTools for their document processing needs. 
            Fast, secure, and designed for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              delay={stat.delay}
            />
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Why Users Choose JoedyTools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
                <h4 className="font-semibold text-white mb-2">No Registration Required</h4>
                <p className="text-sm">Start using tools immediately without creating accounts</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00d2d3] to-[#00a8a8] rounded-full flex items-center justify-center mb-3">
                  <span className="text-[#001f3f] font-bold text-lg">⚡</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Lightning Fast Processing</h4>
                <p className="text-sm">Process documents in seconds, not minutes</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">🔒</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Complete Privacy</h4>
                <p className="text-sm">Files processed locally and automatically deleted</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
