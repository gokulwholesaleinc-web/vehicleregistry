import { useParams } from 'wouter';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Car, Gauge, Calendar, Fuel, Cog, MapPin, Wrench, Camera, Share2, Zap, Shield, Info, Star } from 'lucide-react';
import { Link } from 'wouter';
import RecentModifications from '@/components/recent-modifications';
import MaintenanceTimeline from '@/components/maintenance-timeline';
import PhotoGallery from '@/components/photo-gallery';
import UpcomingMaintenance from '@/components/upcoming-maintenance';
import CostSummary from '@/components/cost-summary';
import VehiclePartsLedger from '@/components/VehiclePartsLedger';
import VehicleMediaPipeline from '@/components/VehicleMediaPipeline';
import PublicVehicleShare from '@/components/PublicVehicleShare';
import SmartMaintenancePanel from '@/components/SmartMaintenancePanel';
import { useBanner } from '@/providers/BannerProvider';
import { useSelectedVehicle } from '@/stores/selectedVehicle';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [engineData, setEngineData] = useState<any>(null);
  const [reliabilityData, setReliabilityData] = useState<any>(null);
  const { show } = useBanner();
  const { setVehicle } = useSelectedVehicle();
  
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['/api/v1/vehicles', id],
    queryFn: () => api(`/vehicles/${id}`).then(r => r.data),
  });

  // AI-powered engine name lookup
  const engineLookupMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await fetch('/api/v1/ai/engine-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicleData.make,
          model: vehicleData.model,
          modelYear: vehicleData.year,
          trim: vehicleData.trim,
          engine: vehicleData.engine
        })
      });
      return response.json();
    },
    onSuccess: (response) => {
      if (response.ok) {
        setEngineData(response.data);
      }
    }
  });

  // AI-powered reliability score
  const reliabilityMutation = useMutation({
    mutationFn: async (vehicleData: any) => {
      const response = await fetch('/api/v1/ai/reliability-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicleData.make,
          model: vehicleData.model,
          modelYear: vehicleData.year,
          trim: vehicleData.trim
        })
      });
      return response.json();
    },
    onSuccess: (response) => {
      if (response.ok) {
        setReliabilityData(response.data);
      }
    }
  });

  // Trigger AI lookups when vehicle data is available
  useEffect(() => {
    if (vehicle && !engineData) {
      engineLookupMutation.mutate(vehicle);
    }
    if (vehicle && !reliabilityData) {
      reliabilityMutation.mutate(vehicle);
    }
    // Update selected vehicle in Zustand store
    if (vehicle) {
      setVehicle({
        id: vehicle.id,
        vin: vehicle.vin,
        nickname: vehicle.nickname,
        mileage: vehicle.mileage
      });
      // Show success banner to test the banner system
      show({
        kind: "success",
        text: `Vehicle "${vehicle.nickname || vehicle.make + ' ' + vehicle.model}" loaded successfully with AI-powered insights`,
        ttlMs: 5000
      });
    }
  }, [vehicle, setVehicle, show]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = String((error as Error).message);
    const isPrivateVehicle = errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('private');
    
    if (isPrivateVehicle) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link href="/vehicles">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Vehicles
                </Button>
              </Link>
            </div>

            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Private Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-orange-700 dark:text-orange-300">
                  This vehicle profile is set to private. Only the owner can view the details.
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => {
                      // TODO: Implement contact owner functionality
                      alert("Contact owner feature coming soon!");
                    }}
                    data-testid="button-contact-owner"
                  >
                    Contact Owner
                  </Button>
                  <Link href="/showcase">
                    <Button variant="secondary">
                      Browse Public Vehicles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Parse AI insights if available
  let aiInsights = null;
  try {
    if (vehicle?.aiInsights) {
      aiInsights = typeof vehicle.aiInsights === 'string' 
        ? JSON.parse(vehicle.aiInsights) 
        : vehicle.aiInsights;
    }
  } catch (e) {
    console.warn('Failed to parse AI insights:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/community">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Link>
        </div>

        {/* Vehicle Info Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-mono">
                  VIN: {vehicle?.vin || 'Draft Vehicle'}
                </div>
                <CardTitle className="text-3xl">
                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                  {vehicle?.trim && ` ${vehicle.trim}`}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    {vehicle?.color || 'Unknown Color'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    {vehicle?.currentMileage?.toLocaleString() || 0} miles
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {vehicle?.isDraft ? 'Draft' : 'Complete'}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Technical Specs */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Drivetrain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Transmission</div>
                <div className="font-medium">{vehicle?.transmission || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Drive Type</div>
                <div className="font-medium">{vehicle?.driveType || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {engineData ? (
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Factory Code (AI-Enhanced)
                  </div>
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {engineData.factoryEngineName}
                  </div>
                  {engineData.engineCode && engineData.engineCode !== engineData.factoryEngineName && (
                    <div className="text-xs text-muted-foreground">
                      Code: {engineData.engineCode}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence: {engineData.confidence} • Sources: {engineData.sources?.slice(0,2).join(', ')}
                  </div>
                </div>
              ) : engineLookupMutation.isPending ? (
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 animate-pulse" />
                    Analyzing Factory Code...
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{vehicle?.engine || '—'}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Fuel</div>
                <div className="font-medium">{vehicle?.fuelType || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Origin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Manufactured</div>
                <div className="font-medium">{vehicle?.plantCountry || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Body Style</div>
                <div className="font-medium">{vehicle?.bodyClass || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Reliability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reliabilityData ? (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Critics Score (AI-Enhanced)
                    </div>
                    <div className="font-bold text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
                      {reliabilityData.overallScore}
                      <span className="text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                        {reliabilityData.scoreOutOf10}/10
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Critics Consensus</div>
                    <div className="text-sm">{reliabilityData.criticsConsensus}</div>
                  </div>
                  {reliabilityData.recommendedForBuying && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      ✓ Recommended Purchase
                    </div>
                  )}
                </>
              ) : reliabilityMutation.isPending ? (
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3 animate-pulse" />
                    Analyzing Reliability...
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">Analysis Pending</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold">AI Insights</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Fun Facts */}
              {aiInsights.funFacts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fun Facts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiInsights.funFacts.map((fact: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Market Value */}
              {aiInsights.marketValue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Value</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Value</div>
                      <div className="text-2xl font-bold text-green-600">
                        {aiInsights.marketValue.estimated || '—'}
                      </div>
                    </div>
                    {aiInsights.marketValue.factors && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Key Factors</div>
                        <ul className="space-y-1">
                          {aiInsights.marketValue.factors.map((factor: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Reliability Analysis */}
              {reliabilityData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Reliability Analysis
                    </CardTitle>
                    <CardDescription>Based on critics and owner reviews</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reliabilityData.strengthAreas && reliabilityData.strengthAreas.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2 text-green-700 dark:text-green-400">✓ Strengths</div>
                        <ul className="space-y-1">
                          {reliabilityData.strengthAreas.map((strength: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reliabilityData.weaknessAreas && reliabilityData.weaknessAreas.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2 text-orange-700 dark:text-orange-400">⚠ Known Issues</div>
                        <ul className="space-y-1">
                          {reliabilityData.weaknessAreas.map((weakness: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reliabilityData.sources && reliabilityData.sources.length > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Sources: {reliabilityData.sources.slice(0,3).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Performance */}
              {aiInsights.performance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiInsights.performance.acceleration && (
                      <div>
                        <div className="text-sm text-muted-foreground">0-60 mph</div>
                        <div className="font-semibold">{aiInsights.performance.acceleration}</div>
                      </div>
                    )}
                    {aiInsights.performance.topSpeed && (
                      <div>
                        <div className="text-sm text-muted-foreground">Top Speed</div>
                        <div className="font-semibold">{aiInsights.performance.topSpeed}</div>
                      </div>
                    )}
                    {aiInsights.performance.mpg && (
                      <div>
                        <div className="text-sm text-muted-foreground">Fuel Economy</div>
                        <div className="font-semibold">{aiInsights.performance.mpg}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Maintenance Tips */}
              {aiInsights.maintenanceTips && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Maintenance Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2">
                      {aiInsights.maintenanceTips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* No AI Insights Message */}
        {!aiInsights && vehicle?.autoFilled && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                AI insights are being processed or unavailable for this vehicle.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Data Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Parts Ledger
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Sharing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <RecentModifications vehicleId={id!} />
                <MaintenanceTimeline vehicleId={id!} />
                <SmartMaintenancePanel 
                  vin={vehicle?.vin || ""} 
                  mileage={vehicle?.mileage}
                />
                <UpcomingMaintenance vehicleId={id!} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <PhotoGallery vehicleId={id!} />
                <CostSummary vehicleId={id!} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parts" className="mt-6">
            <VehiclePartsLedger vehicleId={id!} />
          </TabsContent>
          
          <TabsContent value="media" className="mt-6">
            <VehicleMediaPipeline vehicleId={id!} />
          </TabsContent>
          
          <TabsContent value="sharing" className="mt-6">
            <PublicVehicleShare vehicleId={id!} />
          </TabsContent>
        </Tabs>

        {/* Public Notice */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Public Profile:</strong> This vehicle profile is public and shows modifications, maintenance logs, photos, and technical details. Private financial information like invoices remains confidential to the owner.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}