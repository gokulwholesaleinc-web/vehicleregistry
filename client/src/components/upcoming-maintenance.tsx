import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { type UpcomingMaintenance as UpcomingMaintenanceType, type Vehicle } from "@shared/schema";

interface UpcomingMaintenanceProps {
  vehicleId: string;
}

export default function UpcomingMaintenance({ vehicleId }: UpcomingMaintenanceProps) {
  const { data: upcomingItems = [] } = useQuery<UpcomingMaintenanceType[]>({
    queryKey: ["/api/v1/vehicles", vehicleId, "upcoming-maintenance"],
    enabled: !!vehicleId,
  });

  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ["/api/v1/vehicles", vehicleId],
    enabled: !!vehicleId,
  });

  // Calculate miles remaining for each item
  const itemsWithRemaining = upcomingItems.map(item => ({
    ...item,
    milesRemaining: item.dueMileage - (vehicle?.currentMileage || 0)
  }));

  const urgentItems = itemsWithRemaining.filter(item => item.milesRemaining <= 5000);
  const futureItems = itemsWithRemaining.filter(item => item.milesRemaining > 5000);

  return (
    <Card data-testid="card-upcoming-maintenance">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Maintenance</h3>
      </CardHeader>
      <CardContent>
        {itemsWithRemaining.length === 0 ? (
          <div className="text-center py-4 text-steel-gray-600 text-sm" data-testid="text-no-upcoming-maintenance">
            No upcoming maintenance scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                data-testid={`upcoming-maintenance-urgent-${item.id}`}
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900" data-testid={`text-upcoming-service-${item.id}`}>
                    {item.serviceType}
                  </p>
                  <p className="text-sm text-steel-gray-600" data-testid={`text-upcoming-due-mileage-${item.id}`}>
                    Due at {item.dueMileage.toLocaleString()} miles
                  </p>
                </div>
                <span className="text-sm text-yellow-700 font-medium" data-testid={`text-upcoming-miles-remaining-${item.id}`}>
                  {item.milesRemaining > 0 ? `${item.milesRemaining.toLocaleString()} mi` : "Overdue"}
                </span>
              </div>
            ))}
            
            {futureItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                data-testid={`upcoming-maintenance-future-${item.id}`}
              >
                <Info className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900" data-testid={`text-upcoming-service-${item.id}`}>
                    {item.serviceType}
                  </p>
                  <p className="text-sm text-steel-gray-600" data-testid={`text-upcoming-due-mileage-${item.id}`}>
                    Due at {item.dueMileage.toLocaleString()} miles
                  </p>
                </div>
                <span className="text-sm text-blue-700 font-medium" data-testid={`text-upcoming-miles-remaining-${item.id}`}>
                  {item.milesRemaining.toLocaleString()} mi
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
