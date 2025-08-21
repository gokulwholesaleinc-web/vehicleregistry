import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, Wrench, Camera, DollarSign, MapPin, Fuel, Settings, Edit3, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertVehicleSchema, type Vehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
}

const updateVehicleSchema = insertVehicleSchema.partial().omit({ vin: true });
type UpdateVehicleData = z.infer<typeof updateVehicleSchema>;

export default function VehicleDetailsModal({ isOpen, onClose, vehicleId }: VehicleDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    enabled: isOpen && !!vehicleId,
  });

  const { data: modifications = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles", vehicleId, "modifications"],
    enabled: isOpen && !!vehicleId,
  });

  const { data: maintenanceRecords = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles", vehicleId, "maintenance"],
    enabled: isOpen && !!vehicleId,
  });

  const form = useForm<UpdateVehicleData>({
    resolver: zodResolver(updateVehicleSchema),
    defaultValues: {
      year: vehicle?.year || new Date().getFullYear(),
      make: vehicle?.make || "",
      model: vehicle?.model || "",
      trim: vehicle?.trim || "",
      color: vehicle?.color || "",
      currentMileage: vehicle?.currentMileage || 0,
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: UpdateVehicleData) => {
      const response = await apiRequest("PATCH", `/api/vehicles/${vehicleId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsEditing(false);
      toast({
        title: "Vehicle updated successfully",
        description: "Your vehicle details have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating vehicle",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateVehicleData) => {
    updateVehicleMutation.mutate(data);
  };

  const handleEditToggle = () => {
    if (isEditing && vehicle) {
      form.reset({
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim || "",
        color: vehicle.color || "",
        currentMileage: vehicle.currentMileage,
      });
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vehicle) return null;

  const totalCost = [...modifications, ...maintenanceRecords].reduce((sum, item) => {
    return sum + parseFloat(item.cost || "0");
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-vehicle-details">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="mobile-heading">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditToggle}
            className="interactive-scale"
            data-testid="button-edit-vehicle"
          >
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modifications">Modifications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="touch-friendly"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input {...field} className="touch-friendly" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} className="touch-friendly" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="trim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trim (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} className="touch-friendly" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} className="touch-friendly" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currentMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Mileage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="touch-friendly"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateVehicleMutation.isPending}
                      className="btn-primary touch-friendly"
                      data-testid="button-save-vehicle"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateVehicleMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">VIN</p>
                        <p className="font-mono text-sm">{vehicle.vin}</p>
                      </div>
                    </div>
                    {vehicle.trim && (
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Trim</p>
                          <p className="font-medium">{vehicle.trim}</p>
                        </div>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Color</p>
                          <p className="font-medium">{vehicle.color}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Mileage</p>
                        <p className="font-medium">{vehicle.currentMileage.toLocaleString()} miles</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Added</p>
                        <p className="font-medium">{new Date(vehicle.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="modifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Modifications</h3>
              <Badge variant="secondary">{modifications.length} total</Badge>
            </div>
            {modifications.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No modifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modifications.map((mod: any) => (
                  <div key={mod.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{mod.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{mod.category}</p>
                        <p className="text-sm mt-1">{mod.description}</p>
                      </div>
                      <Badge variant="outline">${parseFloat(mod.cost).toFixed(2)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Maintenance Records</h3>
              <Badge variant="secondary">{maintenanceRecords.length} records</Badge>
            </div>
            {maintenanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No maintenance records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceRecords.map((record: any) => (
                  <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{record.serviceType}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{record.shop}</p>
                        <p className="text-sm mt-1">{record.description}</p>
                      </div>
                      <Badge variant="outline">${parseFloat(record.cost).toFixed(2)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Investment</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">${totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Modifications</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">{modifications.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Maintenance</p>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{maintenanceRecords.length}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Vehicle Age</p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      {new Date().getFullYear() - vehicle.year} years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}