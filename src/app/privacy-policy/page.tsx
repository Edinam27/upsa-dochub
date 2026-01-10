'use client';

import { 
  Shield, 
  Eye, 
  Lock, 
  FileText, 
  Users, 
  Globe, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Settings, 
  Download, 
  Trash2, 
  UserCheck
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <FileText className="h-6 w-6" />,
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name and email address when you create an account",
            "Profile information you choose to provide",
            "Communication preferences and settings"
          ]
        },
        {
          subtitle: "Usage Information",
          items: [
            "Files you upload for processing (temporarily stored)",
            "Feature usage patterns and preferences",
            "Device information and browser type",
            "IP address and general location data"
          ]
        },
        {
          subtitle: "Technical Information",
          items: [
            "Log files and error reports",
            "Performance metrics and analytics",
            "Cookies and similar tracking technologies"
          ]
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Settings className="h-6 w-6" />,
      content: [
        {
          subtitle: "Service Provision",
          items: [
            "Process your PDF files and provide conversion services",
            "Maintain and improve our platform functionality",
            "Provide customer support and respond to inquiries"
          ]
        },
        {
          subtitle: "Communication",
          items: [
            "Send service-related notifications and updates",
            "Respond to your questions and support requests",
            "Share important changes to our services or policies"
          ]
        },
        {
          subtitle: "Improvement and Analytics",
          items: [
            "Analyze usage patterns to improve our services",
            "Conduct research and development for new features",
            "Monitor and prevent fraud and abuse"
          ]
        }
      ]
    },
    {
      id: "data-protection",
      title: "Data Protection & Security",
      icon: <Shield className="h-6 w-6" />,
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "End-to-end encryption for all file transfers",
            "Secure servers with industry-standard protection",
            "Regular security audits and vulnerability assessments",
            "Access controls and authentication protocols"
          ]
        },
        {
          subtitle: "File Handling",
          items: [
            "Files are processed and deleted within 24 hours",
            "No permanent storage of your uploaded documents",
            "Secure deletion protocols for all temporary files",
            "No human access to your file contents during processing"
          ]
        }
      ]
    },
    {
      id: "data-sharing",
      title: "Information Sharing",
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          subtitle: "We Do Not Sell Your Data",
          items: [
            "We never sell, rent, or trade your personal information",
            "Your files and data remain private and confidential"
          ]
        },
        {
          subtitle: "Limited Sharing Scenarios",
          items: [
            "Service providers who help us operate our platform (under strict confidentiality)",
            "Legal compliance when required by law or court order",
            "Protection of our rights and prevention of fraud",
            "Business transfers (with continued privacy protection)"
          ]
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights & Choices",
      icon: <UserCheck className="h-6 w-6" />,
      content: [
        {
          subtitle: "Access and Control",
          items: [
            "Access and review your personal information",
            "Update or correct your account details",
            "Delete your account and associated data",
            "Export your data in a portable format"
          ]
        },
        {
          subtitle: "Privacy Controls",
          items: [
            "Opt out of non-essential communications",
            "Manage cookie preferences",
            "Control data sharing settings",
            "Request data processing restrictions"
          ]
        }
      ]
    },
    {
      id: "cookies",
      title: "Cookies & Tracking",
      icon: <Eye className="h-6 w-6" />,
      content: [
        {
          subtitle: "Types of Cookies",
          items: [
            "Essential cookies for basic functionality",
            "Performance cookies for analytics and optimization",
            "Preference cookies to remember your settings"
          ]
        },
        {
          subtitle: "Cookie Management",
          items: [
            "You can control cookies through your browser settings",
            "Disabling cookies may affect some functionality",
            "We respect Do Not Track signals where possible"
          ]
        }
      ]
    },
    {
      id: "international",
      title: "International Users",
      icon: <Globe className="h-6 w-6" />,
      content: [
        {
          subtitle: "Data Transfers",
          items: [
            "We operate globally and may transfer data across borders",
            "All transfers comply with applicable privacy laws",
            "Appropriate safeguards are in place for international transfers"
          ]
        },
        {
          subtitle: "Regional Compliance",
          items: [
            "GDPR compliance for European users",
            "CCPA compliance for California residents",
            "Local privacy law compliance where applicable"
          ]
        }
      ]
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: <AlertTriangle className="h-6 w-6" />,
      content: [
        {
          subtitle: "Age Restrictions",
          items: [
            "Our service is not intended for children under 13",
            "We do not knowingly collect information from children",
            "Parents can contact us to remove any child's information"
          ]
        }
      ]
    }
  ];

  const contactInfo = {
    email: "privacy@upsadochub.com",
    address: "UPSA DocHub Privacy Officer\n123 Tech Street\nSan Francisco, CA 94105\nUnited States"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use UPSA DocHub.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">We never sell your personal data</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">Files are deleted within 24 hours</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">End-to-end encryption for all transfers</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">You control your data and privacy settings</span>
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

        {/* Policy Sections */}
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
              
              <div className="space-y-6">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    {subsection.subtitle && (
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        {subsection.subtitle}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Data Rights Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Manage Your Privacy
          </h2>
          <p className="text-gray-600 mb-6">
            Take control of your data with these privacy management options:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
              <Download className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Download Data</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
              <Settings className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Privacy Settings</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
              <Eye className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Cookie Preferences</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors duration-200">
              <Trash2 className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Delete Account</span>
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Contact Us About Privacy
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Privacy Questions</h3>
              <p className="text-gray-600 mb-4">
                If you have questions about this privacy policy or how we handle your data, please contact our privacy team:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:text-blue-800">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <a href="/contact-support" className="text-blue-600 hover:text-blue-800">Contact Support Form</a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Mailing Address</h3>
              <div className="text-gray-600 whitespace-pre-line">
                {contactInfo.address}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Updates */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Policy Updates
          </h3>
          <p className="text-yellow-700 text-sm">
            We may update this privacy policy from time to time. We will notify you of any material changes by email or through our service. Your continued use of our service after such modifications constitutes acceptance of the updated policy.
          </p>
        </div>
      </div>
    </div>
  );
}