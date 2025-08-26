import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  Calendar,
  Wrench,
  Settings,
  Fuel,
  PiggyBank
} from "lucide-react";

interface CostAnalyticsDashboardProps {
  vehicleId: string;
}

export default function CostAnalyticsDashboard({ vehicleId }: CostAnalyticsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  // Fetch actual vehicle data
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

  const { data: modifications } = useQuery({
    queryKey: ['/api/v1/vehicles', vehicleId, 'modifications'],
    queryFn: () => fetch(`/api/v1/vehicles/${vehicleId}/modifications`).then(r => r.json()),
    enabled: !!vehicleId,
  });

  // Calculate real costs from actual data
  const realCostBreakdown = useMemo(() => {
    const maintenanceTotal = maintenanceRecords?.data?.reduce((sum: number, record: any) => 
      sum + (parseFloat(record.cost) || 0), 0) || 0;
    
    const modificationsTotal = modifications?.data?.reduce((sum: number, mod: any) => 
      sum + (parseFloat(mod.cost) || 0), 0) || 0;

    return [
      { name: "Maintenance", value: maintenanceTotal, color: "#3b82f6", icon: Wrench },
      { name: "Modifications", value: modificationsTotal, color: "#8b5cf6", icon: Settings }
    ].filter(item => item.value > 0);
  }, [maintenanceRecords, modifications]);

  // Calculate monthly spending from real data
  const realMonthlySpending = useMemo(() => {
    if (!maintenanceRecords?.data && !modifications?.data) return [];
    
    const allRecords = [
      ...(maintenanceRecords?.data || []).map((r: any) => ({
        ...r, 
        type: 'maintenance',
        date: r.serviceDate || r.createdAt
      })),
      ...(modifications?.data || []).map((m: any) => ({
        ...m, 
        type: 'modification',
        date: m.installDate || m.createdAt
      }))
    ];

    const monthlyData: { [key: string]: { maintenance: number, modifications: number, total: number } } = {};
    
    allRecords.forEach((record: any) => {
      if (!record.date) return;
      const date = new Date(record.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const cost = parseFloat(record.cost) || 0;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { maintenance: 0, modifications: 0, total: 0 };
      }
      
      if (record.type === 'maintenance') {
        monthlyData[monthKey].maintenance += cost;
      } else {
        monthlyData[monthKey].modifications += cost;
      }
      monthlyData[monthKey].total += cost;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [maintenanceRecords, modifications]);

  // Calculate modification ROI from real data
  const realModificationROI = useMemo(() => {
    if (!modifications?.data) return [];
    
    return modifications.data.map((mod: any) => ({
      modification: mod.title,
      cost: parseFloat(mod.cost) || 0,
      valueAdded: parseFloat(mod.cost) || 0, // Conservative estimate
      roi: 0, // Cannot determine real ROI without market data
      category: mod.category || "Other"
    }));
  }, [modifications]);

  const totalCosts = useMemo(() => {
    return realCostBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [realCostBreakdown]);

  const averageMonthlySpending = useMemo(() => {
    if (realMonthlySpending.length === 0) return 0;
    return realMonthlySpending.reduce((sum, month) => sum + month.total, 0) / realMonthlySpending.length;
  }, [realMonthlySpending]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span>Cost Analytics Dashboard</span>
        </CardTitle>
        <CardDescription>
          Comprehensive financial insights and ROI analysis for your vehicle
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="budget">Budget Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {totalCosts > 0 ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="card-modern">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">${totalCosts.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="card-modern">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Avg</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ${Math.round(averageMonthlySpending) || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Cost Data Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add maintenance records and modifications to see cost analytics for your vehicle.
                  </p>
                </CardContent>
              </Card>
            )}

            {realCostBreakdown.length > 0 && (
              <>
                {/* Cost Breakdown Pie Chart */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={realCostBreakdown}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {realCostBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {realMonthlySpending.length > 0 && (
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={realMonthlySpending}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6 mt-6">
            {realMonthlySpending.length > 0 ? (
              <>
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="text-lg">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={realMonthlySpending}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="maintenance" stackId="a" fill="#3b82f6" />
                          <Bar dataKey="modifications" stackId="a" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {realCostBreakdown.map((category, index) => (
                    <Card key={category.name} className="card-modern">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <category.icon className="w-5 h-5" style={{ color: category.color }} />
                            <h3 className="font-semibold">{category.name}</h3>
                          </div>
                          <span className="text-lg font-bold" style={{ color: category.color }}>
                            ${category.value.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(category.value / totalCosts) * 100} 
                          className="mb-2"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {((category.value / totalCosts) * 100).toFixed(1)}% of total spending
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Breakdown Data Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add maintenance and modification records to see spending breakdown by category.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="roi" className="space-y-6 mt-6">
            {realModificationROI.length > 0 ? (
              <div className="space-y-4">
                {realModificationROI.map((mod, index) => (
                  <Card key={index} className="card-modern card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{mod.modification}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {mod.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-600">
                            Cost: ${mod.cost}
                          </p>
                          <p className="text-sm text-gray-500">
                            ROI data unavailable
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Investment</p>
                          <p className="font-semibold">${mod.cost}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-semibold">{mod.category}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ROI calculation requires market valuation data which is not available with current records.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-modern">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No ROI Data Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add modification records to see return on investment analysis for your vehicle upgrades.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6 mt-6">
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Budget Planning Not Available
                </h3>
                <p className="text-sm text-gray-500">
                  Budget tracking requires user-defined monthly budgets and spending goals. 
                  This feature would need to be configured based on individual financial preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}