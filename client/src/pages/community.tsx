import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Vehicle } from "@shared/schema";

export default function Community() {
  const { isAuthenticated } = useAuth();
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/community/vehicles", { limit, offset }],
    enabled: true,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view the community</h1>
          <Button onClick={() => window.location.href = '/api/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Community Builds
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Discover amazing builds from fellow enthusiasts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {vehicles.length} public vehicles
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No public vehicles yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share your build with the community!
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span data-testid={`text-vehicle-${vehicle.id}`}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                      <Badge variant="secondary">Public</Badge>
                    </CardTitle>
                    <CardDescription>
                      VIN: {vehicle.vin.slice(-6)}
                      {vehicle.trim && ` • ${vehicle.trim}`}
                      {vehicle.color && ` • ${vehicle.color}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>{vehicle.currentMileage.toLocaleString()} miles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                data-testid="button-previous-page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={vehicles.length < limit}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}