import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Upload, 
  ImageIcon, 
  Trash2, 
  Download, 
  ZoomIn,
  Grid3X3,
  Grid,
  Eye,
  Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VehiclePhoto {
  id: string;
  vehicleId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  urlCard?: string;
  urlThumb?: string;
  createdAt: string;
}

interface VehicleMediaPipelineProps {
  vehicleId: string;
}

export default function VehicleMediaPipeline({ vehicleId }: VehicleMediaPipelineProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<VehiclePhoto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch photos for this vehicle
  const { data: photosResponse, isLoading } = useQuery({
    queryKey: ['/api/v1/media/photos', vehicleId],
    queryFn: () => apiRequest('GET', `/api/v1/media/photos/${vehicleId}`),
  });

  const photos = photosResponse?.data?.data || [];

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch(`/api/v1/media/photos/${vehicleId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/media/photos', vehicleId] });
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Photo Uploaded",
        description: "Your photo has been successfully added to the gallery.",
      });
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => apiRequest('DELETE', `/api/v1/media/photos/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/media/photos', vehicleId] });
      setSelectedPhoto(null);
      toast({
        title: "Photo Deleted",
        description: "Photo has been successfully removed from your gallery.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, JPEG, WebP, or GIF).",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      uploadPhotoMutation.mutate(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading photos...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="vehicle-media-pipeline">
      {/* Header with Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Gallery
              </CardTitle>
              <CardDescription>
                Upload and manage photos of your vehicle
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
                data-testid="button-toggle-view"
              >
                {viewMode === 'grid' ? <Grid className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} data-testid="button-upload-photo">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-photo-file"
              />
            </div>
          </div>
        </CardHeader>
        
        {isUploading && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading photo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} data-testid="progress-upload" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Photo Stats */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                  <p className="text-2xl font-bold" data-testid="text-total-photos">{photos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold" data-testid="text-total-size">
                    {formatFileSize(photos.reduce((sum: number, photo: VehiclePhoto) => sum + photo.size, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Latest Upload</p>
                  <p className="text-2xl font-bold" data-testid="text-latest-upload">
                    {photos.length > 0 ? new Date(photos[0].createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Photo Gallery */}
      <Card>
        <CardContent className="pt-6">
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No photos yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your vehicle's photo gallery by uploading your first image.
              </p>
              <Button onClick={() => fileInputRef.current?.click()} data-testid="button-upload-first-photo">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Photo
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                : "columns-2 md:columns-3 lg:columns-4 gap-4"
            }>
              {photos.map((photo: VehiclePhoto) => (
                <div 
                  key={photo.id} 
                  className={`group relative overflow-hidden rounded-lg bg-muted cursor-pointer hover:scale-105 transition-transform ${
                    viewMode === 'masonry' ? 'mb-4 break-inside-avoid' : 'aspect-square'
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                  data-testid={`photo-${photo.id}`}
                >
                  <img
                    src={photo.urlCard || photo.url}
                    alt={photo.originalName}
                    className={`w-full h-full object-cover transition-opacity group-hover:opacity-75 ${
                      viewMode === 'masonry' ? 'h-auto' : 'object-cover'
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoto(photo);
                        }}
                        data-testid={`button-view-photo-${photo.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhotoMutation.mutate(photo.id);
                        }}
                        disabled={deletePhotoMutation.isPending}
                        data-testid={`button-delete-photo-${photo.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Photo Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{photo.originalName}</p>
                    <p className="text-white/75 text-xs">{formatFileSize(photo.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedPhoto.originalName}</span>
                  <Badge variant="secondary">
                    {formatFileSize(selectedPhoto.size)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Uploaded on {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  {selectedPhoto.width && selectedPhoto.height && 
                    ` • ${selectedPhoto.width} × ${selectedPhoto.height} pixels`
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-hidden">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.originalName}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  data-testid="modal-photo-preview"
                />
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedPhoto.url;
                    link.download = selectedPhoto.originalName;
                    link.click();
                  }}
                  data-testid="button-download-photo"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deletePhotoMutation.mutate(selectedPhoto.id)}
                  disabled={deletePhotoMutation.isPending}
                  data-testid="button-delete-photo-modal"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}