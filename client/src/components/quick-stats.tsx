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
    queryKey: ["/api/v1/vehicles", vehicleId, "stats"],
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-modern">
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
      {statItems.map((item) => (
        <Card key={item.label} className="card-modern card-hover group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{item.label}</p>
                <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid={item.testId}>
                  {item.value}
                </p>
              </div>
              <div className={`${item.bgColor} dark:bg-opacity-20 p-3 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mx-auto sm:mx-0`}>
                <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.iconColor} dark:opacity-90`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
