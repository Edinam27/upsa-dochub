'use client';

import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Globe, 
  Mail, 
  Calendar, 
  Info, 
  Lock, 
  CreditCard, 
  Gavel, 
  UserX, 
  RefreshCw
} from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <CheckCircle className="h-6 w-6" />,
      content: [
        "By accessing or using UPSA DocHub, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
        "If you do not agree with any part of these terms, you may not use our service.",
        "These terms apply to all visitors, users, and others who access or use the service."
      ]
    },
    {
      id: "description",
      title: "Service Description",
      icon: <FileText className="h-6 w-6" />,
      content: [
        "UPSA DocHub provides online PDF processing services including conversion, editing, and optimization tools.",
        "Our services are provided on an 'as is' and 'as available' basis.",
        "We reserve the right to modify, suspend, or discontinue any part of our service at any time.",
        "New features and tools may be added to the service from time to time."
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: <Users className="h-6 w-6" />,
      content: [
        "You may be required to create an account to access certain features of our service.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You must provide accurate and complete information when creating an account.",
        "You are responsible for all activities that occur under your account.",
        "You must notify us immediately of any unauthorized use of your account."
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: "Permitted Uses",
          items: [
            "Process your own documents or documents you have permission to modify",
            "Use our services for legitimate business or personal purposes",
            "Access our services through supported browsers and devices"
          ]
        },
        {
          subtitle: "Prohibited Uses",
          items: [
            "Upload copyrighted material without proper authorization",
            "Process documents containing illegal, harmful, or offensive content",
            "Attempt to reverse engineer, hack, or compromise our systems",
            "Use automated tools to access our services without permission",
            "Violate any applicable laws or regulations",
            "Interfere with or disrupt our services or servers"
          ]
        }
      ]
    },
    {
      id: "content-policy",
      title: "Content and File Policy",
      icon: <FileText className="h-6 w-6" />,
      content: [
        {
          subtitle: "Your Content",
          items: [
            "You retain ownership of all files and content you upload",
            "You grant us a temporary license to process your files",
            "You are responsible for ensuring you have rights to all uploaded content",
            "Files are automatically deleted from our servers within 24 hours"
          ]
        },
        {
          subtitle: "Prohibited Content",
          items: [
            "Copyrighted material without proper authorization",
            "Personal information of others without consent",
            "Illegal, harmful, threatening, or offensive material",
            "Malware, viruses, or other malicious code",
            "Content that violates privacy or publicity rights"
          ]
        }
      ]
    },
    {
      id: "privacy-security",
      title: "Privacy and Security",
      icon: <Lock className="h-6 w-6" />,
      content: [
        "Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your information.",
        "We implement industry-standard security measures to protect your data.",
        "Files are encrypted during transmission and processing.",
        "We do not store your files permanently on our servers.",
        "You are responsible for maintaining the security of your account credentials."
      ]
    },
    {
      id: "payment-billing",
      title: "Payment and Billing",
      icon: <CreditCard className="h-6 w-6" />,
      content: [
        {
          subtitle: "Free Services",
          items: [
            "Basic features are available at no cost",
            "Free usage may be subject to limitations and restrictions",
            "We reserve the right to modify free service offerings"
          ]
        },
        {
          subtitle: "Premium Services",
          items: [
            "Premium features require a paid subscription",
            "Billing occurs on a recurring basis as selected",
            "All fees are non-refundable unless otherwise stated",
            "You can cancel your subscription at any time",
            "Price changes will be communicated in advance"
          ]
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <Scale className="h-6 w-6" />,
      content: [
        "The UPSA DocHub service, including its design, functionality, and content, is owned by us and protected by intellectual property laws.",
        "You may not copy, modify, distribute, or create derivative works of our service.",
        "Our trademarks, logos, and service marks are our property and may not be used without permission.",
        "You retain all rights to your uploaded content and processed files."
      ]
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        {
          subtitle: "Service Disclaimers",
          items: [
            "Our service is provided 'as is' without warranties of any kind",
            "We do not guarantee uninterrupted or error-free service",
            "Processing results may vary depending on file quality and format",
            "We are not responsible for data loss or corruption"
          ]
        },
        {
          subtitle: "Limitation of Liability",
          items: [
            "Our liability is limited to the maximum extent permitted by law",
            "We are not liable for indirect, incidental, or consequential damages",
            "Total liability shall not exceed the amount paid for our services",
            "Some jurisdictions may not allow these limitations"
          ]
        }
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: <UserX className="h-6 w-6" />,
      content: [
        "You may terminate your account at any time by contacting us or using account settings.",
        "We may terminate or suspend your account for violations of these terms.",
        "Upon termination, your right to use the service ceases immediately.",
        "Provisions that should survive termination will remain in effect.",
        "We will delete your account data in accordance with our Privacy Policy."
      ]
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <RefreshCw className="h-6 w-6" />,
      content: [
        "We reserve the right to modify these terms at any time.",
        "Material changes will be communicated via email or service notifications.",
        "Continued use of our service after changes constitutes acceptance.",
        "You should review these terms periodically for updates."
      ]
    },
    {
      id: "governing-law",
      title: "Governing Law and Disputes",
      icon: <Gavel className="h-6 w-6" />,
      content: [
        "These terms are governed by the laws of the State of California, United States.",
        "Any disputes will be resolved through binding arbitration or in California courts.",
        "You waive the right to participate in class action lawsuits.",
        "If any provision is found invalid, the remaining terms remain in effect."
      ]
    }
  ];

  const contactInfo = {
    email: "legal@upsadochub.com",
    address: "UPSA DocHub Legal Department\n123 Tech Street\nSan Francisco, CA 94105\nUnited States"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            These terms govern your use of UPSA DocHub and outline the rights and responsibilities of both parties.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Effective: {effectiveDate}</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Key Points
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">Use our service responsibly and legally</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">You own your content, we process it temporarily</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">Respect intellectual property rights</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">Service provided 'as is' with limitations</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Table of Contents</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 py-1 text-sm transition-colors duration-200"
              >
                <span className="text-gray-400">{index + 1}.</span>
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} id={section.id} className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {index + 1}. {section.title}
                  </h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {section.content.map((item, itemIndex) => {
                  if (typeof item === 'string') {
                    return (
                      <div key={itemIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{item}</span>
                      </div>
                    );
                  } else {
                    return (
                      <div key={itemIndex} className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">
                          {item.subtitle}
                        </h3>
                        <ul className="space-y-2 ml-4">
                          {item.items.map((subItem, subIndex) => (
                            <li key={subIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-600">{subItem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Important Legal Notice
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            These terms constitute a legally binding agreement between you and UPSA DocHub. Please read them carefully and contact us if you have any questions.
          </p>
          <p className="text-yellow-700 text-sm">
            By using our service, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Legal Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Questions About These Terms</h3>
              <p className="text-gray-600 mb-4">
                If you have questions about these Terms of Service or need legal clarification, please contact our legal team:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:text-blue-800">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Legal Address</h3>
              <div className="text-gray-600 whitespace-pre-line">
                {contactInfo.address}
              </div>
            </div>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Acknowledgment
          </h3>
          <p className="text-green-700 text-sm">
            By using UPSA DocHub, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them. If you do not agree to these terms, please do not use our service.
          </p>
        </div>
      </div>
    </div>
  );
}