import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Calendar, 
  AlertTriangle, 
  Snowflake, 
  Sun, 
  CloudRain, 
  Wrench,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMaintenanceRecommendations } from "@/hooks/useAI";
import { apiRequest } from "@/lib/queryClient";

interface MaintenancePrediction {
  id: string;
  type: string;
  description: string;
  estimatedDate: string;
  confidence: number;
  cost: number;
  urgency: "low" | "medium" | "high";
  reason: string;
  aiInsight: string;
}

interface AIRecommendation {
  task: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  estimatedCost: string;
  dueDate: string;
  reason: string;
}

interface SeasonalSuggestion {
  id: string;
  title: string;
  description: string;
  season: string;
  weatherCondition: string;
  priority: "low" | "medium" | "high";
  estimatedCost: number;
}

interface SmartMaintenancePredictionsProps {
  vehicleId: string;
}

export default function SmartMaintenancePredictions({ vehicleId }: SmartMaintenancePredictionsProps) {
  const [selectedTab, setSelectedTab] = useState("predictions");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  // Fetch vehicle data to analyze actual maintenance patterns
  const { data: vehicle } = useQuery({
    queryKey: ['/api/v1/vehicles', vehicleId],
    queryFn: () => fetch(`/api/v1/vehicles/${vehicleId}`).then(r => r.json()),
    enabled: !!vehicleId,
  });

  const { data: maintenanceRecords } = useQuery({
    queryKey: ['/api/v1/vehicles', vehicleId, 'maintenance'],
    queryFn: () => fetch(`/api/v1/vehicles/${vehicleId}/maintenance`).then(r => r.json()),
    enabled: !!vehicleId,
  });

  // Generate predictions based on actual vehicle data
  const convertAIRecommendationsToPredictions = (recommendations: AIRecommendation[]): MaintenancePrediction[] => {
    return recommendations.map((rec, index) => {
      const urgency = rec.priority === 'urgent' ? 'high' : rec.priority as 'low' | 'medium' | 'high';
      
      // Estimate cost from the cost string
      const costMatch = rec.estimatedCost.match(/\$(\d+)/);
      const estimatedCost = costMatch ? parseInt(costMatch[1]) : 100;
      
      // Convert due date to actual date
      let estimatedDate = new Date();
      if (rec.dueDate.toLowerCase().includes('days')) {
        const daysMatch = rec.dueDate.match(/\d+/);
        if (daysMatch) {
          estimatedDate.setDate(estimatedDate.getDate() + parseInt(daysMatch[0]));
        }
      } else if (rec.dueDate.toLowerCase().includes('miles')) {
        // Assume 1000 miles = 30 days for scheduling
        estimatedDate.setDate(estimatedDate.getDate() + 30);
      } else {
        estimatedDate.setDate(estimatedDate.getDate() + 14);
      }
      
      return {
        id: `ai-rec-${index}`,
        type: rec.task,
        description: rec.description,
        estimatedDate: estimatedDate.toISOString().split('T')[0],
        confidence: 90,
        cost: estimatedCost,
        urgency,
        reason: rec.reason,
        aiInsight: `AI recommendation based on manufacturer specs and owner community feedback`
      };
    });
  };

  const generateMaintenancePredictions = (): MaintenancePrediction[] => {
    // Use AI recommendations if available
    if (aiRecommendations.length > 0) {
      return convertAIRecommendationsToPredictions(aiRecommendations);
    }
    
    // Fallback to basic predictions if AI not available
    if (!vehicle?.data || !maintenanceRecords?.data) return [];
    
    const vehicleData = vehicle.data;
    const records = maintenanceRecords.data;
    const predictions: MaintenancePrediction[] = [];
    
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleData.year;
    const currentMileage = vehicleData.currentMileage || 0;
    
    // Find last oil change
    const lastOilChange = records.find((r: any) => 
      r.serviceType?.toLowerCase().includes('oil') || 
      r.description?.toLowerCase().includes('oil')
    );
    
    if (!lastOilChange || currentMileage - (lastOilChange.mileage || 0) > 4000) {
      predictions.push({
        id: "oil-change",
        type: "Oil Change",
        description: "Regular oil change needed based on mileage",
        estimatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 95,
        cost: vehicleAge > 10 ? 85 : 65,
        urgency: currentMileage - (lastOilChange?.mileage || 0) > 6000 ? "high" : "medium",
        reason: `${currentMileage - (lastOilChange?.mileage || 0)} miles since last oil change`,
        aiInsight: `Based on your ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} specifications`
      });
    }
    
    return predictions;
  };

  const predictions = generateMaintenancePredictions();

  const maintenanceRecommendationsMutation = useMaintenanceRecommendations();

  const analyzeWithAI = async () => {
    if (!vehicle?.data) return;
    
    setIsAnalyzing(true);
    try {
      const recommendations = await maintenanceRecommendationsMutation.mutateAsync({
        make: vehicle.data.make || '',
        model: vehicle.data.model || '',
        year: parseInt(vehicle.data.year) || new Date().getFullYear(),
        mileage: vehicle.data.currentMileage || 0,
        modifications: [],
        lastMaintenance: maintenanceRecords?.data?.map((r: any) => `${r.serviceType}: ${r.mileage} miles`) || []
      });
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-generate AI recommendations when vehicle data is available
  useEffect(() => {
    if (vehicle?.data && vehicle.data.currentMileage && vehicle.data.currentMileage > 1000) {
      analyzeWithAI();
    }
  }, [vehicle?.data?.id]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "medium": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "low": return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Smart Maintenance Predictions</span>
        </CardTitle>
        <CardDescription>
          AI-powered maintenance forecasting based on your driving patterns and environmental data
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {vehicle?.data && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {vehicle.data.year} {vehicle.data.make} {vehicle.data.model} • {vehicle.data.currentMileage?.toLocaleString()} miles
              </div>
            )}
          </div>
          <Button 
            onClick={analyzeWithAI}
            disabled={isAnalyzing || !vehicle?.data}
            className="btn-primary"
            data-testid="button-ai-analyze"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </>
            )}
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="w-full overflow-x-auto horizontal-scroll-tabs">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-2 md:w-full gap-1">
              <TabsTrigger value="predictions" className="flex-shrink-0 whitespace-nowrap px-4 py-2 text-sm">Maintenance Predictions</TabsTrigger>
              <TabsTrigger value="seasonal" className="flex-shrink-0 whitespace-nowrap px-4 py-2 text-sm">Seasonal Prep</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="predictions" className="space-y-4 mt-6">
            {predictions.length > 0 ? (
              predictions.map((prediction) => (
                <Card key={prediction.id} className="card-hover border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{prediction.type}</h4>
                          <Badge className={getUrgencyColor(prediction.urgency)}>
                            {prediction.urgency} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {prediction.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${prediction.cost}</p>
                        <p className="text-xs text-gray-500">estimated cost</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 mobile-gap mobile-spacing mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-medium">
                            {new Date(prediction.estimatedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="text-sm font-medium">{prediction.confidence}%</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">Based on</p>
                          <p className="text-sm font-medium">Real Data</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Analysis:</strong> {prediction.aiInsight}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Reason: {prediction.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Maintenance Predictions Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    Predictions will be generated based on your vehicle's maintenance history and mileage. 
                    Add maintenance records to see AI-powered insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4 mt-6">
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <Snowflake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Seasonal Recommendations Not Available
                </h3>
                <p className="text-sm text-gray-500">
                  Seasonal maintenance suggestions would be based on your location, local weather patterns, 
                  and vehicle-specific requirements. This feature requires real weather data integration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}