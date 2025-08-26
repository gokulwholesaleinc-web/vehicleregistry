import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Breadcrumb, useBreadcrumbs } from "@/components/breadcrumb";
import VehicleSelector from "@/components/vehicle-selector";
import { VinLookupModal } from "@/components/vin-lookup-modal";
import VehicleDetailsModal from "@/components/vehicle-details-modal";
import EditVehicleModal from "@/components/edit-vehicle-modal";
import AddEntryModal from "@/components/add-entry-modal";
import UserProfileModal from "@/components/user-profile-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, FileText, Sparkles, Plus, Calendar, Wrench, Edit, Camera, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { type Vehicle } from "@shared/schema";
import { api } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function VehiclesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [vehicleForEntry, setVehicleForEntry] = useState<Vehicle | null>(null);
  const [entryType, setEntryType] = useState<"modification" | "maintenance">("modification");
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/v1/vehicles"],
    queryFn: () => api('/vehicles').then(r => r.data),
  });

  const handleAddEntry = (vehicle: Vehicle) => {
    setVehicleForEntry(vehicle);
    setIsAddEntryModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsEditVehicleModalOpen(true);
  };

  // Privacy toggle mutation
  const togglePrivacyMutation = useMutation({
    mutationFn: async ({ vehicleId, isPublic }: { vehicleId: string; isPublic: boolean }) => {
      const response = await apiRequest('PATCH', `/api/v1/vehicles/${vehicleId}`, { isPublic });
      return { data: await response.json(), vehicleId };
    },
    onSuccess: ({ vehicleId }) => {
      // Invalidate both list and individual vehicle caches
      queryClient.invalidateQueries({ queryKey: ["/api/v1/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/vehicles", vehicleId] });
      // Also invalidate community data since privacy affects public visibility
      queryClient.invalidateQueries({ queryKey: ["/api/v1/community"] });
      toast({
        title: "Privacy Updated",
        description: "Vehicle privacy setting has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy setting",
        variant: "destructive",
      });
    },
  });

  const handlePrivacyToggle = (vehicle: Vehicle) => {
    togglePrivacyMutation.mutate({
      vehicleId: vehicle.id,
      isPublic: !vehicle.isPublic
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <AppHeader />
      
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
                        {vehicle.photos && vehicle.photos.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Camera className="h-3 w-3 mr-1" />
                            {vehicle.photos.length}
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

                      {/* Privacy Toggle */}
                      <div className="flex items-center justify-between text-sm pt-3 mt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-6 -mb-6 px-6 pb-4 rounded-b-lg">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center font-medium">
                          {vehicle.isPublic ? (
                            <Globe className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Lock className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                          )}
                          <span className={vehicle.isPublic ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}>
                            {vehicle.isPublic ? 'Public' : 'Private'}
                          </span>
                        </span>
                        <div className="flex items-center space-x-2">
                          {togglePrivacyMutation.isPending && (
                            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                          )}
                          <Switch
                            checked={vehicle.isPublic}
                            onCheckedChange={() => handlePrivacyToggle(vehicle)}
                            disabled={togglePrivacyMutation.isPending}
                            data-testid={`switch-privacy-${vehicle.id}`}
                            aria-label={`Toggle ${vehicle.year} ${vehicle.make} ${vehicle.model} privacy`}
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-amber-200 dark:data-[state=unchecked]:bg-amber-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Link href={`/vehicles/${vehicle.id}`} className="col-span-2">
                          <Button size="sm" variant="outline" className="w-full" data-testid={`button-details-${vehicle.id}`}>
                            <Wrench className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVehicle(vehicle);
                          }}
                          data-testid={`button-edit-${vehicle.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddEntry(vehicle);
                          }}
                          data-testid={`button-add-entry-${vehicle.id}`}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Entry
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

        <EditVehicleModal
          isOpen={isEditVehicleModalOpen}
          onClose={() => {
            setIsEditVehicleModalOpen(false);
            setVehicleToEdit(null);
          }}
          vehicle={vehicleToEdit}
        />

        <AddEntryModal
          isOpen={isAddEntryModalOpen}
          onClose={() => {
            setIsAddEntryModalOpen(false);
            setVehicleForEntry(null);
          }}
          vehicleId={vehicleForEntry?.id || ""}
          entryType={entryType}
          onEntryTypeChange={setEntryType}
        />

        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
        />
      </div>
    </div>
  );
}