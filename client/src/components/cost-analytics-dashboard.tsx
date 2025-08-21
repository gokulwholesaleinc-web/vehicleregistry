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

  // Mock cost data
  const costBreakdown = [
    { name: "Maintenance", value: 2400, color: "#3b82f6", icon: Wrench },
    { name: "Modifications", value: 3200, color: "#8b5cf6", icon: Settings },
    { name: "Fuel", value: 1800, color: "#ef4444", icon: Fuel },
    { name: "Insurance", value: 1200, color: "#10b981", icon: Target }
  ];

  const monthlySpending = [
    { month: "Jan", maintenance: 400, modifications: 800, fuel: 300, total: 1500 },
    { month: "Feb", maintenance: 150, modifications: 0, fuel: 280, total: 430 },
    { month: "Mar", maintenance: 600, modifications: 1200, fuel: 320, total: 2120 },
    { month: "Apr", maintenance: 200, modifications: 400, fuel: 290, total: 890 },
    { month: "May", maintenance: 800, modifications: 800, fuel: 310, total: 1910 },
    { month: "Jun", maintenance: 250, modifications: 0, fuel: 300, total: 550 }
  ];

  const modificationROI = [
    {
      modification: "Cold Air Intake",
      cost: 450,
      valueAdded: 675,
      roi: 50,
      category: "Performance"
    },
    {
      modification: "Exhaust System",
      cost: 1200,
      valueAdded: 1440,
      roi: 20,
      category: "Performance"
    },
    {
      modification: "Suspension Upgrade",
      cost: 2200,
      valueAdded: 2420,
      roi: 10,
      category: "Handling"
    },
    {
      modification: "Wheels & Tires",
      cost: 1800,
      valueAdded: 1980,
      roi: 10,
      category: "Aesthetic"
    }
  ];

  const budgetData = {
    monthlyBudget: 1500,
    currentSpending: 1240,
    projectedSpending: 1680,
    alerts: [
      {
        type: "warning",
        message: "Projected to exceed budget by $180 this month",
        category: "modifications"
      },
      {
        type: "info", 
        message: "Maintenance costs are 15% below average",
        category: "maintenance"
      }
    ]
  };

  const totalCosts = useMemo(() => {
    return costBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [costBreakdown]);

  const averageMonthlySpending = useMemo(() => {
    return monthlySpending.reduce((sum, month) => sum + month.total, 0) / monthlySpending.length;
  }, [monthlySpending]);

  const budgetProgress = (budgetData.currentSpending / budgetData.monthlyBudget) * 100;
  const projectedProgress = (budgetData.projectedSpending / budgetData.monthlyBudget) * 100;

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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-bold text-blue-600">${Math.round(averageMonthlySpending)}</p>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Value Added</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${modificationROI.reduce((sum, mod) => sum + mod.valueAdded - mod.cost, 0)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg ROI</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(modificationROI.reduce((sum, mod) => sum + mod.roi, 0) / modificationROI.length)}%
                  </p>
                </CardContent>
              </Card>
            </div>

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
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Spending Trend */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySpending}>
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
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6 mt-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="maintenance" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="modifications" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="fuel" stackId="a" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {costBreakdown.map((category, index) => (
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
          </TabsContent>

          <TabsContent value="roi" className="space-y-6 mt-6">
            <div className="space-y-4">
              {modificationROI.map((mod, index) => (
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
                        <p className="text-lg font-bold text-green-600">
                          +{mod.roi}% ROI
                        </p>
                        <p className="text-sm text-gray-500">
                          +${mod.valueAdded - mod.cost} value
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Cost</p>
                        <p className="font-semibold">${mod.cost}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Value Added</p>
                        <p className="font-semibold">${mod.valueAdded}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ROI</p>
                        <p className="font-semibold text-green-600">+{mod.roi}%</p>
                      </div>
                    </div>
                    
                    <Progress value={mod.roi} className="mt-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6 mt-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                  <span>Monthly Budget Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current Spending</span>
                    <span className="font-semibold">${budgetData.currentSpending} / ${budgetData.monthlyBudget}</span>
                  </div>
                  <Progress value={budgetProgress} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {budgetProgress.toFixed(1)}% of budget used
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span>Projected End of Month</span>
                    <span className={`font-semibold ${projectedProgress > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      ${budgetData.projectedSpending} / ${budgetData.monthlyBudget}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(projectedProgress, 100)} 
                    className={`h-3 ${projectedProgress > 100 ? '[&>div]:bg-red-500' : ''}`} 
                  />
                  {projectedProgress > 100 && (
                    <p className="text-sm text-red-600">
                      Projected to exceed budget by ${budgetData.projectedSpending - budgetData.monthlyBudget}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg">Budget Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetData.alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <AlertCircle 
                        className={`w-5 h-5 mt-0.5 ${
                          alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} 
                      />
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {alert.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}