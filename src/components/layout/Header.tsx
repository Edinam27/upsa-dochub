'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: 'SOLUTIONS', href: '/tools' },
    { name: 'FEATURES', href: '/#features' },
    { name: 'RESOURCES', href: '#' },
    { name: 'SUPPORT', href: '/support' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-neutral-200 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-40 h-10">
            <Image 
              src="/logo.png" 
              alt="JoedyTools" 
              fill 
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-mono text-foreground hover:text-joedy-cyan transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            className="rounded-none hidden md:inline-flex bg-joedy-navy hover:bg-joedy-navy-light font-mono text-white"
          >
            GET STARTED <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          {/* Mobile Navigation (Sheet) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full mt-6">
                <nav className="flex flex-col gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-mono text-foreground hover:text-joedy-cyan transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pb-8">
                  <Button className="w-full cursor-pointer rounded-none bg-joedy-navy hover:bg-joedy-navy-light font-mono text-white">
                    GET STARTED <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
