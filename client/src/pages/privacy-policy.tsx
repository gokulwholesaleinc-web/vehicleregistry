import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  const lastUpdated = "January 21, 2025";
  const effectiveDate = "January 21, 2025";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Last updated: {lastUpdated} | Effective date: {effectiveDate}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                VINtage Garage Registry ("we," "our," or "us") is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                automotive community platform and related services (the "Service").
              </p>
              <p>
                By using our Service, you consent to the data practices described in this policy. If you do not agree with 
                this policy, please do not use our Service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <h4>Personal Information You Provide</h4>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, username, password, profile photo</li>
                <li><strong>Vehicle Information:</strong> VIN numbers, vehicle specifications, ownership history, modification records, maintenance logs</li>
                <li><strong>User-Generated Content:</strong> Photos, documents, comments, reviews, and other content you upload or share</li>
                <li><strong>Communication Preferences:</strong> Marketing consent, notification settings, email preferences</li>
                <li><strong>Contact Information:</strong> Physical address, phone number (when provided voluntarily)</li>
              </ul>

              <h4>Information Collected Automatically</h4>
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, click patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address (not precise location)</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, preference settings</li>
              </ul>

              <h4>Information from Third Parties</h4>
              <ul>
                <li><strong>OAuth Providers:</strong> Google account information (name, email, profile photo) when you sign in with Google</li>
                <li><strong>VIN Decoding Services:</strong> Vehicle specifications and history data from automotive databases</li>
                <li><strong>Analytics Services:</strong> Aggregated usage statistics and performance metrics</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>We use the information we collect for the following purposes:</p>
              
              <h4>Service Provision</h4>
              <ul>
                <li>Create and manage your account</li>
                <li>Provide vehicle registry and community features</li>
                <li>Process vehicle transfers and ownership changes</li>
                <li>Generate maintenance reports and recommendations</li>
                <li>Facilitate community interactions and showcases</li>
              </ul>

              <h4>Communication</h4>
              <ul>
                <li>Send transactional emails (account notifications, security alerts)</li>
                <li>Deliver marketing communications (with your explicit consent)</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send maintenance reminders and vehicle alerts</li>
              </ul>

              <h4>Platform Improvement</h4>
              <ul>
                <li>Analyze usage patterns to improve our services</li>
                <li>Develop new features and functionality</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h4>Legal and Safety</h4>
              <ul>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Protect user safety and prevent abuse</li>
                <li>Respond to legal requests and court orders</li>
                <li>Investigate and prevent fraudulent activity</li>
              </ul>
            </CardContent>
          </Card>

          {/* Email Marketing & Communications */}
          <Card>
            <CardHeader>
              <CardTitle>Email Marketing & Communications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <h4>Marketing Consent</h4>
              <p>
                We only send marketing emails to users who have provided <strong>explicit, affirmative consent</strong>. 
                This includes newsletters, feature announcements, and promotional content about automotive events and products.
              </p>

              <h4>Transactional Emails</h4>
              <p>
                We may send transactional emails without separate consent as they are necessary for service operation:
              </p>
              <ul>
                <li>Account verification and password resets</li>
                <li>Security notifications and login alerts</li>
                <li>Vehicle transfer notifications</li>
                <li>Maintenance reminders (when enabled)</li>
                <li>Community activity notifications (when enabled)</li>
              </ul>

              <h4>Unsubscribe Rights</h4>
              <p>
                You can unsubscribe from marketing emails at any time by:
              </p>
              <ul>
                <li>Clicking the unsubscribe link in any marketing email</li>
                <li>Updating your preferences in your account settings</li>
                <li>Contacting us directly at the address below</li>
                <li>Sending a written request to our physical mailing address</li>
              </ul>
              <p>
                We will process unsubscribe requests within <strong>10 business days</strong> as required by law.
              </p>

              <h4>Third-Party Email Services</h4>
              <p>
                We use Twilio SendGrid for email delivery. SendGrid processes your email address and communication 
                preferences solely to deliver emails on our behalf and in accordance with their 
                <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  privacy policy
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>We do not sell your personal information. We may share information in the following circumstances:</p>
              
              <h4>Service Providers</h4>
              <ul>
                <li><strong>Twilio SendGrid:</strong> Email delivery and marketing automation</li>
                <li><strong>Google OAuth:</strong> Authentication services (when you choose to sign in with Google)</li>
                <li><strong>VIN Decoding APIs:</strong> Vehicle specification lookup and validation</li>
                <li><strong>Hosting Providers:</strong> Cloud infrastructure and data storage</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring</li>
              </ul>

              <h4>Community Features</h4>
              <ul>
                <li>Public vehicle showcases (only information you choose to make public)</li>
                <li>Community discussions and comments</li>
                <li>Vehicle history for transparency (with privacy controls)</li>
              </ul>

              <h4>Legal Requirements</h4>
              <ul>
                <li>Compliance with applicable laws and regulations</li>
                <li>Response to valid legal process (subpoenas, court orders)</li>
                <li>Protection of our rights and property</li>
                <li>Investigation of fraud or security issues</li>
              </ul>

              <h4>Business Transfers</h4>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                as part of the transaction, subject to equivalent privacy protections.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              
              <ul>
                <li><strong>Encryption:</strong> Data in transit protected by TLS 1.2+ encryption</li>
                <li><strong>Authentication:</strong> Secure password hashing using industry-standard algorithms</li>
                <li><strong>Access Controls:</strong> Role-based access and principle of least privilege</li>
                <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security updates</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for unauthorized access attempts</li>
                <li><strong>Incident Response:</strong> Procedures for detecting and responding to security breaches</li>
              </ul>

              <p>
                While we strive to protect your information, no method of transmission over the internet or 
                electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights and Choices */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <h4>Account Management</h4>
              <ul>
                <li><strong>Access:</strong> View and download your personal information</li>
                <li><strong>Update:</strong> Correct or update your account information</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your vehicle and maintenance data</li>
              </ul>

              <h4>Privacy Controls</h4>
              <ul>
                <li><strong>Visibility Settings:</strong> Control what information is public or private</li>
                <li><strong>Communication Preferences:</strong> Manage email and notification settings</li>
                <li><strong>Data Sharing:</strong> Opt out of non-essential data sharing</li>
                <li><strong>Analytics:</strong> Opt out of usage analytics collection</li>
              </ul>

              <h4>Legal Rights (GDPR, CCPA, etc.)</h4>
              <p>Depending on your location, you may have additional rights including:</p>
              <ul>
                <li><strong>Right to Know:</strong> Information about data collection and use</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain data processing activities</li>
                <li><strong>Right to Restrict:</strong> Limit how we process your information</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
              </ul>

              <p>
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              
              <h4>Essential Cookies</h4>
              <ul>
                <li>Authentication and session management</li>
                <li>Security features and fraud prevention</li>
                <li>Core platform functionality</li>
              </ul>

              <h4>Functional Cookies</h4>
              <ul>
                <li>User preferences and settings</li>
                <li>Language and display preferences</li>
                <li>Feature customization</li>
              </ul>

              <h4>Analytics Cookies</h4>
              <ul>
                <li>Usage statistics and performance monitoring</li>
                <li>Feature usage analytics</li>
                <li>Error reporting and debugging</li>
              </ul>

              <p>
                You can control cookie settings through your browser preferences. Disabling certain cookies 
                may limit platform functionality.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>We retain personal information for as long as necessary to provide our services and comply with legal obligations:</p>
              
              <ul>
                <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years after deletion for legal compliance</li>
                <li><strong>Vehicle Records:</strong> Maintained for historical accuracy and community value, with privacy controls</li>
                <li><strong>Communication Logs:</strong> Marketing communications retained for 7 years as required by law</li>
                <li><strong>Usage Analytics:</strong> Aggregated and anonymized after 2 years</li>
                <li><strong>Security Logs:</strong> Retained for 1 year for security monitoring</li>
              </ul>

              <p>
                When you delete your account, we will delete or anonymize your personal information within 30 days, 
                except where longer retention is required by law.
              </p>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure adequate protection through:
              </p>
              
              <ul>
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Data Processing Addendums with all third-party processors</li>
                <li>Adequacy decisions where applicable</li>
                <li>Certification programs and codes of conduct</li>
              </ul>

              <p>
                By using our Service, you consent to the transfer of your information to countries that may have 
                different data protection laws than your country of residence.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                Our Service is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children under 16. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us immediately.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 16 without 
                parental consent, we will take steps to delete that information from our servers.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will:
              </p>
              
              <ul>
                <li>Post the updated policy on this page with a new "Last updated" date</li>
                <li>Notify you by email if the changes materially affect your rights</li>
                <li>Provide prominent notice on our platform for significant changes</li>
                <li>Obtain your consent for changes that expand our use of your personal information</li>
              </ul>

              <p>
                Your continued use of our Service after the effective date constitutes acceptance of the 
                updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300">privacy@vintagegarage.com</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">General privacy inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Mailing Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      VINtage Garage Registry<br />
                      Privacy Department<br />
                      123 Automotive Way<br />
                      Detroit, MI 48201<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Phone</h4>
                    <p className="text-gray-600 dark:text-gray-300">+1 (313) 555-0199</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business hours: Mon-Fri 9AM-5PM EST</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Protection Officer</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  For GDPR-related inquiries, you may contact our Data Protection Officer directly at: 
                  <span className="font-medium"> dpo@vintagegarage.com</span>
                </p>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Unsubscribe Requests</h4>
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  To unsubscribe from marketing emails, you may also send a written request to our mailing address above. 
                  We will process your request within 10 business days as required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance and Certifications</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>VINtage Garage Registry is committed to compliance with applicable data protection laws and regulations:</p>
              
              <ul>
                <li><strong>GDPR:</strong> European Union General Data Protection Regulation</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act</li>
                <li><strong>CAN-SPAM:</strong> Controlling the Assault of Non-Solicited Pornography And Marketing Act</li>
                <li><strong>CASL:</strong> Canada's Anti-Spam Legislation</li>
                <li><strong>SOC 2:</strong> Service Organization Control 2 Type II (through our service providers)</li>
              </ul>

              <p>
                We regularly review and update our practices to maintain compliance with evolving privacy laws 
                and industry standards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}