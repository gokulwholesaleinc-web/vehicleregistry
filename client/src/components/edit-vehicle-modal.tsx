import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, X, Camera } from "lucide-react";
import { type Vehicle } from "@shared/schema";

const editVehicleSchema = z.object({
  color: z.string().optional(),
  currentMileage: z.coerce.number().min(0).optional(),
  lastServiceDate: z.string().optional(),
});

type EditVehicleData = z.infer<typeof editVehicleSchema>;

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function EditVehicleModal({ isOpen, onClose, vehicle }: EditVehicleModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditVehicleData>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {
      color: "",
      currentMileage: 0,
      lastServiceDate: "",
    },
  });

  // Update form when vehicle changes
  useEffect(() => {
    if (vehicle) {
      form.reset({
        color: vehicle.color || "",
        currentMileage: vehicle.currentMileage || 0,
        lastServiceDate: vehicle.lastServiceDate || "",
      });
      setExistingPhotos(vehicle.photos || []);
    }
  }, [vehicle, form]);

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: EditVehicleData & { photos?: File[] }) => {
      if (!vehicle) throw new Error('No vehicle selected');
      
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photos' && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Add photo files
      selectedPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch(`/api/v1/vehicles/${vehicle.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vehicle updated",
        description: "Your vehicle information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/vehicles"] });
      onClose();
      form.reset();
      setSelectedPhotos([]);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoSelect = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        
        if (!isImage) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files.",
            variant: "destructive",
          });
        }
        if (!isValidSize) {
          toast({
            title: "File too large",
            description: "Please select images smaller than 10MB.",
            variant: "destructive",
          });
        }
        
        return isImage && isValidSize;
      });
      
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  const onSubmit = (data: EditVehicleData) => {
    updateVehicleMutation.mutate({ ...data, photos: selectedPhotos });
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {vehicle.year} {vehicle.make} {vehicle.model}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...form.register("color")}
                placeholder="e.g., Metallic Blue"
                data-testid="input-color"
              />
            </div>

            <div>
              <Label htmlFor="currentMileage">Current Mileage</Label>
              <Input
                id="currentMileage"
                type="number"
                {...form.register("currentMileage")}
                placeholder="e.g., 45000"
                data-testid="input-mileage"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="lastServiceDate">Last Service Date</Label>
              <Input
                id="lastServiceDate"
                type="date"
                {...form.register("lastServiceDate")}
                data-testid="input-service-date"
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div>
            <Label className="text-base font-medium">Vehicle Photos</Label>
            
            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Photos:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {existingPhotos.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingPhoto(photoUrl)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Upload Area */}
            <Card className="border-2 border-dashed hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <CardContent className="p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                  data-testid="input-vehicle-photos"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">Add new photos or click to upload</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP up to 10MB each</p>
                </label>
              </CardContent>
            </Card>

            {/* New Photos Preview */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">New Photos to Upload:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`New photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Non-Editable Fields (NHTSA Data) */}
          <div>
            <Label className="text-base font-medium text-gray-700">Vehicle Specifications (From VIN)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Make:</span> {vehicle.make}
              </div>
              <div className="text-sm">
                <span className="font-medium">Model:</span> {vehicle.model}
              </div>
              <div className="text-sm">
                <span className="font-medium">Year:</span> {vehicle.year}
              </div>
              {vehicle.transmission && (
                <div className="text-sm">
                  <span className="font-medium">Transmission:</span> {vehicle.transmission}
                </div>
              )}
              {vehicle.engine && (
                <div className="text-sm">
                  <span className="font-medium">Engine:</span> {vehicle.engine}
                </div>
              )}
              {vehicle.fuelType && (
                <div className="text-sm">
                  <span className="font-medium">Fuel Type:</span> {vehicle.fuelType}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateVehicleMutation.isPending}
              data-testid="button-save"
            >
              {updateVehicleMutation.isPending ? (
                <>
                  <Camera className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Update Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}