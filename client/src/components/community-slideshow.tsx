import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Eye, User, Calendar } from "lucide-react";
import bmwImage1 from "@assets/FB_IMG_1751951510231_1755750547262.jpg";
import bmwImage2 from "@assets/FB_IMG_1751951504094_1755750547274.jpg";

interface VehiclePhoto {
  id: string;
  imageUrl: string;
  vehicleName: string;
  year: number;
  make: string;
  model: string;
  ownerName: string;
  location: string;
  likes: number;
  views: number;
  uploadDate: string;
  tags: string[];
}

const samplePhotos: VehiclePhoto[] = [
  {
    id: "1",
    imageUrl: bmwImage1,
    vehicleName: "Track Beast",
    year: 2020,
    make: "BMW",
    model: "M2 Competition", 
    ownerName: "CarEnthusiast",
    location: "California",
    likes: 247,
    views: 1834,
    uploadDate: "2 days ago",
    tags: ["Performance", "Track", "Modified"]
  },
  {
    id: "2", 
    imageUrl: bmwImage2,
    vehicleName: "Blue Thunder",
    year: 2020,
    make: "BMW", 
    model: "M2 Competition",
    ownerName: "CarEnthusiast",
    location: "California", 
    likes: 189,
    views: 1456,
    uploadDate: "3 days ago",
    tags: ["Showroom", "Clean", "Stock"]
  }
];

export default function CommunitySlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % samplePhotos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % samplePhotos.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + samplePhotos.length) % samplePhotos.length);
    setIsAutoPlaying(false);
  };

  const currentPhoto = samplePhotos[currentIndex];

  return (
    <Card className="card-modern overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="font-semibold text-lg">Community Showcase</h3>
                <p className="text-sm text-white/80">Featured vehicle photos from our community</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {currentIndex + 1} / {samplePhotos.length}
              </Badge>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative h-80 lg:h-96">
            <img
              src={currentPhoto.imageUrl}
              alt={`${currentPhoto.year} ${currentPhoto.make} ${currentPhoto.model}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="lg"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full backdrop-blur-sm"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full backdrop-blur-sm"
              data-testid="button-next-slide"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="text-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-xl">
                      {currentPhoto.year} {currentPhoto.make} {currentPhoto.model}
                    </h4>
                    <p className="text-white/80">"{currentPhoto.vehicleName}"</p>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{currentPhoto.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{currentPhoto.views}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-white/80">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{currentPhoto.ownerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{currentPhoto.uploadDate}</span>
                    </div>
                    <span>📍 {currentPhoto.location}</span>
                  </div>
                  <div className="flex space-x-1">
                    {currentPhoto.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-white/20 text-white border-white/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800">
            {samplePhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-blue-600 dark:bg-blue-400 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                data-testid={`dot-${index}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}