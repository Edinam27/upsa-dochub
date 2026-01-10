import Link from 'next/link';
import { GraduationCap, ExternalLink, Heart, Shield, Clock } from 'lucide-react';

const Footer = () => {
  const universityLinks = [
    { name: 'UPSA Website', href: 'https://upsa.edu.gh', external: true },
    { name: 'Student Portal', href: 'https://upsasip.com/student-portal', external: true },
    { name: 'Library', href: 'https://library.upsa.edu.gh', external: true },
    { name: 'Academic Calendar', href: 'https://upsa.edu.gh/academic-calendar', external: true },
  ];

  const toolCategories = [
    { name: 'Academic Tools', href: '#academic-tools' },
    { name: 'Conversion Tools', href: '#conversion-tools' },
    { name: 'Study Tools', href: '#study-tools' },
    { name: 'All Tools', href: '#tools' },
  ];

  const supportLinks = [
    { name: 'How to Use', href: '/how-to-use' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Contact Support', href: '/contact-support' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <div>
                <span className="text-xl font-bold">UPSA DocHub</span>
                <p className="text-sm text-gray-400">Student PDF Tools</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Empowering UPSA students with professional PDF tools for academic success. 
              Process documents securely and efficiently.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* University Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">University Resources</h3>
            <ul className="space-y-2">
              {universityLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tool Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">PDF Tools</h3>
            <ul className="space-y-2">
              {toolCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for UPSA students</span>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} UPSA DocHub. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Files processed locally</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
