import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles } from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { api } from "@/lib/api";

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onVehicleSelect: (vehicleId: string) => void;
  onOpenVehicleDetails?: () => void;
}

export default function VehicleSelector({ selectedVehicleId, onVehicleSelect, onOpenVehicleDetails }: VehicleSelectorProps) {
  const { data: vehiclesResponse, isLoading } = useQuery({
    queryKey: ["/api/v1/vehicles"],
  });

  const vehicles = (vehiclesResponse as any)?.data || [];

  const selectedVehicle = vehicles.find((v: Vehicle) => v.id === selectedVehicleId);

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern mb-6 lg:mb-8" data-testid="card-vehicle-selector">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            {selectedVehicle && (
              <>
                <div className="w-16 h-12 sm:w-20 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0 overflow-hidden">
                  {selectedVehicle.photos && selectedVehicle.photos.length > 0 ? (
                    <img 
                      src={selectedVehicle.photos[0]} 
                      alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-full object-cover"
                      data-testid="img-vehicle-profile"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <button 
                    onClick={onOpenVehicleDetails}
                    className="mobile-heading sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer focus:outline-none focus:underline" 
                    data-testid="text-vehicle-name"
                  >
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedVehicle.isDraft && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate" data-testid="text-vehicle-vin">
                    {selectedVehicle.vin ? `VIN: ${selectedVehicle.vin}` : "No VIN (Draft Vehicle)"}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Mileage: <span className="font-medium text-blue-600 dark:text-blue-400" data-testid="text-current-mileage">
                        {selectedVehicle.currentMileage?.toLocaleString() || 'Not set'}
                      </span>
                    </span>
                    {selectedVehicle.lastServiceDate && (
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Last Service: <span className="font-medium text-green-600 dark:text-green-400" data-testid="text-last-service">
                          {selectedVehicle.lastServiceDate}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Select value={selectedVehicleId} onValueChange={onVehicleSelect}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" data-testid="select-vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle: Vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                      <div className="flex gap-1 ml-2">
                        {vehicle.isDraft && (
                          <Badge variant="secondary" className="text-xs px-1">
                            Draft
                          </Badge>
                        )}
                        {vehicle.autoFilled && (
                          <Badge variant="default" className="text-xs px-1">
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}