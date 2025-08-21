import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Modification } from "@shared/schema";

interface RecentModificationsProps {
  vehicleId: string;
}

export default function RecentModifications({ vehicleId }: RecentModificationsProps) {
  const { data: modifications = [], isLoading } = useQuery<Modification[]>({
    queryKey: ["/api/vehicles", vehicleId, "modifications"],
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentMods = modifications.slice(0, 3);

  return (
    <Card data-testid="card-recent-modifications">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Modifications</h3>
          <Button variant="link" className="text-automotive-blue-600 hover:text-automotive-blue-700 p-0" data-testid="link-view-all-modifications">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentMods.length === 0 ? (
          <div className="text-center py-8 text-steel-gray-600" data-testid="text-no-modifications">
            No modifications recorded yet. Add your first modification to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentMods.map((mod) => (
              <div key={mod.id} className="py-6 hover:bg-gray-50 transition-colors" data-testid={`modification-${mod.id}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {mod.photos && mod.photos.length > 0 ? (
                      <img 
                        src={mod.photos[0]} 
                        alt={mod.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        data-testid={`img-modification-${mod.id}`}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">No Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900" data-testid={`text-modification-title-${mod.id}`}>
                          {mod.title}
                        </h4>
                        <p className="text-steel-gray-600 text-sm mt-1" data-testid={`text-modification-category-${mod.id}`}>
                          {mod.category}
                        </p>
                        {mod.description && (
                          <p className="text-steel-gray-600 text-sm mt-2" data-testid={`text-modification-description-${mod.id}`}>
                            {mod.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900" data-testid={`text-modification-cost-${mod.id}`}>
                          ${parseFloat(mod.cost).toFixed(2)}
                        </p>
                        <p className="text-steel-gray-500 text-sm" data-testid={`text-modification-date-${mod.id}`}>
                          {mod.installDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge 
                        variant={mod.status === "installed" ? "default" : "secondary"}
                        className={mod.status === "installed" ? "bg-automotive-blue-100 text-automotive-blue-800" : ""}
                        data-testid={`badge-modification-status-${mod.id}`}
                      >
                        {mod.status.charAt(0).toUpperCase() + mod.status.slice(1)}
                      </Badge>
                      {mod.photos && mod.photos.length > 0 && (
                        <span className="text-steel-gray-500 text-sm" data-testid={`text-modification-photos-${mod.id}`}>
                          {mod.photos.length} photos
                        </span>
                      )}
                      {mod.documents && mod.documents.length > 0 && (
                        <span className="text-steel-gray-500 text-sm" data-testid={`text-modification-documents-${mod.id}`}>
                          Invoice attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
