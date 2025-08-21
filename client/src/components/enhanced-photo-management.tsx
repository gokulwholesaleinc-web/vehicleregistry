import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Camera, 
  Image as ImageIcon, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Tag,
  Search,
  Upload,
  Eye,
  Zap,
  Clock,
  Grid3X3,
  Filter
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Photo {
  id: string;
  url: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  modification?: string;
  isBeforePhoto?: boolean;
  isAfterPhoto?: boolean;
}

interface PhotoComparison {
  id: string;
  title: string;
  beforePhoto: Photo;
  afterPhoto: Photo;
  modification: string;
}

interface EnhancedPhotoManagementProps {
  vehicleId: string;
}

export default function EnhancedPhotoManagement({ vehicleId }: EnhancedPhotoManagementProps) {
  const [selectedTab, setSelectedTab] = useState("gallery");
  const [comparisonSlider, setComparisonSlider] = useState([50]);
  const [timelapseSpeed, setTimelapseSpeed] = useState([1]);
  const [isTimelapseRunning, setIsTimelapseRunning] = useState(false);
  const [timelapseIndex, setTimelapseIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mock photo data
  const mockPhotos: Photo[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1494976688153-d4d4c0e3a9c8?w=400",
      title: "Engine Bay - Original",
      date: "2025-01-15",
      category: "engine",
      tags: ["engine", "stock", "original"],
      modification: "Cold Air Intake",
      isBeforePhoto: true
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
      title: "Engine Bay - After CAI Install",
      date: "2025-01-20",
      category: "engine",
      tags: ["engine", "cold air intake", "performance", "modified"],
      modification: "Cold Air Intake",
      isAfterPhoto: true
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400", 
      title: "Suspension Work - Before",
      date: "2025-02-01",
      category: "suspension",
      tags: ["suspension", "stock", "original"],
      modification: "Coilover Install",
      isBeforePhoto: true
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1558618047-3dd6349f0ac4?w=400",
      title: "Suspension Work - After",
      date: "2025-02-05", 
      category: "suspension",
      tags: ["suspension", "coilovers", "lowered", "modified"],
      modification: "Coilover Install",
      isAfterPhoto: true
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
      title: "Progress Update - Week 1",
      date: "2025-02-10",
      category: "progress",
      tags: ["progress", "build", "timelapse"]
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400",
      title: "Progress Update - Week 2", 
      date: "2025-02-17",
      category: "progress",
      tags: ["progress", "build", "timelapse"]
    }
  ];

  const mockComparisons: PhotoComparison[] = [
    {
      id: "1",
      title: "Cold Air Intake Installation",
      beforePhoto: mockPhotos[0],
      afterPhoto: mockPhotos[1],
      modification: "Cold Air Intake"
    },
    {
      id: "2", 
      title: "Suspension Upgrade",
      beforePhoto: mockPhotos[2],
      afterPhoto: mockPhotos[3],
      modification: "Coilover Install"
    }
  ];

  const categories = ["all", "engine", "suspension", "exterior", "interior", "progress"];
  const progressPhotos = mockPhotos.filter(photo => photo.category === "progress");

  // Auto-tag functionality using mock AI recognition
  const autoTagPhoto = async (photoId: string) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock recognized tags
    const aiTags = ["performance part", "aftermarket", "installation"];
    return aiTags;
  };

  const filteredPhotos = mockPhotos.filter(photo => {
    const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Timelapse functionality
  useEffect(() => {
    if (isTimelapseRunning && progressPhotos.length > 0) {
      intervalRef.current = setInterval(() => {
        setTimelapseIndex(prev => (prev + 1) % progressPhotos.length);
      }, 1000 / timelapseSpeed[0]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimelapseRunning, timelapseSpeed, progressPhotos.length]);

  const startTimelapse = () => {
    setIsTimelapseRunning(true);
  };

  const pauseTimelapse = () => {
    setIsTimelapseRunning(false);
  };

  const resetTimelapse = () => {
    setIsTimelapseRunning(false);
    setTimelapseIndex(0);
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Enhanced Photo Management</span>
        </CardTitle>
        <CardDescription>
          Advanced photo tools with AI-powered organization and comparison features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
            <TabsTrigger value="comparisons">Before/After</TabsTrigger>
            <TabsTrigger value="timelapse">Time-lapse</TabsTrigger>
            <TabsTrigger value="organize">AI Organize</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6 mt-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search-photos">Search Photos</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search-photos"
                    placeholder="Search by title or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-photos"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="category-filter">Category</Label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  data-testid="select-category-filter"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="card-hover group overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {photo.category}
                      </Badge>
                    </div>
                    {(photo.isBeforePhoto || photo.isAfterPhoto) && (
                      <div className="absolute top-2 left-2">
                        <Badge className={photo.isBeforePhoto ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                          {photo.isBeforePhoto ? "Before" : "After"}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-1 truncate">{photo.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{new Date(photo.date).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{photo.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparisons" className="space-y-6 mt-6">
            {mockComparisons.map((comparison) => (
              <Card key={comparison.id} className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg">{comparison.title}</CardTitle>
                  <CardDescription>{comparison.modification}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="relative h-64 md:h-80">
                      {/* Before Image */}
                      <img
                        src={comparison.beforePhoto.url}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ clipPath: `inset(0 ${100 - comparisonSlider[0]}% 0 0)` }}
                      />
                      {/* After Image */}
                      <img
                        src={comparison.afterPhoto.url}
                        alt="After"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ clipPath: `inset(0 0 0 ${comparisonSlider[0]}%)` }}
                      />
                      
                      {/* Slider Line */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                        style={{ left: `${comparisonSlider[0]}%` }}
                      >
                        <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center">
                          <Sliders className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        Before
                      </div>
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        After
                      </div>
                    </div>

                    {/* Slider Control */}
                    <div className="p-4">
                      <Label className="text-sm font-medium mb-2 block">Comparison Slider</Label>
                      <Slider
                        value={comparisonSlider}
                        onValueChange={setComparisonSlider}
                        max={100}
                        step={1}
                        className="w-full"
                        data-testid="slider-comparison"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timelapse" className="space-y-6 mt-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5 text-green-600" />
                  <span>Build Progress Time-lapse</span>
                </CardTitle>
                <CardDescription>
                  Watch your build progress unfold over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressPhotos.length > 0 ? (
                  <div className="space-y-4">
                    {/* Timelapse Viewer */}
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={progressPhotos[timelapseIndex]?.url}
                        alt={`Progress ${timelapseIndex + 1}`}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded">
                        <p className="text-sm font-medium">{progressPhotos[timelapseIndex]?.title}</p>
                        <p className="text-xs">{new Date(progressPhotos[timelapseIndex]?.date).toLocaleDateString()}</p>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {timelapseIndex + 1} / {progressPhotos.length}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={isTimelapseRunning ? pauseTimelapse : startTimelapse}
                        variant="outline"
                        data-testid="button-timelapse-play"
                      >
                        {isTimelapseRunning ? (
                          <><Pause className="w-4 h-4 mr-2" />Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />Play</>
                        )}
                      </Button>
                      <Button onClick={resetTimelapse} variant="outline" data-testid="button-timelapse-reset">
                        <RotateCcw className="w-4 h-4 mr-2" />Reset
                      </Button>
                    </div>

                    {/* Speed Control */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Playback Speed: {timelapseSpeed[0]}x</Label>
                      <Slider
                        value={timelapseSpeed}
                        onValueChange={setTimelapseSpeed}
                        max={5}
                        min={0.5}
                        step={0.5}
                        className="w-full"
                        data-testid="slider-timelapse-speed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No progress photos available for time-lapse</p>
                    <p className="text-sm text-gray-500 mt-1">Add photos with 'progress' category to create time-lapses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organize" className="space-y-6 mt-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>AI Photo Organization</span>
                </CardTitle>
                <CardDescription>
                  Automatically categorize and tag your photos using AI recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* AI Recognition Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">247</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Auto-generated Tags</p>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recognition Accuracy</p>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <Grid3X3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Auto Categories</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detected Parts and Modifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI-Detected Parts & Modifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockPhotos.slice(0, 4).map((photo) => (
                        <Card key={photo.id} className="card-hover">
                          <CardContent className="p-4">
                            <div className="flex space-x-3">
                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{photo.title}</h4>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {photo.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <Button size="sm" variant="outline" className="text-xs" data-testid={`button-retag-${photo.id}`}>
                                  <Zap className="w-3 h-3 mr-1" />
                                  Re-analyze
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Bulk AI Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" data-testid="button-auto-categorize">
                        <Filter className="w-4 h-4 mr-2" />
                        Auto-Categorize All
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-generate-tags">
                        <Tag className="w-4 h-4 mr-2" />
                        Generate Missing Tags
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-detect-duplicates">
                        <Eye className="w-4 h-4 mr-2" />
                        Detect Duplicates
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}