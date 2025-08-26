import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CostSummaryProps {
  vehicleId: string;
}

interface VehicleStats {
  spending: {
    modifications: string;
    maintenance: string;
    repairs: string;
    totalYear: string;
  };
}

export default function CostSummary({ vehicleId }: CostSummaryProps) {
  const { data: stats, isLoading } = useQuery<VehicleStats>({
    queryKey: ["/api/v1/vehicles", vehicleId, "stats"],
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const summaryItems = [
    {
      label: "Modifications",
      amount: stats.spending.modifications,
      color: "bg-automotive-blue-600",
      testId: "spending-modifications"
    },
    {
      label: "Maintenance",
      amount: stats.spending.maintenance,
      color: "bg-orange-500",
      testId: "spending-maintenance"
    },
    {
      label: "Repairs",
      amount: stats.spending.repairs,
      color: "bg-green-500",
      testId: "spending-repairs"
    },
  ];

  return (
    <Card data-testid="card-cost-summary">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Spending Summary</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-steel-gray-700">{item.label}</span>
              </div>
              <span className="font-semibold text-gray-900" data-testid={item.testId}>
                ${item.amount}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total This Year</span>
              <span className="font-bold text-lg text-automotive-blue-600" data-testid="spending-total-year">
                ${stats.spending.totalYear}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
