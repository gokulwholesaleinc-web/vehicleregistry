import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertVehicleSchema, type Vehicle, type InsertVehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onVehicleSelect: (vehicleId: string) => void;
  onOpenVehicleDetails?: () => void;
}

export default function VehicleSelector({ selectedVehicleId, onVehicleSelect, onOpenVehicleDetails }: VehicleSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      make: "",
      model: "",
      vin: "",
      currentMileage: 0,
      lastServiceDate: "",
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      onVehicleSelect(newVehicle.id);
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Vehicle added successfully",
        description: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding vehicle",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    createVehicleMutation.mutate(data);
  };

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
                <div className="w-16 h-12 sm:w-20 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
                </div>
                <div className="text-center sm:text-left">
                  <button 
                    onClick={onOpenVehicleDetails}
                    className="mobile-heading sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer focus:outline-none focus:underline" 
                    data-testid="text-vehicle-name"
                  >
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate" data-testid="text-vehicle-vin">
                    VIN: {selectedVehicle.vin}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Mileage: <span className="font-medium text-blue-600 dark:text-blue-400" data-testid="text-current-mileage">
                        {selectedVehicle.currentMileage.toLocaleString()}
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
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="btn-primary w-full sm:w-auto touch-friendly"
                  data-testid="button-add-vehicle"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Vehicle</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="mobile-heading">Add New Vehicle</DialogTitle>
                </DialogHeader>
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
                                data-testid="input-year"
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
                              <Input {...field} data-testid="input-make" className="touch-friendly" />
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
                            <Input {...field} data-testid="input-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN (Required - must be unique)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-vin" placeholder="Enter 17-character VIN" maxLength={17} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="trim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trim (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} placeholder="e.g., EX-L, Sport" data-testid="input-trim" className="touch-friendly" />
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
                              <Input {...field} value={field.value || ''} placeholder="e.g., Red, Blue" data-testid="input-color" className="touch-friendly" />
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
                              data-testid="input-mileage"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createVehicleMutation.isPending}
                        className="bg-automotive-blue-600 hover:bg-automotive-blue-700"
                        data-testid="button-save-vehicle"
                      >
                        {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
