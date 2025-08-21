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
}

export default function VehicleSelector({ selectedVehicleId, onVehicleSelect }: VehicleSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in real app this would come from auth
  const userId = "mock-user-id";

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
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
      userId,
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
    <Card className="mb-8" data-testid="card-vehicle-selector">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-6 mb-4 lg:mb-0">
            {selectedVehicle && (
              <>
                <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" data-testid="text-vehicle-name">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-steel-gray-600" data-testid="text-vehicle-vin">
                    VIN: {selectedVehicle.vin}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-steel-gray-500">
                      Mileage: <span className="font-medium" data-testid="text-current-mileage">
                        {selectedVehicle.currentMileage.toLocaleString()}
                      </span>
                    </span>
                    {selectedVehicle.lastServiceDate && (
                      <span className="text-sm text-steel-gray-500">
                        Last Service: <span className="font-medium" data-testid="text-last-service">
                          {selectedVehicle.lastServiceDate}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedVehicleId} onValueChange={onVehicleSelect}>
              <SelectTrigger className="w-[200px]" data-testid="select-vehicle">
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
                  className="bg-automotive-blue-600 text-white hover:bg-automotive-blue-700"
                  data-testid="button-add-vehicle"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                              <Input {...field} data-testid="input-make" />
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
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-vin" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
