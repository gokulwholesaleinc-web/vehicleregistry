import { useState } from "react";
import { Button } from "@/components/ui/button";
import RotatingHero from "@/components/RotatingHero";
import HowItWorks from "@/components/HowItWorks";
import { Link } from "wouter";
import QuickSignupModal from "@/components/quick-signup-modal";
import CommunitySlideshow from "@/components/community-slideshow";

export default function Landing() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section with Rotating Vehicle Images */}
      <RotatingHero />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Community Showcase Section */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-2">Featured Community Builds</h2>
        <p className="text-slate-600 dark:text-slate-300 text-center mb-8">Real cars from the community—click any image to view full size.</p>
        <div className="max-w-4xl mx-auto">
          <CommunitySlideshow />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-slate-800 border-t">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your VIN profile?</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of automotive enthusiasts tracking their builds with precision and pride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => setIsSignupModalOpen(true)}
            >
              Create Account Now
            </Button>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/vintage-badge.png" alt="VINtage Garage" className="h-12 w-auto" />
                <div>
                  <h3 className="text-xl font-bold text-white">VINtage Garage</h3>
                  <div className="text-xs text-gray-400 -mt-1 tracking-wider font-medium">
                    REGISTRY
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                The premier automotive community for car enthusiasts who value detailed records and quality builds.
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#showcase" className="hover:text-white transition-colors">Vehicle Showcase</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:support@vintagegarage.com" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="mailto:contact@vintagegarage.com" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="mailto:feedback@vintagegarage.com" className="hover:text-white transition-colors">Feedback</a></li>
                <li><a href="/api/status" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="mailto:compliance@vintagegarage.com" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 VINtage Garage Registry. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>🔒 Industry-standard encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>🛡️ GDPR & CCPA Compliant</span>
                </div>
              </div>
            </div>

            {/* Unsubscribe Notice - Required for Email Marketing Compliance */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                📧 <strong>Email Marketing:</strong> We only send marketing emails to users who explicitly opt-in. 
                You can unsubscribe anytime using the link in our emails or by contacting us at 
                <a href="mailto:unsubscribe@vintagegarage.com" className="text-blue-400 hover:text-blue-300 ml-1">
                  unsubscribe@vintagegarage.com
                </a>
                . We process unsubscribe requests within 10 business days.
                <br />
                <strong>Physical Address:</strong> VINtage Garage Registry, 123 Automotive Way, Detroit, MI 48201, USA
              </p>
            </div>
          </div>
        </div>
      </footer>

      <QuickSignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  );
}