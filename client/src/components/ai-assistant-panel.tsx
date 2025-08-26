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
  usePhotoAnalysis, 
  useEntryCategorizer,
  useDuplicateChecker,
  useCacheInvalidator
} from "@/hooks/useAI";
import type { Vehicle } from "@shared/schema";
import { 
  Bot, 
  Camera, 
  Tag, 
  RefreshCw, 
  Sparkles, 
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [entryData, setEntryData] = useState({ title: "", description: "", cost: 0 });
  const [duplicateCheck, setDuplicateCheck] = useState({ type: "vin" as "vin" | "modification" | "maintenance", identifier: "" });
  
  // AI Hooks
  const photoAnalysis = usePhotoAnalysis();
  const entryCategorizer = useEntryCategorizer();
  const duplicateChecker = useDuplicateChecker();
  const cacheInvalidator = useCacheInvalidator();


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

  const handleDuplicateCheck = async (identifier?: string, type?: "vin" | "modification" | "maintenance") => {
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
              {vehicle ? `Smart tools for your ${vehicle.year} ${vehicle.make} ${vehicle.model}` : "AI-powered photo analysis, categorization, and tools"}
            </CardDescription>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse-glow flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 p-1">
            <TabsTrigger value="photo" className="flex flex-col items-center justify-center p-2 text-xs h-auto min-h-[50px]">
              <Camera className="w-4 h-4 mb-1" />
              <span className="leading-none">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="categorize" className="flex flex-col items-center justify-center p-2 text-xs h-auto min-h-[50px]">
              <Tag className="w-4 h-4 mb-1" />
              <span className="leading-none">Cat</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex flex-col items-center justify-center p-2 text-xs h-auto min-h-[50px]">
              <RefreshCw className="w-4 h-4 mb-1" />
              <span className="leading-none">Tools</span>
            </TabsTrigger>
          </TabsList>



          <TabsContent value="photo" className="mt-6">
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

          <TabsContent value="categorize" className="mt-6">
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

          <TabsContent value="tools" className="mt-6">
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
                    onChange={(e) => setDuplicateCheck({...duplicateCheck, type: e.target.value as "vin" | "modification" | "maintenance"})}
                    className="input-enhanced flex-shrink-0"
                  >
                    <option value="vin">VIN</option>
                    <option value="modification">Modification</option>
                    <option value="maintenance">Maintenance</option>
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