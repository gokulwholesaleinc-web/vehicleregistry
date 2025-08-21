import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import type { Vehicle } from "@shared/schema";

export default function Community() {
  const { isAuthenticated } = useAuth();
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const breadcrumbs = useBreadcrumbs();

  const handleAddEntry = () => {
    // Placeholder for add entry functionality
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <AppHeader onAddEntry={handleAddEntry} />
      <div className="container-responsive py-6 lg:py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>
        
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="interactive-scale w-full sm:w-auto" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-center sm:text-left">
              <h1 className="heading-lg sm:text-2xl lg:text-3xl text-gray-900 dark:text-white">
                Community Builds
              </h1>
              <p className="mobile-text text-gray-600 dark:text-gray-300">
                Discover amazing builds from fellow enthusiasts
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {vehicles.length} public vehicles
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="card-modern">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="card-modern card-hover cursor-pointer group">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                      <span className="truncate mr-2" data-testid={`text-vehicle-${vehicle.id}`}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Public
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      VIN: {vehicle.vin.slice(-6)}
                      {vehicle.trim && ` • ${vehicle.trim}`}
                      {vehicle.color && ` • ${vehicle.color}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                        <span>{vehicle.currentMileage.toLocaleString()} miles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                        <span>{new Date(vehicle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="w-full sm:w-auto touch-friendly"
                data-testid="button-previous-page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={vehicles.length < limit}
                className="w-full sm:w-auto touch-friendly"
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