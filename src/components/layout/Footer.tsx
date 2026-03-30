import Link from 'next/link';
import Image from 'next/image';
import { Shield, Zap, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import GoogleRating from '@/components/ui/GoogleRating';

const Footer = () => {
  const toolCategories = [
    { name: 'Organize PDFs', href: '#academic-tools' },
    { name: 'Conversion Tools', href: '#conversion-tools' },
    { name: 'Enhancement Tools', href: '#study-tools' },
    { name: 'All Tools', href: '#tools' },
  ];

  const supportLinks = [
    { name: 'How to Use', href: '/how-to-use' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Contact Support', href: '/contact-support' },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-b from-neutral-50 to-neutral-100 border-t border-neutral-200">
      <div className="container-max py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative w-40 h-10">
                <Image 
                  src="/logo.png" 
                  alt="JoedyTools Logo" 
                  fill 
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Process documents securely and efficiently with fast, professional PDF tools built for everyone.
            </p>
            <div className="flex items-center space-x-4 text-sm text-neutral-600 pt-2">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-primary-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-primary-600" />
                <span>Fast</span>
              </div>
            </div>
            
            <div className="pt-4">
              <a 
                href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity"
              >
                <GoogleRating />
              </a>
            </div>
          </div>

          {/* Tool Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-6">PDF Tools</h3>
            <ul className="space-y-3">
              {toolCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-medium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-6">Connect</h3>
            <div className="space-y-4">
              <p className="text-neutral-600 text-sm">
                Stay updated with the latest PDF tools and features.
              </p>
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-primary-600 hover:text-white transition-all duration-300"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-neutral-600 text-sm">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Made with care for everyone</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} JoedyTools. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              <span>Files processed locally</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
