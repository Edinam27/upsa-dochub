'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Trash2, Server, Globe, Mail, Calendar } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline">Last Updated: January 2024</Badge>
          <Badge variant="secondary">Version 1.0</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Your privacy is important to us. This policy explains how UPSA DocHub collects, uses, and protects your information.
        </p>
      </div>

      {/* Quick Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Privacy at a Glance
          </CardTitle>
          <CardDescription>
            Key points about how we handle your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Secure Processing</h4>
                <p className="text-sm text-muted-foreground">All files are processed securely with encryption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Automatic Deletion</h4>
                <p className="text-sm text-muted-foreground">Files deleted within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">No Data Sharing</h4>
                <p className="text-sm text-muted-foreground">We never share your files with third parties</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Minimal Data Collection</h4>
                <p className="text-sm text-muted-foreground">We only collect what's necessary</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Files You Upload</h4>
            <p className="text-sm text-muted-foreground mb-2">
              When you use our PDF processing tools, we temporarily store your uploaded files to perform the requested conversions or processing.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>PDF documents and their content</li>
              <li>File metadata (size, creation date, etc.)</li>
              <li>Processing preferences and settings</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Technical Information</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We automatically collect certain technical information to improve our service:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>IP address and general location</li>
              <li>Browser type and version</li>
              <li>Device information and screen resolution</li>
              <li>Usage patterns and performance metrics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If you contact us for support:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Name and email address</li>
              <li>Message content and support history</li>
              <li>Communication preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Service Provision</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Process your PDF files according to your requests</li>
              <li>Generate converted files and make them available for download</li>
              <li>Provide technical support and troubleshooting</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Service Improvement</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Analyze usage patterns to improve our tools</li>
              <li>Monitor system performance and reliability</li>
              <li>Develop new features based on user needs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Security and Compliance</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Detect and prevent abuse or malicious activity</li>
              <li>Comply with legal obligations and regulations</li>
              <li>Protect our systems and users from security threats</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Storage and Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. Data Storage and Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">File Storage</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your uploaded files are stored temporarily on secure servers:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Files are automatically deleted within 24 hours</li>
              <li>Storage is encrypted both in transit and at rest</li>
              <li>Access is restricted to authorized processing systems only</li>
              <li>No human access to file contents during processing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Security Measures</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>HTTPS encryption for all data transmission</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication systems</li>
              <li>Monitoring and logging of system activities</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Location</h4>
            <p className="text-sm text-muted-foreground">
              Our servers are located in secure data centers with appropriate physical and digital security measures. Data processing may occur in different geographic locations to optimize performance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. Data Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">We Do Not Share Your Files</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We never share, sell, or distribute your uploaded files or their content to third parties.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Limited Exceptions</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We may disclose information only in these specific circumstances:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
              <li>To prevent fraud or abuse of our services</li>
              <li>With your explicit consent</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Service Providers</h4>
            <p className="text-sm text-muted-foreground">
              We may use trusted third-party services for hosting, analytics, and support. These providers are bound by strict confidentiality agreements and cannot access your file content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Your Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">File Control</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>You can delete your files immediately after processing</li>
              <li>Files are automatically deleted within 24 hours regardless</li>
              <li>You control what files you upload and process</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Contact and Support Data</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Request access to your contact information</li>
              <li>Update or correct your contact details</li>
              <li>Request deletion of your support history</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Technical Data</h4>
            <p className="text-sm text-muted-foreground">
              Most technical data is anonymized and cannot be linked back to you. You can use browser settings to limit data collection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cookies and Tracking */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Essential Cookies</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We use essential cookies to make our service work properly:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Session management and security</li>
              <li>File upload and processing state</li>
              <li>User preferences and settings</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Analytics</h4>
            <p className="text-sm text-muted-foreground">
              We may use analytics tools to understand how our service is used. This data is anonymized and helps us improve the user experience.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Your Control</h4>
            <p className="text-sm text-muted-foreground">
              You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Children's Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>7. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe we have collected information from a child under 13, please contact us immediately so we can delete such information.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>8. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            We may update this privacy policy from time to time. When we do:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>We'll update the "Last Updated" date at the top</li>
            <li>We'll notify users of significant changes</li>
            <li>The updated policy will be posted on this page</li>
            <li>Continued use of our service constitutes acceptance of changes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us About Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about this privacy policy or how we handle your data, please contact us:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">privacy@upsadochub.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <a href="/contact-support" className="text-sm text-primary hover:underline">Contact Support Form</a>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>This policy is effective as of January 1, 2024</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}