'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, FileText, Shield, AlertTriangle, Mail, Calendar, Globe } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline">Last Updated: January 2024</Badge>
          <Badge variant="secondary">Version 1.0</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          These terms govern your use of UPSA DocHub. By using our service, you agree to these terms.
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> By accessing or using UPSA DocHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
        </AlertDescription>
      </Alert>

      {/* Quick Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Terms Summary
          </CardTitle>
          <CardDescription>
            Key points about using our service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Free Service</h4>
                <p className="text-sm text-muted-foreground">PDF processing tools provided at no cost</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Responsible Use</h4>
                <p className="text-sm text-muted-foreground">Use our service legally and respectfully</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">No Warranties</h4>
                <p className="text-sm text-muted-foreground">Service provided "as is" without guarantees</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Limited Liability</h4>
                <p className="text-sm text-muted-foreground">Our liability is limited as described below</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            By accessing, browsing, or using UPSA DocHub ("the Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
          <p className="text-sm text-muted-foreground">
            These terms apply to all users of the Service, including visitors, registered users, and any other users of the Service.
          </p>
          <p className="text-sm text-muted-foreground">
            If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these terms.
          </p>
        </CardContent>
      </Card>

      {/* Description of Service */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What We Provide</h4>
            <p className="text-sm text-muted-foreground mb-2">
              UPSA DocHub is a web-based platform that provides PDF processing tools including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>PDF to Word document conversion</li>
              <li>PDF to image conversion (PNG, JPG)</li>
              <li>Optical Character Recognition (OCR) for scanned documents</li>
              <li>PDF editing and manipulation tools</li>
              <li>Other document processing features as added</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Service Availability</h4>
            <p className="text-sm text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted service. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Service Modifications</h4>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Responsibilities */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>3. User Responsibilities and Acceptable Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Permitted Use</h4>
            <p className="text-sm text-muted-foreground mb-2">
              You may use the Service for legitimate document processing purposes, including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Converting your own documents</li>
              <li>Processing documents you have permission to modify</li>
              <li>Educational and research purposes</li>
              <li>Business and professional document processing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Prohibited Activities</h4>
            <p className="text-sm text-muted-foreground mb-2">
              You agree NOT to use the Service for:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Processing copyrighted material without permission</li>
              <li>Uploading malicious files, viruses, or harmful content</li>
              <li>Attempting to reverse engineer or hack the Service</li>
              <li>Overloading our systems with excessive requests</li>
              <li>Processing illegal, offensive, or inappropriate content</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Distributing spam or unwanted communications</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Content Responsibility</h4>
            <p className="text-sm text-muted-foreground">
              You are solely responsible for the content of files you upload and process. You warrant that you have the right to upload and process all content you submit to the Service.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Processing and Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>4. File Processing and Data Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">File Upload and Processing</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Files are processed temporarily and deleted within 24 hours</li>
              <li>Maximum file size limits apply (as displayed in the interface)</li>
              <li>Supported file formats are limited to those specified</li>
              <li>Processing time may vary based on file size and complexity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Data Security</h4>
            <p className="text-sm text-muted-foreground">
              While we implement security measures to protect your files during processing, you acknowledge that no system is completely secure. You use the Service at your own risk.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Backup and Recovery</h4>
            <p className="text-sm text-muted-foreground">
              We do not provide backup or recovery services for your files. You are responsible for maintaining your own backups of important documents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>5. Intellectual Property Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Our Rights</h4>
            <p className="text-sm text-muted-foreground">
              The Service, including its design, functionality, and underlying technology, is owned by UPSA DocHub and protected by intellectual property laws. You may not copy, modify, or distribute our Service without permission.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Your Content</h4>
            <p className="text-sm text-muted-foreground">
              You retain all rights to the content you upload. By using the Service, you grant us a temporary license to process your files solely for the purpose of providing the requested services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Third-Party Content</h4>
            <p className="text-sm text-muted-foreground">
              You are responsible for ensuring you have the right to process any third-party content. We are not responsible for any copyright or intellectual property violations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimers and Limitations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>6. Disclaimers and Limitations of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Service Disclaimer</h4>
            <p className="text-sm text-muted-foreground mb-2">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, INCLUDING:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Accuracy or quality of processed documents</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security of your files during processing</li>
              <li>Compatibility with all file types or systems</li>
              <li>Meeting your specific requirements</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Limitation of Liability</h4>
            <p className="text-sm text-muted-foreground mb-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Damages resulting from service interruptions</li>
              <li>Any damages exceeding the amount you paid for the Service (which is $0 for our free service)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Responsibility</h4>
            <p className="text-sm text-muted-foreground">
              You acknowledge that you use the Service at your own risk and are responsible for any consequences of using the Service.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy and Data Protection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>7. Privacy and Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your privacy is important to us. Our collection, use, and protection of your information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p className="text-sm text-muted-foreground">
            By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
          </p>
          <div className="mt-4">
            <a href="/privacy-policy" className="text-primary hover:underline text-sm">
              Read our Privacy Policy →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Termination */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>8. Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Termination by You</h4>
            <p className="text-sm text-muted-foreground">
              You may stop using the Service at any time. No formal termination process is required for our free service.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Termination by Us</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We may terminate or suspend your access to the Service immediately, without prior notice, if you:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Violate these Terms of Service</li>
              <li>Engage in prohibited activities</li>
              <li>Abuse or overload our systems</li>
              <li>Violate applicable laws or regulations</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Effect of Termination</h4>
            <p className="text-sm text-muted-foreground">
              Upon termination, your right to use the Service will cease immediately. Any files in processing will be deleted according to our standard deletion policy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>9. Changes to These Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We reserve the right to modify these Terms of Service at any time. When we make changes:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>We will update the "Last Updated" date at the top of this page</li>
            <li>Significant changes will be communicated through the Service</li>
            <li>Your continued use of the Service after changes constitutes acceptance</li>
            <li>If you disagree with changes, you should stop using the Service</li>
          </ul>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>10. Governing Law and Disputes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Governing Law</h4>
            <p className="text-sm text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of Ghana, without regard to conflict of law principles.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Dispute Resolution</h4>
            <p className="text-sm text-muted-foreground">
              Any disputes arising from these Terms or your use of the Service shall be resolved through good faith negotiation. If resolution cannot be reached, disputes shall be subject to the jurisdiction of the courts of Ghana.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Severability</h4>
            <p className="text-sm text-muted-foreground">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us About These Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">legal@upsadochub.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <a href="/contact-support" className="text-sm text-primary hover:underline">Contact Support Form</a>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>These terms are effective as of January 1, 2024</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}