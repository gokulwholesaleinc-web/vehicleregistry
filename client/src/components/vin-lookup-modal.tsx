import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Car, PlusCircle } from "lucide-react";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { z } from "zod";

const vinLookupSchema = z.object({
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  currentMileage: z.number().min(0, "Mileage must be positive").optional()
});

const draftVehicleSchema = insertVehicleSchema.extend({
  year: z.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  currentMileage: z.number().min(0, "Mileage must be positive").optional()
});

interface VinDecodeResult {
  vehicle: {
    make: string;
    model: string;
    modelYear: number;
    trim?: string;
    engine: string;
    transmission: string;
    fuelType: string;
    bodyClass: string;
    driveType: string;
    confidence?: number;
  };
  aiInsights?: any;
}

export function VinLookupModal() {
  const [open, setOpen] = useState(false);
  const [vinData, setVinData] = useState<VinDecodeResult | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vinForm = useForm<z.infer<typeof vinLookupSchema>>({
    resolver: zodResolver(vinLookupSchema),
    defaultValues: {
      vin: "",
      currentMileage: 0
    }
  });

  const draftForm = useForm<z.infer<typeof draftVehicleSchema>>({
    resolver: zodResolver(draftVehicleSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      make: "",
      model: "",
      trim: "",
      color: "",
      currentMileage: 0,
      isDraft: true,
      autoFilled: false
    }
  });

  const vinDecodeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vinLookupSchema>) => {
      setIsLookingUp(true);
      try {
        const result = await api('/vin/decode', { 
          method: 'POST', 
          body: JSON.stringify({ 
            vin: data.vin, 
            mileage: data.currentMileage 
          }) 
        });
        return result.data;
      } finally {
        setIsLookingUp(false);
      }
    },
    onSuccess: (data) => {
      setVinData(data);
      toast({
        title: "VIN Decoded Successfully",
        description: `Found ${data.vehicle.modelYear} ${data.vehicle.make} ${data.vehicle.model}${data.aiInsights ? ' with AI insights' : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: "VIN Decode Failed",
        description: error instanceof Error ? error.message : "Unable to decode VIN",
        variant: "destructive",
      });
    }
  });

  const createFromVinMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vinLookupSchema>) => {
      return await api('/vehicles/create-from-vin', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setOpen(false);
      setVinData(null);
      vinForm.reset();
      toast({
        title: "Vehicle Created",
        description: data.message || "Vehicle created successfully with AI data",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Vehicle",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const createDraftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof draftVehicleSchema>) => {
      return await api('/vehicles/create-draft', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setOpen(false);
      draftForm.reset();
      toast({
        title: "Draft Vehicle Created",
        description: data.message || "Draft vehicle created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Draft",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleVinLookup = (data: z.infer<typeof vinLookupSchema>) => {
    vinDecodeMutation.mutate(data);
  };

  const handleCreateFromVin = () => {
    const vinFormData = vinForm.getValues();
    createFromVinMutation.mutate(vinFormData);
  };

  const handleCreateDraft = (data: z.infer<typeof draftVehicleSchema>) => {
    createDraftMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-add-vehicle">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Create a vehicle profile using VIN lookup or manual entry
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="vin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vin" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              VIN Lookup
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered VIN Decode
                </CardTitle>
                <CardDescription>
                  Enter your VIN number and let AI automatically fill in vehicle details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...vinForm}>
                  <form onSubmit={vinForm.handleSubmit(handleVinLookup)} className="space-y-4">
                    <FormField
                      control={vinForm.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 17-character VIN" 
                              maxLength={17}
                              className="uppercase"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              data-testid="input-vin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={vinForm.control}
                      name="currentMileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Mileage (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter current mileage"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              data-testid="input-mileage"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isLookingUp || vinDecodeMutation.isPending}
                      className="w-full"
                      data-testid="button-decode-vin"
                    >
                      {isLookingUp || vinDecodeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Decoding VIN...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Decode VIN
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
                
                {vinData?.vehicle && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Decoded Vehicle Information</h3>
                      <Badge variant={(vinData.vehicle.confidence || 0.9) > 0.8 ? "default" : "secondary"}>
                        {Math.round((vinData.vehicle.confidence || 0.9) * 100)}% Confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Year</p>
                        <p data-testid="text-decoded-year">{vinData.vehicle.modelYear}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Make</p>
                        <p data-testid="text-decoded-make">{vinData.vehicle.make}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Model</p>
                        <p data-testid="text-decoded-model">{vinData.vehicle.model}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Trim</p>
                        <p data-testid="text-decoded-trim">{vinData.vehicle.trim || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Engine</p>
                        <p data-testid="text-decoded-engine">{vinData.vehicle.engine}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Transmission</p>
                        <p data-testid="text-decoded-transmission">{vinData.vehicle.transmission}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreateFromVin}
                      disabled={createFromVinMutation.isPending}
                      className="w-full mt-4"
                      data-testid="button-create-from-vin"
                    >
                      {createFromVinMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Vehicle...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-4 w-4" />
                          Create Vehicle with AI Data
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Manual Vehicle Entry
                </CardTitle>
                <CardDescription>
                  Create a draft vehicle profile without a VIN (you can add the VIN later)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...draftForm}>
                  <form onSubmit={draftForm.handleSubmit(handleCreateDraft)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={draftForm.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="2024"
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
                        control={draftForm.control}
                        name="currentMileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Mileage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="25000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-draft-mileage"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={draftForm.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Toyota, Honda, Ford, etc."
                              {...field}
                              data-testid="input-make"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={draftForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Camry, Civic, F-150, etc."
                              {...field}
                              data-testid="input-model"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={draftForm.control}
                        name="trim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trim (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="XLE, Sport, Limited, etc."
                                {...field}
                                value={field.value || ""}
                                data-testid="input-trim"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={draftForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Red, Blue, Silver, etc."
                                {...field}
                                value={field.value || ""}
                                data-testid="input-color"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createDraftMutation.isPending}
                      className="w-full"
                      data-testid="button-create-draft"
                    >
                      {createDraftMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Draft...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-4 w-4" />
                          Create Draft Vehicle
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}