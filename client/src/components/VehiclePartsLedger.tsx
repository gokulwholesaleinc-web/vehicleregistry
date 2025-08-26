import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Plus, 
  Wrench, 
  Calendar, 
  DollarSign, 
  Package, 
  Edit3, 
  Trash2,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VehiclePart {
  id: string;
  vehicleId: string;
  userId: string;
  title: string;
  vendor?: string;
  partNo?: string;
  costCents?: number;
  installedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VehiclePartsLedgerProps {
  vehicleId: string;
}

const partSchema = z.object({
  title: z.string().min(1, "Title is required"),
  vendor: z.string().optional(),
  partNo: z.string().optional(),
  costCents: z.string().optional(),
  installedAt: z.string().optional(),
  notes: z.string().optional(),
});

type PartFormData = z.infer<typeof partSchema>;

export default function VehiclePartsLedger({ vehicleId }: VehiclePartsLedgerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<VehiclePart | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      title: "",
      vendor: "",
      partNo: "",
      costCents: "",
      installedAt: "",
      notes: "",
    },
  });

  // Fetch parts for this vehicle
  const { data: partsResponse, isLoading } = useQuery({
    queryKey: ['/api/v1/parts', vehicleId],
    queryFn: () => apiRequest('GET', `/api/v1/parts/${vehicleId}`),
  });

  const parts = partsResponse?.data?.data || [];

  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: (data: PartFormData) => {
      const payload = {
        ...data,
        costCents: data.costCents ? parseInt(data.costCents) : undefined,
      };
      return apiRequest('POST', `/api/v1/parts/${vehicleId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/parts', vehicleId] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Part Added",
        description: "Vehicle part has been successfully added to your ledger.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add part",
        variant: "destructive",
      });
    },
  });

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: ({ partId, data }: { partId: string; data: PartFormData }) => {
      const payload = {
        ...data,
        costCents: data.costCents ? parseInt(data.costCents) : undefined,
      };
      return apiRequest('PATCH', `/api/v1/parts/${partId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/parts', vehicleId] });
      setEditingPart(null);
      form.reset();
      toast({
        title: "Part Updated",
        description: "Vehicle part has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update part",
        variant: "destructive",
      });
    },
  });

  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: string) => apiRequest('DELETE', `/api/v1/parts/${partId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/parts', vehicleId] });
      toast({
        title: "Part Deleted",
        description: "Vehicle part has been successfully removed from your ledger.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete part",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PartFormData) => {
    if (editingPart) {
      updatePartMutation.mutate({ partId: editingPart.id, data });
    } else {
      createPartMutation.mutate(data);
    }
  };

  const handleEdit = (part: VehiclePart) => {
    setEditingPart(part);
    form.reset({
      title: part.title,
      vendor: part.vendor || "",
      partNo: part.partNo || "",
      costCents: part.costCents ? part.costCents.toString() : "",
      installedAt: part.installedAt ? part.installedAt.split('T')[0] : "",
      notes: part.notes || "",
    });
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setEditingPart(null);
    form.reset();
  };

  const formatCurrency = (cents?: number) => {
    if (!cents) return "-";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const totalCost = parts.reduce((sum: number, part: VehiclePart) => {
    return sum + (part.costCents || 0);
  }, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Parts Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading parts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="vehicle-parts-ledger">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Parts Ledger
            </CardTitle>
            <CardDescription>
              Track installed parts, upgrades, and modifications with costs
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen || !!editingPart} onOpenChange={(open) => {
            if (!open) handleCancel();
            else setIsAddDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-part">
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPart ? "Edit Part" : "Add New Part"}
                </DialogTitle>
                <DialogDescription>
                  {editingPart ? "Update the part details below." : "Add a new part to your vehicle's ledger."}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Cold Air Intake, Exhaust System"
                            data-testid="input-part-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Brand</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., K&N, Borla" data-testid="input-part-vendor" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="partNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 57-3509" data-testid="input-part-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="costCents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              placeholder="299.99" 
                              data-testid="input-part-cost"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="installedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Install Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-part-install-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Installation notes, performance improvements, etc."
                            rows={3}
                            data-testid="input-part-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPartMutation.isPending || updatePartMutation.isPending}
                      data-testid="button-save-part"
                    >
                      {createPartMutation.isPending || updatePartMutation.isPending ? "Saving..." : 
                       editingPart ? "Update Part" : "Add Part"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {parts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No parts added yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your parts ledger by adding your first modification or upgrade.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-part">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Part
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Parts</p>
                      <p className="text-2xl font-bold" data-testid="text-total-parts">{parts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investment</p>
                      <p className="text-2xl font-bold" data-testid="text-total-cost">
                        {formatCurrency(totalCost)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Part Cost</p>
                      <p className="text-2xl font-bold" data-testid="text-avg-cost">
                        {parts.length > 0 ? formatCurrency(Math.round(totalCost / parts.length)) : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            {/* Parts List */}
            <div className="space-y-3">
              {parts.map((part: VehiclePart) => (
                <Card key={part.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold" data-testid={`text-part-title-${part.id}`}>
                            {part.title}
                          </h4>
                          {part.vendor && (
                            <Badge variant="secondary" data-testid={`badge-vendor-${part.id}`}>
                              {part.vendor}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          {part.partNo && (
                            <div>
                              <span className="font-medium">Part #:</span> {part.partNo}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Cost:</span> {formatCurrency(part.costCents)}
                          </div>
                          {part.installedAt && (
                            <div>
                              <span className="font-medium">Installed:</span>{" "}
                              {format(new Date(part.installedAt), 'MMM d, yyyy')}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Added:</span>{" "}
                            {format(new Date(part.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                        
                        {part.notes && (
                          <p className="mt-2 text-sm text-muted-foreground" data-testid={`text-part-notes-${part.id}`}>
                            {part.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(part)}
                          data-testid={`button-edit-part-${part.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePartMutation.mutate(part.id)}
                          disabled={deletePartMutation.isPending}
                          data-testid={`button-delete-part-${part.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}