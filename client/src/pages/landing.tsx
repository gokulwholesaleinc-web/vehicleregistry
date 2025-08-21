import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, History, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            CarTracker Pro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate community-driven platform for car enthusiasts. Track your modifications, 
            maintenance, and connect with fellow enthusiasts who share your passion.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Car className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>VIN-Based Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each vehicle has a unique profile tied to its VIN that preserves 
                complete history even when ownership changes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share your builds publicly and discover other enthusiasts' 
                modifications and maintenance records.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <History className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle>Ownership History</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete ownership tracking with the ability for previous owners 
                to see new modifications if current owner allows.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
              <CardTitle>Secure Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Safe vehicle ownership transfers with verification codes 
                and complete history preservation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Community
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Connect with meticulous car enthusiasts who value detailed records and quality builds.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-join-community"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}