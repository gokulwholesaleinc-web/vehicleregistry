import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type MaintenanceRecord } from "@shared/schema";

interface MaintenanceTimelineProps {
  vehicleId: string;
}

export default function MaintenanceTimeline({ vehicleId }: MaintenanceTimelineProps) {
  const { data: records = [], isLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/v1/vehicles", vehicleId, "maintenance"],
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
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-3 h-3 bg-gray-200 rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentRecords = records.slice(0, 5);

  return (
    <Card data-testid="card-maintenance-timeline">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Timeline</h3>
          <Button 
            className="bg-automotive-blue-600 text-white hover:bg-automotive-blue-700"
            data-testid="button-add-maintenance-record"
          >
            Add Record
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-steel-gray-600" data-testid="text-no-maintenance-records">
            No maintenance records yet. Add your first maintenance record to track your vehicle's service history!
          </div>
        ) : (
          <div className="space-y-6">
            {recentRecords.map((record, index) => (
              <div key={record.id} className="flex items-start space-x-4" data-testid={`maintenance-record-${record.id}`}>
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-automotive-blue-600 rounded-full mt-2"></div>
                  {index < recentRecords.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-300 mx-auto mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900" data-testid={`text-maintenance-service-type-${record.id}`}>
                        {record.serviceType}
                      </h4>
                      {record.description && (
                        <p className="text-steel-gray-600 text-sm mt-1" data-testid={`text-maintenance-description-${record.id}`}>
                          {record.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-steel-gray-500">
                        <span data-testid={`text-maintenance-mileage-${record.id}`}>
                          {record.mileage.toLocaleString()} miles
                        </span>
                        {record.shop && (
                          <span data-testid={`text-maintenance-shop-${record.id}`}>
                            {record.shop}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900" data-testid={`text-maintenance-cost-${record.id}`}>
                        ${parseFloat(record.cost).toFixed(2)}
                      </p>
                      <p className="text-steel-gray-500 text-sm" data-testid={`text-maintenance-date-${record.id}`}>
                        {record.serviceDate}
                      </p>
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
