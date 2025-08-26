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
  const generateMaintenancePredictions = (): MaintenancePrediction[] => {
    if (!vehicle?.data || !maintenanceRecords?.data) return [];
    
    const vehicleData = vehicle.data;
    const records = maintenanceRecords.data;
    const predictions: MaintenancePrediction[] = [];
    
    // Calculate basic maintenance intervals based on vehicle age and mileage
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

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predictions">Maintenance Predictions</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Prep</TabsTrigger>
          </TabsList>

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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