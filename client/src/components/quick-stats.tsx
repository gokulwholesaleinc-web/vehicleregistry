import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Wrench, ClipboardList, Camera } from "lucide-react";

interface QuickStatsProps {
  vehicleId: string;
}

interface VehicleStats {
  totalSpent: string;
  modificationsCount: number;
  serviceRecordsCount: number;
  photosCount: number;
}

export default function QuickStats({ vehicleId }: QuickStatsProps) {
  const { data: stats, isLoading } = useQuery<VehicleStats>({
    queryKey: ["/api/vehicles", vehicleId, "stats"],
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Spent",
      value: `$${stats.totalSpent}`,
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      testId: "stat-total-spent"
    },
    {
      label: "Modifications",
      value: stats.modificationsCount.toString(),
      icon: Wrench,
      bgColor: "bg-automotive-blue-100",
      iconColor: "text-automotive-blue-600",
      testId: "stat-modifications"
    },
    {
      label: "Service Records",
      value: stats.serviceRecordsCount.toString(),
      icon: ClipboardList,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      testId: "stat-service-records"
    },
    {
      label: "Photos",
      value: stats.photosCount.toString(),
      icon: Camera,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      testId: "stat-photos"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-steel-gray-600 text-sm font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900" data-testid={item.testId}>
                  {item.value}
                </p>
              </div>
              <div className={`${item.bgColor} p-3 rounded-lg`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
