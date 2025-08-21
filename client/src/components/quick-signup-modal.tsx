import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Globe, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Clock, 
  Users,
  Star
} from "lucide-react";

interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSignupModal({ isOpen, onClose }: QuickSignupModalProps) {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleSignup = () => {
    // Redirect to Replit Auth with the email pre-filled
    const loginUrl = `/api/login${email ? `?email=${encodeURIComponent(email)}` : ''}`;
    window.location.href = loginUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900 border-none shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Account
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-300">
            Join thousands of car enthusiasts in under 30 seconds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
              <Clock className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">30 sec</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Setup</div>
            </div>
            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
              <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">10,000+</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Users</div>
            </div>
            <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
              <Star className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Rating</div>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={handleEmailChange}
                className="pl-10 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                data-testid="input-signup-email"
              />
              {isValidEmail && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            
            {/* Email provider badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <Globe className="w-3 h-3 mr-1" />
                Gmail
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <Globe className="w-3 h-3 mr-1" />
                Outlook
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                <Globe className="w-3 h-3 mr-1" />
                Yahoo
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <Globe className="w-3 h-3 mr-1" />
                Any Email
              </Badge>
            </div>
          </div>

          {/* Features */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 dark:text-green-300">What you get instantly:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>VIN-based vehicle tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>AI-powered recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Community access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Unlimited vehicle records</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signup Button */}
          <Button
            onClick={handleSignup}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-create-account"
          >
            <Zap className="w-5 h-5 mr-2" />
            Create Account Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Trust indicators */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-purple-500" />
                <span>No spam</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}