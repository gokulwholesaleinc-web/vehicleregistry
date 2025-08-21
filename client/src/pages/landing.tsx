import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, History, Shield, Sparkles, Zap, Globe, Lock, ArrowRight } from "lucide-react";
import QuickSignupModal from "@/components/quick-signup-modal";
import CommunitySlideshow from "@/components/community-slideshow";

export default function Landing() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Animated Background */}
      <div className="relative">
        <div className="absolute inset-0 gradient-bg opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-float" style={{animationDelay: "2s"}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-xl animate-float" style={{animationDelay: "4s"}}></div>
        
        <div className="relative container-responsive py-16 sm:py-24 lg:py-32">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 interactive-glow">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-bounce-gentle" />
              <span className="text-xs sm:text-sm font-medium text-white">Premium Car Registry Platform</span>
            </div>
            
            <h1 className="heading-xl mb-4 sm:mb-6 animate-pulse-glow">
              VINtage Garage Registry
            </h1>
            
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up px-4" style={{animationDelay: "0.2s"}}>
              Track your modifications, maintenance records, and connect with fellow car enthusiasts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up px-4" style={{animationDelay: "0.4s"}}>
              <Button 
                size="lg" 
                className="btn-primary mobile-text sm:text-lg mobile-padding group shadow-2xl w-full sm:w-auto touch-friendly"
                onClick={() => setIsSignupModalOpen(true)}
                data-testid="button-login"
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Sign Up with Email
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Community Showcase Section - NOW PROMINENTLY FEATURED */}
      <div className="py-12 sm:py-16 bg-white dark:bg-gray-950 relative">
        <div className="container-responsive">
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Featured Community Builds
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Discover incredible builds from automotive enthusiasts worldwide
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <CommunitySlideshow />
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <Button 
              size="lg"
              onClick={() => setIsSignupModalOpen(true)}
              className="btn-primary group"
              data-testid="button-explore-community"
            >
              <Users className="w-5 h-5 mr-2" />
              Join the Community
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section - Moved Below Community */}
      <div className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Car,
                title: "VIN Registry",
                description: "Complete vehicle history tracking",
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: Users,
                title: "Community",
                description: "Share builds with enthusiasts",
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                icon: History,
                title: "History",
                description: "Track ownership changes",
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: Shield,
                title: "Secure",
                description: "Safe ownership transfers",
                color: "text-red-600 dark:text-red-400",
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="card-modern text-center"
              >
                <CardContent className="p-4">
                  <div className="flex justify-center mb-3">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-sm font-semibold mb-1">{feature.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-blue-900/30 to-purple-900/50 opacity-80"></div>
        
        <div className="relative container-responsive text-center">
          <div className="max-w-4xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Join the Community</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Connect with Car Enthusiasts Worldwide
            </h2>
            
            <p className="text-lg sm:text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of meticulous car enthusiasts who value detailed records, quality builds, 
              and sharing knowledge with the community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="btn-primary text-lg px-8 py-4 group shadow-2xl"
                onClick={() => setIsSignupModalOpen(true)}
                data-testid="button-join-community"
              >
                <Zap className="w-5 h-5 mr-2" />
                Create Account Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Free forever • No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">✓ Gmail</span>
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">✓ Any Email</span>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">✓ Instant Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <QuickSignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  );
}