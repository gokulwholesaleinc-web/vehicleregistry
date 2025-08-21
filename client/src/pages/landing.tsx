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
            
            <p className="mobile-text sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up px-4" style={{animationDelay: "0.2s"}}>
              The ultimate community-driven platform for automotive enthusiasts. Track modifications, 
              maintenance records, and connect with fellow car lovers who share your passion for precision.
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
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <div className="status-indicator status-online"></div>
                  <span>Quick signup</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Gmail supported</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Free forever</span>
                </div>
              </div>
            </div>
            
            {/* Quick features highlight */}
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-white/70 text-xs sm:text-sm animate-slide-up px-4" style={{animationDelay: "0.6s"}}>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 interactive-scale">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>30-second setup</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 interactive-scale">
                <Shield className="w-3 h-3 text-green-400" />
                <span>Secure authentication</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 interactive-scale">
                <Users className="w-3 h-3 text-blue-400" />
                <span>Join 10,000+ users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up px-4">
            <h2 className="heading-lg mb-4 sm:mb-6">
              Built for Enthusiasts, By Enthusiasts
            </h2>
            <p className="mobile-text sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every feature designed to meet the needs of serious car enthusiasts who value precision and community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Car,
                title: "VIN-Based Registry",
                description: "Each vehicle has a unique profile tied to its VIN that preserves complete history even when ownership changes.",
                color: "text-blue-600 dark:text-blue-400",
                delay: "0s"
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Share your builds publicly and discover other enthusiasts' modifications and maintenance records.",
                color: "text-emerald-600 dark:text-emerald-400",
                delay: "0.1s"
              },
              {
                icon: History,
                title: "Ownership History",
                description: "Complete ownership tracking with the ability for previous owners to see new modifications.",
                color: "text-purple-600 dark:text-purple-400",
                delay: "0.2s"
              },
              {
                icon: Shield,
                title: "Secure Transfers",
                description: "Safe vehicle ownership transfers with verification codes and complete history preservation.",
                color: "text-red-600 dark:text-red-400",
                delay: "0.3s"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="card-modern card-hover text-center animate-slide-up"
                style={{animationDelay: feature.delay}}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Community Showcase Section */}
      <div className="py-16 sm:py-24 bg-white dark:bg-gray-950 relative">
        <div className="container-responsive">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="heading-lg mb-4 sm:mb-6">
              See What Our Community Builds
            </h2>
            <p className="mobile-text sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover incredible builds, modifications, and maintenance records from automotive enthusiasts around the world.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <CommunitySlideshow />
          </div>
          
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => setIsSignupModalOpen(true)}
              className="btn-secondary group"
              data-testid="button-explore-community"
            >
              <Users className="w-5 h-5 mr-2" />
              Join the Community
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
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