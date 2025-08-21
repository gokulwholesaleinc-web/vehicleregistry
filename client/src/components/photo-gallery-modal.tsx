import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Download, Share, Trash2, ZoomIn, ZoomOut } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  entryType?: "modification" | "maintenance";
  entryTitle?: string;
  uploadDate: string;
}

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  initialPhotoIndex?: number;
}

export default function PhotoGalleryModal({ 
  isOpen, 
  onClose, 
  photos, 
  initialPhotoIndex = 0 
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!photos.length) return null;

  const currentPhoto = photos[currentIndex];

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setIsZoomed(false);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsZoomed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] h-[95vh] max-w-6xl p-0 bg-black/95 backdrop-blur-xl border-gray-800"
        onKeyDown={handleKeyDown}
        data-testid="modal-photo-gallery"
      >
        {/* Header */}
        <DialogHeader className="p-4 bg-black/50 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-lg">
                {currentPhoto.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {currentIndex + 1} of {photos.length}
                </Badge>
                {currentPhoto.entryType && (
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {currentPhoto.entryType}
                  </Badge>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(currentPhoto.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-white hover:bg-white/10"
                data-testid="button-zoom"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                data-testid="button-download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                data-testid="button-share"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                data-testid="button-delete-photo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
                data-testid="button-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Image Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-move' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              draggable={false}
            />
          </div>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full"
                data-testid="button-prev-photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12 rounded-full"
                data-testid="button-next-photo"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Footer with Thumbnails */}
        {photos.length > 1 && (
          <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-gray-800">
            <div className="flex space-x-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsZoomed(false);
                  }}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-400 opacity-100' 
                      : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo Description */}
        {currentPhoto.description && (
          <div className="p-4 bg-black/30 backdrop-blur-sm">
            <p className="text-white text-sm">{currentPhoto.description}</p>
            {currentPhoto.entryTitle && (
              <p className="text-gray-400 text-xs mt-1">
                From: {currentPhoto.entryTitle}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}