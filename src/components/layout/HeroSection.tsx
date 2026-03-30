'use client';

import * as React from "react";
import {
  FileText,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Lock,
} from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";

const labels = [
  { icon: FileText, label: "PDF Conversions" },
  { icon: Layers, label: "Merge & Split" },
  { icon: Lock, label: "Secure Processing" },
];

const features = [
  {
    icon: FileText,
    label: "12+ PDF Tools",
    description: "Convert, merge, split, and edit your documents directly in your browser without any server uploads.",
  },
  {
    icon: Zap,
    label: "Lightning Fast",
    description: "Experience zero wait times. Everything runs instantly on your local machine using WebAssembly.",
  },
  {
    icon: Shield,
    label: "100% Secure & Private",
    description: "Your files never leave your device. Complete privacy for your sensitive documents.",
  },
];

const HeroSection = () => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const titleWords = [
    "THE",
    "ULTIMATE", 
    "PDF",
    "TOOLKIT",
    "FOR",
    "PROFESSIONALS",
  ];

  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen bg-background pt-16">
      <main>
        <section className="container py-24">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative font-mono text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight"
            >
              {titleWords.map((text, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.15, 
                    duration: 0.6 
                  }}
                  className={`inline-block mx-2 md:mx-4 ${text === 'PDF' || text === 'TOOLKIT' ? 'text-joedy-cyan' : ''}`}
                >
                  {text}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground font-mono"
            >
              Free, secure, and powerful PDF tools. Convert, merge, split, compress, and edit your documents directly in your browser.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {labels.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.8 + (index * 0.15), 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  className="flex items-center gap-2 px-6"
                >
                  <feature.icon className="h-5 w-5 text-joedy-cyan" />
                  <span className="text-sm font-mono text-foreground">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 2.4, 
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              className="flex flex-col sm:flex-row gap-4 mt-12"
            >
              <Button
                size="lg"
                onClick={scrollToTools}
                className="cursor-pointer rounded-none bg-joedy-navy hover:bg-joedy-navy-light font-mono text-white"
              >
                EXPLORE TOOLS <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer rounded-none font-mono border-joedy-navy text-joedy-navy hover:bg-joedy-navy hover:text-white"
              >
                LEARN MORE
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="container pb-24" ref={ref}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 3.0, 
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="text-center text-4xl font-mono font-bold mb-12"
          >
            Unlock the Power of PDFs
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 3.2 + (index * 0.2), 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 10
                }}
                className="flex flex-col items-center text-center p-8 bg-background border border-neutral-200 hover:border-joedy-cyan transition-colors duration-300 shadow-sm"
              >
                <div className="mb-6 rounded-full bg-blue-50 p-4">
                  <feature.icon className="h-8 w-8 text-joedy-navy" />
                </div>
                <h3 className="mb-4 text-xl font-mono font-bold text-foreground">
                  {feature.label}
                </h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default HeroSection;
