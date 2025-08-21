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

  // Mock weather data (in real implementation, this would come from a weather API)
  const currentWeather = {
    season: "winter",
    temperature: 32,
    condition: "snow",
    humidity: 78
  };

  // Mock predictions data (in real implementation, this would come from AI analysis)
  const mockPredictions: MaintenancePrediction[] = [
    {
      id: "1",
      type: "Oil Change",
      description: "Engine oil change recommended",
      estimatedDate: "2025-09-15",
      confidence: 89,
      cost: 75,
      urgency: "medium",
      reason: "Based on current mileage and driving patterns",
      aiInsight: "Your frequent highway driving suggests oil breakdown is accelerated. Consider switching to full synthetic."
    },
    {
      id: "2", 
      type: "Brake Inspection",
      description: "Brake pads showing wear patterns",
      estimatedDate: "2025-10-01",
      confidence: 76,
      cost: 450,
      urgency: "high",
      reason: "Heavy city driving detected",
      aiInsight: "Stop-and-go traffic patterns indicate brake pad wear is 20% faster than average."
    },
    {
      id: "3",
      type: "Tire Rotation",
      description: "Tire rotation for even wear",
      estimatedDate: "2025-08-30",
      confidence: 95,
      cost: 50,
      urgency: "low",
      reason: "Scheduled maintenance interval",
      aiInsight: "Your driving style and wheel alignment suggest front tires are wearing 15% faster."
    }
  ];

  const mockSeasonalSuggestions: SeasonalSuggestion[] = [
    {
      id: "1",
      title: "Winter Tire Installation",
      description: "Cold weather approaching - install winter tires for better traction",
      season: "winter",
      weatherCondition: "snow",
      priority: "high",
      estimatedCost: 400
    },
    {
      id: "2",
      title: "Battery Health Check",
      description: "Cold weather reduces battery performance by up to 40%",
      season: "winter", 
      weatherCondition: "cold",
      priority: "medium",
      estimatedCost: 150
    },
    {
      id: "3",
      title: "Coolant System Service",
      description: "Prevent freeze damage with antifreeze concentration check",
      season: "winter",
      weatherCondition: "freezing",
      priority: "medium",
      estimatedCost: 120
    }
  ];

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
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Sun className="w-4 h-4" />
              <span>{currentWeather.temperature}°F</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Snowflake className="w-4 h-4" />
              <span>{currentWeather.season}</span>
            </div>
          </div>
          <Button 
            onClick={analyzeWithAI}
            disabled={isAnalyzing}
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
            {mockPredictions.map((prediction) => (
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
                        <p className="text-xs text-gray-500">AI Analysis</p>
                        <p className="text-sm font-medium">Complete</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>AI Insight:</strong> {prediction.aiInsight}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Reason: {prediction.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Snowflake className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Winter Preparation</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Based on current weather patterns and your location, here are AI-recommended preparations:
              </p>
            </div>

            {mockSeasonalSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      {getPriorityIcon(suggestion.priority)}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                            {suggestion.season}
                          </span>
                          <span className="text-gray-500">
                            {suggestion.weatherCondition}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${suggestion.estimatedCost}</p>
                      <Badge className={getUrgencyColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}