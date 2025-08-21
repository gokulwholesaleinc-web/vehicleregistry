import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, FileUp, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertModificationSchema, insertMaintenanceRecordSchema } from "@shared/schema";
import { z } from "zod";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  entryType: "modification" | "maintenance";
  onEntryTypeChange: (type: "modification" | "maintenance") => void;
}

const modificationFormSchema = insertModificationSchema.omit({ vehicleId: true });
const maintenanceFormSchema = insertMaintenanceRecordSchema.omit({ vehicleId: true });

type ModificationFormData = z.infer<typeof modificationFormSchema>;
type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;

export default function AddEntryModal({ 
  isOpen, 
  onClose, 
  vehicleId, 
  entryType, 
  onEntryTypeChange 
}: AddEntryModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const modificationForm = useForm<ModificationFormData>({
    resolver: zodResolver(modificationFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      cost: "0",
      installDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      status: "installed",
    },
  });

  const maintenanceForm = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      serviceType: "",
      description: "",
      cost: "0",
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      shop: "",
    },
  });

  const createModificationMutation = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const response = await fetch(`/api/vehicles/${vehicleId}/modifications`, {
        method: "POST",
        body: data.formData,
      });
      if (!response.ok) throw new Error("Failed to create modification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicleId] });
      onClose();
      resetForms();
      toast({
        title: "Modification added successfully",
        description: "Your modification has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding modification",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const response = await fetch(`/api/vehicles/${vehicleId}/maintenance`, {
        method: "POST",
        body: data.formData,
      });
      if (!response.ok) throw new Error("Failed to create maintenance record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicleId] });
      onClose();
      resetForms();
      toast({
        title: "Maintenance record added successfully",
        description: "Your maintenance record has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding maintenance record",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const resetForms = () => {
    modificationForm.reset();
    maintenanceForm.reset();
    setSelectedPhotos([]);
    setSelectedDocuments([]);
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleDocumentSelect = (files: FileList | null) => {
    if (files) {
      const newDocuments = Array.from(files);
      setSelectedDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const onModificationSubmit = (data: ModificationFormData) => {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() || '');
    });

    // Add files
    selectedPhotos.forEach(photo => {
      formData.append('photos', photo);
    });
    selectedDocuments.forEach(doc => {
      formData.append('documents', doc);
    });

    createModificationMutation.mutate({ formData });
  };

  const onMaintenanceSubmit = (data: MaintenanceFormData) => {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() || '');
    });

    // Add files
    selectedPhotos.forEach(photo => {
      formData.append('photos', photo);
    });
    selectedDocuments.forEach(doc => {
      formData.append('documents', doc);
    });

    createMaintenanceMutation.mutate({ formData });
  };

  const modificationCategories = [
    "Engine", "Exhaust", "Suspension", "Interior", "Exterior", "Wheels", "Brakes", "Electronics", "Performance", "Cosmetic"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-entry">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant={entryType === "modification" ? "default" : "outline"}
            onClick={() => onEntryTypeChange("modification")}
            className={entryType === "modification" ? "bg-automotive-blue-600 hover:bg-automotive-blue-700" : ""}
            data-testid="button-type-modification"
          >
            Modification
          </Button>
          <Button
            variant={entryType === "maintenance" ? "default" : "outline"}
            onClick={() => onEntryTypeChange("maintenance")}
            className={entryType === "maintenance" ? "bg-automotive-blue-600 hover:bg-automotive-blue-700" : ""}
            data-testid="button-type-maintenance"
          >
            Maintenance
          </Button>
        </div>

        {entryType === "modification" ? (
          <Form {...modificationForm}>
            <form onSubmit={modificationForm.handleSubmit(onModificationSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={modificationForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-modification-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modificationCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={modificationForm.control}
                  name="installDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Install Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-install-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={modificationForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Cold Air Intake Installation" data-testid="input-modification-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={modificationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={3} placeholder="Detailed description of the modification..." data-testid="textarea-modification-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={modificationForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" data-testid="input-modification-cost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={modificationForm.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="Current mileage" 
                          data-testid="input-modification-mileage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File upload sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-automotive-blue-400 hover:bg-automotive-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                    data-testid="input-photos"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-steel-gray-600">Drag photos here or click to upload</p>
                    <p className="text-sm text-steel-gray-500 mt-1">Support for JPG, PNG, WEBP up to 10MB each</p>
                  </label>
                </div>
                {selectedPhotos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedPhotos.map((photo, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{photo.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePhoto(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice/Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-automotive-blue-400 hover:bg-automotive-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleDocumentSelect(e.target.files)}
                    className="hidden"
                    id="document-upload"
                    data-testid="input-documents"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <FileUp className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-steel-gray-600">Upload invoices or documents</p>
                  </label>
                </div>
                {selectedDocuments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createModificationMutation.isPending}
                  className="bg-automotive-blue-600 hover:bg-automotive-blue-700"
                  data-testid="button-save-modification"
                >
                  {createModificationMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...maintenanceForm}>
            <form onSubmit={maintenanceForm.handleSubmit(onMaintenanceSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={maintenanceForm.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Oil Change, Brake Service" data-testid="input-service-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={maintenanceForm.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-service-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={maintenanceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={3} placeholder="Detailed description of the service..." data-testid="textarea-maintenance-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={maintenanceForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" data-testid="input-maintenance-cost" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={maintenanceForm.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="Current mileage" 
                          data-testid="input-maintenance-mileage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={maintenanceForm.control}
                  name="shop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Service location" data-testid="input-shop" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File upload sections - same as modification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-automotive-blue-400 hover:bg-automotive-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect(e.target.files)}
                    className="hidden"
                    id="maintenance-photo-upload"
                    data-testid="input-maintenance-photos"
                  />
                  <label htmlFor="maintenance-photo-upload" className="cursor-pointer">
                    <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-steel-gray-600">Drag photos here or click to upload</p>
                    <p className="text-sm text-steel-gray-500 mt-1">Support for JPG, PNG, WEBP up to 10MB each</p>
                  </label>
                </div>
                {selectedPhotos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedPhotos.map((photo, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{photo.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePhoto(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice/Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-automotive-blue-400 hover:bg-automotive-blue-50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleDocumentSelect(e.target.files)}
                    className="hidden"
                    id="maintenance-document-upload"
                    data-testid="input-maintenance-documents"
                  />
                  <label htmlFor="maintenance-document-upload" className="cursor-pointer">
                    <FileUp className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-steel-gray-600">Upload invoices or documents</p>
                  </label>
                </div>
                {selectedDocuments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMaintenanceMutation.isPending}
                  className="bg-automotive-blue-600 hover:bg-automotive-blue-700"
                  data-testid="button-save-maintenance"
                >
                  {createMaintenanceMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
