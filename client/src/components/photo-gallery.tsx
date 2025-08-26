import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { type Modification, type MaintenanceRecord } from "@shared/schema";

interface PhotoGalleryProps {
  vehicleId: string;
}

export default function PhotoGallery({ vehicleId }: PhotoGalleryProps) {
  const { data: modifications = [] } = useQuery<Modification[]>({
    queryKey: ["/api/v1/vehicles", vehicleId, "modifications"],
    enabled: !!vehicleId,
  });

  const { data: maintenanceRecords = [] } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/v1/vehicles", vehicleId, "maintenance"],
    enabled: !!vehicleId,
  });

  // Collect all photos from modifications and maintenance records
  const allPhotos = [
    ...modifications.flatMap(mod => mod.photos || []),
    ...maintenanceRecords.flatMap(record => record.photos || [])
  ];

  const recentPhotos = allPhotos.slice(0, 6);

  const handleUploadClick = () => {
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log("Files selected:", files);
        // TODO: Handle file upload
      }
    };
    input.click();
  };

  return (
    <Card data-testid="card-photo-gallery">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Photos</h3>
          <Button variant="link" className="text-automotive-blue-600 hover:text-automotive-blue-700 p-0" data-testid="link-view-all-photos">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {recentPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Vehicle photo ${index + 1}`}
                className="w-full h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                data-testid={`img-gallery-photo-${index}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-steel-gray-600 text-sm mb-4" data-testid="text-no-photos">
            No photos uploaded yet
          </div>
        )}
        
        <Button
          onClick={handleUploadClick}
          variant="outline"
          className="w-full border-2 border-dashed border-gray-300 hover:border-automotive-blue-400 hover:bg-automotive-blue-50 py-8 h-auto"
          data-testid="button-upload-photos"
        >
          <div className="text-center">
            <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-steel-gray-600">Drag photos here or click to upload</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
