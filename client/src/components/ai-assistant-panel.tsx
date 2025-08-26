import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useVinDecoder, 
  useMaintenanceRecommendations, 
  usePhotoAnalysis, 
  useEntryCategorizer,
  useDuplicateChecker,
  useCacheInvalidator
} from "@/hooks/useAI";
import type { Vehicle } from "@shared/schema";
import { 
  Bot, 
  Search, 
  Wrench, 
  Camera, 
  Tag, 
  RefreshCw, 
  Sparkles, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface AIAssistantPanelProps {
  vehicleId?: string;
}

export default function AIAssistantPanel({ vehicleId }: AIAssistantPanelProps) {
  const { toast } = useToast();
  
  // Fetch vehicle data if vehicleId is provided
  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ['/api/v1/vehicles', vehicleId],
    queryFn: () => api(`/vehicles/${vehicleId}`).then(r => r.data),
    enabled: !!vehicleId,
  });

  // State for different AI features
  const [vinInput, setVinInput] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [entryData, setEntryData] = useState({ title: "", description: "", cost: 0 });
  const [duplicateCheck, setDuplicateCheck] = useState({ type: "vin" as const, identifier: "" });
  
  // AI Hooks
  const vinDecoder = useVinDecoder();
  const maintenanceRecs = useMaintenanceRecommendations();
  const photoAnalysis = usePhotoAnalysis();
  const entryCategorizer = useEntryCategorizer();
  const duplicateChecker = useDuplicateChecker();
  const cacheInvalidator = useCacheInvalidator();

  const handleVinDecode = async (vin?: string) => {
    const vinToUse = vin || vinInput;
    if (vinToUse.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await vinDecoder.mutateAsync(vinToUse);
      toast({
        title: "VIN Analyzed Successfully! 🚗",
        description: `${result.year} ${result.make} ${result.model} - ${result.engine}`,
      });
    } catch (error) {
      toast({
        title: "VIN Analysis Failed",
        description: "Unable to analyze this VIN. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoAnalysis = async () => {
    if (!photoFile) {
      toast({
        title: "No Photo Selected",
        description: "Please select a photo to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await photoAnalysis.mutateAsync(photoFile);
      toast({
        title: "Photo Analyzed! 📸",
        description: `Detected: ${result.category} - ${result.description}`,
      });
    } catch (error) {
      toast({
        title: "Photo Analysis Failed",
        description: "Unable to analyze this photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEntryCategorization = async () => {
    if (!entryData.title || !entryData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await entryCategorizer.mutateAsync(entryData);
      toast({
        title: "Entry Categorized! 🏷️",
        description: `Category: ${result.category} - Priority: ${result.priority}`,
      });
    } catch (error) {
      toast({
        title: "Categorization Failed",
        description: "Unable to categorize this entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateCheck = async (identifier?: string, type?: "vin" | "license") => {
    const checkData = {
      identifier: identifier || duplicateCheck.identifier,
      type: type || duplicateCheck.type
    };
    
    if (!checkData.identifier) {
      toast({
        title: "Missing Information",
        description: "Please enter something to check for duplicates",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await duplicateChecker.mutateAsync(checkData);
      if (result.exists) {
        toast({
          title: "Duplicate Found! ⚠️",
          description: result.suggestion || "A similar record already exists",
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Duplicates Found ✅",
          description: "This appears to be unique",
        });
      }
    } catch (error) {
      toast({
        title: "Duplicate Check Failed",
        description: "Unable to check for duplicates. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCacheRefresh = async () => {
    try {
      await cacheInvalidator.mutateAsync();
      toast({
        title: "Cache Refreshed! 🔄",
        description: "Your data has been refreshed without clearing cookies",
      });
    } catch (error) {
      toast({
        title: "Cache Refresh Failed",
        description: "Unable to refresh cache. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex-shrink-0">
            <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate">AI Assistant</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {vehicle ? `AI insights for your ${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Intelligent features powered by OpenAI"}
            </CardDescription>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse-glow flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="vin-decode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
            <TabsTrigger value="vin-decode" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">VIN</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">
              <Wrench className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="text-xs">
              <Camera className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="categorize" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Categorize</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vin-decode" className="mt-4">
            {vehicle ? (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 dark:text-blue-300">Current Vehicle VIN</span>
                  </div>
                  <div className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                    {vehicle.vin || "No VIN available"}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div><strong>Make:</strong> {vehicle.make}</div>
                    <div><strong>Model:</strong> {vehicle.model}</div>
                    <div><strong>Year:</strong> {vehicle.year}</div>
                    <div><strong>Trim:</strong> {vehicle.trim || "Unknown"}</div>
                  </div>
                </div>
                {vehicle.vin && (
                  <Button 
                    onClick={() => handleVinDecode(vehicle.vin)}
                    disabled={vinDecoder.isPending}
                    className="btn-primary w-full"
                    data-testid="button-decode-vehicle-vin"
                  >
                    {vinDecoder.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Analyze VIN with AI
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">VIN Number</label>
                  <Input
                    placeholder="Enter 17-character VIN"
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    maxLength={17}
                    className="input-enhanced"
                    data-testid="input-vin"
                  />
                </div>
                <Button 
                  onClick={() => handleVinDecode(vinInput)}
                  disabled={vinDecoder.isPending || vinInput.length !== 17}
                  className="btn-primary w-full"
                  data-testid="button-decode-vin"
                >
                  {vinDecoder.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Decode VIN with AI
                </Button>
              </div>
            )}
            
            {vinDecoder.data && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-300">AI Analysis Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Make:</strong> {vinDecoder.data.make}</div>
                  <div><strong>Model:</strong> {vinDecoder.data.model}</div>
                  <div><strong>Year:</strong> {vinDecoder.data.year}</div>
                  <div><strong>Engine:</strong> {vinDecoder.data.engine}</div>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Confidence: {Math.round(vinDecoder.data.confidence * 100)}%
                </Badge>
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4">
            <div className="space-y-3">
              {vehicle ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                  <div className="text-sm">
                    <div><strong>Vehicle:</strong> {vehicle.year} {vehicle.make} {vehicle.model}</div>
                    <div><strong>Mileage:</strong> {vehicle.currentMileage?.toLocaleString() || "Unknown"} miles</div>
                    <div><strong>Last Service:</strong> {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : "Unknown"}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 mb-3">
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Select a vehicle to get personalized maintenance recommendations
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => maintenanceRecs.mutate(vehicle ? {
                  make: vehicle.make,
                  model: vehicle.model, 
                  year: vehicle.year,
                  mileage: vehicle.currentMileage || 0,
                  modifications: [], // TODO: Fetch actual modifications
                  lastMaintenance: [] // TODO: Fetch actual maintenance history
                } : {
                  make: "Unknown",
                  model: "Unknown", 
                  year: 2020,
                  mileage: 50000,
                  modifications: [],
                  lastMaintenance: []
                })}
                disabled={maintenanceRecs.isPending}
                className="btn-primary w-full"
                data-testid="button-maintenance-recommendations"
              >
                {maintenanceRecs.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4 mr-2" />
                )}
                Get AI Maintenance Recommendations
              </Button>
              
              {maintenanceRecs.data && maintenanceRecs.data.length > 0 && (
                <div className="space-y-2">
                  {maintenanceRecs.data.slice(0, 3).map((rec, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{rec.task}</span>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{rec.description}</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-green-600 dark:text-green-400">{rec.estimatedCost}</span>
                        <span className="text-orange-600 dark:text-orange-400">{rec.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="photo" className="mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="input-enhanced"
                  data-testid="input-photo"
                />
              </div>
              <Button 
                onClick={handlePhotoAnalysis}
                disabled={photoAnalysis.isPending || !photoFile}
                className="btn-primary w-full"
                data-testid="button-analyze-photo"
              >
                {photoAnalysis.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                Analyze Photo with AI
              </Button>
              
              {photoAnalysis.data && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-800 dark:text-purple-300">Analysis Complete</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><strong>Category:</strong> {photoAnalysis.data.category}</div>
                    <div><strong>Description:</strong> {photoAnalysis.data.description}</div>
                    <div><strong>Estimated Value:</strong> {photoAnalysis.data.estimatedValue}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photoAnalysis.data.suggestedTags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categorize" className="mt-4">
            <div className="space-y-3">
              <Input
                placeholder="Entry title"
                value={entryData.title}
                onChange={(e) => setEntryData(prev => ({ ...prev, title: e.target.value }))}
                className="input-enhanced"
                data-testid="input-entry-title"
              />
              <Textarea
                placeholder="Entry description"
                value={entryData.description}
                onChange={(e) => setEntryData(prev => ({ ...prev, description: e.target.value }))}
                className="input-enhanced"
                data-testid="textarea-entry-description"
              />
              <Input
                type="number"
                placeholder="Cost ($)"
                value={entryData.cost || ""}
                onChange={(e) => setEntryData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                className="input-enhanced"
                data-testid="input-entry-cost"
              />
              <Button 
                onClick={handleEntryCategorization}
                disabled={entryCategorizer.isPending}
                className="btn-primary w-full"
                data-testid="button-categorize-entry"
              >
                {entryCategorizer.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                Smart Categorize
              </Button>
              
              {entryCategorizer.data && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-orange-800 dark:text-orange-300">Categorized</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Category:</strong> {entryCategorizer.data.category}</div>
                    <div><strong>Subcategory:</strong> {entryCategorizer.data.subcategory}</div>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    Priority: {entryCategorizer.data.priority}
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="mt-4">
            <div className="space-y-3">
              {vehicle && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                  <div className="text-sm">
                    <div><strong>Quick Checks for:</strong> {vehicle.year} {vehicle.make} {vehicle.model}</div>
                    {vehicle.vin && (
                      <div className="mt-2">
                        <Button 
                          onClick={() => handleDuplicateCheck(vehicle.vin, "vin")}
                          disabled={duplicateChecker.isPending}
                          size="sm"
                          variant="outline"
                          className="mr-2"
                        >
                          Check VIN Duplicates
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Manual Duplicate Check</label>
                <div className="flex gap-2 mt-1">
                  <select 
                    value={duplicateCheck.type}
                    onChange={(e) => setDuplicateCheck({...duplicateCheck, type: e.target.value as "vin" | "license"})}
                    className="input-enhanced flex-shrink-0"
                  >
                    <option value="vin">VIN</option>
                    <option value="license">License Plate</option>
                  </select>
                  <Input
                    placeholder="Enter identifier"
                    value={duplicateCheck.identifier}
                    onChange={(e) => setDuplicateCheck({...duplicateCheck, identifier: e.target.value})}
                    className="input-enhanced"
                    data-testid="input-duplicate-check"
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleDuplicateCheck(duplicateCheck.identifier, duplicateCheck.type)}
                disabled={duplicateChecker.isPending || !duplicateCheck.identifier}
                className="btn-primary w-full"
                data-testid="button-duplicate-check"
              >
                {duplicateChecker.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                Check for Duplicates
              </Button>
              
              <div className="border-t pt-3">
                <Button 
                  onClick={handleCacheRefresh}
                  disabled={cacheInvalidator.isPending}
                  className="btn-secondary w-full"
                  data-testid="button-cache-refresh"
                >
                  {cacheInvalidator.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Data Cache
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}