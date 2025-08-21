import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Car, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);

  const handleSignInSuccess = () => {
    // Redirect to dashboard after successful sign in
    window.location.href = "/";
  };

  const handleSignInError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex flex-col">
      {/* Header with back link */}
      <div className="p-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center space-x-3">
                <img 
                  src="@assets/file_00000000a83861fd87d61a9ade71888e_1755754560399.png" 
                  alt="VINtage Garage Registry Logo" 
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="text-blue-900 dark:text-blue-100">VIN</span>
                    <span className="text-orange-500">tage</span>
                    <span className="text-orange-500">Garage</span>
                  </h1>
                  <div className="text-xs text-gray-600 dark:text-gray-400 -mt-1 tracking-wider font-medium">
                    REGISTRY
                  </div>
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to your VINtage Garage Registry account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <GoogleSignInButton 
                onSuccess={handleSignInSuccess}
                onError={handleSignInError}
              />
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                New to VINtage Garage Registry?{" "}
                <span className="font-medium">Sign in with Google to get started!</span>
              </div>
              
              <div className="text-center text-xs text-gray-500 dark:text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}