import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, Eye, User, Calendar, Play, Pause, X, MapPin } from "lucide-react";
import bmwImage1 from "@assets/FB_IMG_1751951510231_1755750547262.jpg";
import bmwImage2 from "@assets/FB_IMG_1751951504094_1755750547274.jpg";
import bmwMeetImage from "@assets/DSC_1899_1755751395846.jpg";
import evoImage from "@assets/DSC_1850_1755751434966.jpg";

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
  },
  {
    id: "3",
    imageUrl: bmwMeetImage,
    vehicleName: "M Power Lineup",
    year: 2022,
    make: "BMW",
    model: "M4 Competition",
    ownerName: "BMWCrew",
    location: "Texas",
    likes: 312,
    views: 2156,
    uploadDate: "1 day ago",
    tags: ["Meet", "Community", "M4"]
  },
  {
    id: "4",
    imageUrl: evoImage,
    vehicleName: "Forest Runner",
    year: 2006,
    make: "Mitsubishi",
    model: "Lancer Evolution IX",
    ownerName: "EvoDriver",
    location: "Virginia",
    likes: 198,
    views: 1687,
    uploadDate: "4 days ago",
    tags: ["Rally", "AWD", "Tuned"]
  }
];

export default function CommunitySlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
    setIsAutoPlaying(false);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleAutoPlay();
    }
  };

  const currentPhoto = samplePhotos[currentIndex];

  return (
    <Card className="card-modern overflow-hidden focus:outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
      <CardContent className="p-0">
        <div 
          ref={slideRef}
          className="relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3 sm:p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Community Showcase</h3>
                <p className="text-xs sm:text-sm text-white/80">Featured vehicle photos from our community</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAutoPlay}
                  className="text-white hover:bg-white/20 p-2 h-8 w-8"
                  data-testid="button-toggle-autoplay"
                >
                  {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  {currentIndex + 1} / {samplePhotos.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative h-64 sm:h-80 lg:h-96">
            <img
              src={currentPhoto.imageUrl}
              alt={`${currentPhoto.year} ${currentPhoto.make} ${currentPhoto.model}`}
              className="w-full h-full object-cover select-none cursor-pointer transition-transform duration-200 hover:scale-105"
              draggable={false}
              onClick={handleImageClick}
              data-testid="community-showcase-image"
            />
            
            {/* Click hint overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                Click to view full size
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="lg"
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm touch-friendly transition-all duration-200 active:scale-95"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm touch-friendly transition-all duration-200 active:scale-95"
              data-testid="button-next-slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 sm:p-4">
              <div className="text-white">
                {/* Title and Stats Row */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg lg:text-xl leading-tight truncate">
                        {currentPhoto.year} {currentPhoto.make} {currentPhoto.model}
                      </h4>
                      <p className="text-white/80 text-xs sm:text-sm mt-0.5 truncate">"{currentPhoto.vehicleName}"</p>
                    </div>
                    <div className="flex shrink-0 space-x-3">
                      <button className="flex items-center space-x-1 touch-friendly hover:text-red-300 transition-colors">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">{currentPhoto.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">{currentPhoto.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Meta Info and Tags */}
                <div className="space-y-2">
                  {/* User Info Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/80">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{currentPhoto.ownerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{currentPhoto.uploadDate}</span>
                    </div>
                    <span className="flex items-center">📍 {currentPhoto.location}</span>
                  </div>
                  
                  {/* Tags Row */}
                  <div className="flex flex-wrap gap-1">
                    {currentPhoto.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs h-5 px-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator and Swipe Hint */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {samplePhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 touch-friendly ${
                      index === currentIndex
                        ? "bg-blue-600 dark:bg-blue-400 scale-125"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                    data-testid={`dot-${index}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Swipe or use arrow keys to navigate</span>
              </div>
              <div className="flex sm:hidden items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Swipe to navigate</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Full Size Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <DialogTitle className="text-xl font-bold">
                {currentPhoto.year} {currentPhoto.make} {currentPhoto.model}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
                data-testid="button-close-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="relative">
            {/* Full Size Image */}
            <img
              src={currentPhoto.imageUrl}
              alt={`${currentPhoto.year} ${currentPhoto.make} ${currentPhoto.model}`}
              className="w-full h-auto max-h-[70vh] object-contain"
              data-testid="modal-full-image"
            />

            {/* Detailed Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6">
              <div className="text-white space-y-4">
                {/* Title and Nickname */}
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {currentPhoto.year} {currentPhoto.make} {currentPhoto.model}
                  </h3>
                  <p className="text-lg text-white/90 italic">"{currentPhoto.vehicleName}"</p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 hover:text-red-300 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">{currentPhoto.likes} likes</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">{currentPhoto.views} views</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {currentIndex + 1} of {samplePhotos.length}
                  </Badge>
                </div>

                {/* Owner and Location Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{currentPhoto.ownerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{currentPhoto.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{currentPhoto.uploadDate}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {currentPhoto.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Navigation in Modal */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      prevSlide();
                    }}
                    className="text-white hover:bg-white/20"
                    data-testid="button-modal-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      nextSlide();
                    }}
                    className="text-white hover:bg-white/20"
                    data-testid="button-modal-next"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}