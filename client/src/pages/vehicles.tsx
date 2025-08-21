import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import VehicleSelector from "@/components/vehicle-selector";
import { VinLookupModal } from "@/components/vin-lookup-modal";
import VehicleDetailsModal from "@/components/vehicle-details-modal";
import UserProfileModal from "@/components/user-profile-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Car, FileText, Sparkles, Plus, Calendar, Wrench } from "lucide-react";
import { format } from "date-fns";
import { type Vehicle } from "@shared/schema";

export default function VehiclesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const handleAddEntry = () => {
    // Placeholder for add entry functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <AppHeader 
        onAddEntry={handleAddEntry}
      />
      
      <div className="container-responsive py-6 lg:py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your vehicle fleet, add new vehicles, and view detailed information
              </p>
            </div>
            <VinLookupModal />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start building your vehicle registry by adding your first vehicle
              </p>
              <VinLookupModal />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <VehicleSelector 
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={setSelectedVehicleId}
              onOpenVehicleDetails={() => setIsVehicleDetailsModalOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      data-testid={`vehicle-card-${vehicle.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </CardTitle>
                      <div className="flex gap-1">
                        {vehicle.isDraft && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                        {vehicle.autoFilled && (
                          <Badge variant="default" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                        <span className="font-mono text-xs">
                          {vehicle.vin ? vehicle.vin.slice(-8) : "No VIN"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                        <span className="font-semibold">
                          {vehicle.currentMileage?.toLocaleString() || 'Not set'}
                        </span>
                      </div>

                      {vehicle.trim && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Trim:</span>
                          <span>{vehicle.trim}</span>
                        </div>
                      )}

                      {vehicle.color && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Color:</span>
                          <span>{vehicle.color}</span>
                        </div>
                      )}

                      {vehicle.lastServiceDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Last Service:</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {vehicle.lastServiceDate}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Added:</span>
                        <span>
                          {format(new Date(vehicle.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Wrench className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Entry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <VehicleDetailsModal 
          isOpen={isVehicleDetailsModalOpen}
          onClose={() => setIsVehicleDetailsModalOpen(false)}
          vehicleId={selectedVehicleId}
        />

        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
        />
      </div>
    </div>
  );
}