import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleStatsDisplay } from "@/components/VehicleStatsDisplay";
import { ExternalLink, Eye } from "lucide-react";

export default function ShowcasePage() {
  const { data: vehicles, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/showcase/vehicles"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Community Showcase
          </h1>
          <p className="text-muted-foreground">
            Discover amazing builds from the VINtage Garage community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Community Showcase
        </h1>
        <p className="text-muted-foreground">
          Discover amazing builds from the VINtage Garage community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.data?.map((vehicle: any) => (
          <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-vehicle-${vehicle.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg" data-testid={`text-vehicle-title-${vehicle.id}`}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    By {vehicle.currentOwner?.firstName} {vehicle.currentOwner?.lastName}
                  </p>
                </div>
                {vehicle.isModified && (
                  <Badge variant="secondary" className="ml-2">
                    Modified
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pb-3">
              {vehicle.thumbnailUrl ? (
                <img
                  src={vehicle.thumbnailUrl}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-48 object-cover rounded-md"
                  data-testid={`img-vehicle-${vehicle.id}`}
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}

              {vehicle.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {vehicle.description}
                </p>
              )}
            </CardContent>

            <CardFooter className="pt-3 border-t">
              <div className="w-full space-y-3">
                <VehicleStatsDisplay
                  stats={vehicle.stats || { likes: 0, follows: 0, comments: 0 }}
                  showActions={false}
                />
                
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to={`/public/${vehicle.vin}`} data-testid={`link-view-build-${vehicle.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Build
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/public/${vehicle.vin}/share`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-share-${vehicle.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!vehicles?.data || vehicles.data.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No public builds yet
          </h3>
          <p className="text-muted-foreground">
            Be the first to share your build with the community!
          </p>
        </div>
      )}
    </div>
  );
}