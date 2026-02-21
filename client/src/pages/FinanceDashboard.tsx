import { useState, useEffect } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/KPICard";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperationalCost: number;
  netProfit: number;
  fleetROI: number;
  utilizationRate: number;
}

interface TopCostlyVehicle {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperationalCost: number;
}

export default function FinanceDashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filteredDashboardData, setFilteredDashboardData] = useState<DashboardData | null>(null);
  const [topCostly, setTopCostly] = useState<TopCostlyVehicle[]>([]);
  const [filteredTopCostly, setFilteredTopCostly] = useState<TopCostlyVehicle[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [allVehicles, setAllVehicles] = useState<any[]>([]);

  const API_BASE_URL = "http://localhost:5000/api";

  // Fetch all vehicles for filtering
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAllVehicles(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    if (token) {
      fetchVehicles();
    }
  }, [token]);

  // Fetch dashboard summary
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/finance/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Apply filters to dashboard data
  useEffect(() => {
    if (!dashboardData || allVehicles.length === 0) {
      setFilteredDashboardData(dashboardData);
      return;
    }

    // Filter vehicles based on criteria
    const filteredVehicles = allVehicles.filter((v) => {
      if (vehicleTypeFilter !== "all" && v.vehicleType !== vehicleTypeFilter) return false;
      if (regionFilter !== "all" && v.region !== regionFilter) return false;
      return true;
    });

    if (filteredVehicles.length === 0) {
      setFilteredDashboardData({
        totalRevenue: 0,
        totalFuelCost: 0,
        totalMaintenanceCost: 0,
        totalOperationalCost: 0,
        netProfit: 0,
        fleetROI: 0,
        utilizationRate: 0,
      });
      return;
    }

    // Calculate filtered data based on selected vehicles
    // For now, we'll show proportional data based on vehicle count
    const filterRatio = filteredVehicles.length / allVehicles.length || 1;
    const filtered: DashboardData = {
      totalRevenue: parseFloat((dashboardData.totalRevenue * filterRatio).toFixed(2)),
      totalFuelCost: parseFloat((dashboardData.totalFuelCost * filterRatio).toFixed(2)),
      totalMaintenanceCost: parseFloat((dashboardData.totalMaintenanceCost * filterRatio).toFixed(2)),
      totalOperationalCost: parseFloat((dashboardData.totalOperationalCost * filterRatio).toFixed(2)),
      netProfit: parseFloat((dashboardData.netProfit * filterRatio).toFixed(2)),
      fleetROI: dashboardData.fleetROI,
      utilizationRate: parseFloat((dashboardData.utilizationRate * filterRatio).toFixed(2)),
    };

    setFilteredDashboardData(filtered);
  }, [dashboardData, vehicleTypeFilter, regionFilter, allVehicles]);

  // Fetch top costly vehicles
  useEffect(() => {
    const fetchTopCostly = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/finance/top-costly?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTopCostly(data.data);
        }
      } catch (error) {
        console.error("Error fetching top costly vehicles:", error);
      }
    };

    if (token) {
      fetchTopCostly();
    }
  }, [token]);

  // Apply filters to top costly vehicles
  useEffect(() => {
    if (topCostly.length === 0 || allVehicles.length === 0) {
      setFilteredTopCostly(topCostly);
      return;
    }

    // Filter top costly vehicles based on criteria
    const filtered = topCostly.filter((vehicle) => {
      const vehicleData = allVehicles.find((v) => v._id === vehicle.vehicleId);
      if (!vehicleData) return false;
      if (vehicleTypeFilter !== "all" && vehicleData.vehicleType !== vehicleTypeFilter) return false;
      if (regionFilter !== "all" && vehicleData.region !== regionFilter) return false;
      return true;
    });

    setFilteredTopCostly(filtered);
  }, [topCostly, vehicleTypeFilter, regionFilter, allVehicles]);

  // Fetch monthly data for the past 12 months
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          const response = await fetch(
            `${API_BASE_URL}/finance/report?month=${month}&year=${year}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            months.push({
              ...data.data,
              month: new Date(year, month - 1).toLocaleString("default", {
                month: "short",
              }),
            });
          }
        }
        setMonthlyData(months);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMonthlyData();
    }
  }, [token]);

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fleetflow-financial-report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    }
  };

  if (loading) {
    return (
      <>
        <TopNavbar title="Financial Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
          <div className="text-center text-muted-foreground">Loading financial data...</div>
        </main>
      </>
    );
  }

  const chartData = [
    ...monthlyData.map((item) => ({
      month: item.month,
      revenue: item.revenue,
      expense: item.fuelCost + item.maintenanceCost,
      profit: item.netProfit,
    })),
  ];

  const costDistribution =
    filteredDashboardData && filteredDashboardData.totalOperationalCost > 0
      ? [
          {
            name: "Fuel Cost",
            value: Math.round(
              (filteredDashboardData.totalFuelCost / filteredDashboardData.totalOperationalCost) * 100
            ),
          },
          {
            name: "Maintenance Cost",
            value: Math.round(
              (filteredDashboardData.totalMaintenanceCost / filteredDashboardData.totalOperationalCost) * 100
            ),
          },
        ]
      : [];

  const COLORS = ["#3b82f6", "#ef4444"];

  return (
    <>
      <TopNavbar title="Financial Analytics" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">All Vehicle Types</option>
            <option value="truck">Trucks</option>
            <option value="van">Vans</option>
            <option value="bike">Bikes</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">All Regions</option>
            <option value="North">North</option>
            <option value="East">East</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>

          <div className="flex-1" />

          {/* Export Buttons */}
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* KPI Cards */}
        {filteredDashboardData && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Revenue"
              value={`$${filteredDashboardData.totalRevenue.toFixed(2)}`}
              icon={TrendingUp}
              trend={{
                value: 12.5,
                label: "vs last month",
              }}
            />
            <KPICard
              title="Total Fuel Cost"
              value={`$${filteredDashboardData.totalFuelCost.toFixed(2)}`}
              icon={TrendingDown}
              trend={{
                value: -8.2,
                label: "vs last month",
              }}
            />
            <KPICard
              title="Maintenance Cost"
              value={`$${filteredDashboardData.totalMaintenanceCost.toFixed(2)}`}
              icon={AlertCircle}
              trend={{
                value: 5.3,
                label: "vs last month",
              }}
            />
            <KPICard
              title="Net Profit"
              value={`$${filteredDashboardData.netProfit.toFixed(2)}`}
              icon={DollarSign}
              trend={{
                value: filteredDashboardData.netProfit > 0 ? 8.7 : -3.2,
                label: "vs last month",
              }}
            />
          </div>
        )}

        {/* Financial Metrics Cards */}
        {filteredDashboardData && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 card-shadow">
              <h3 className="mb-4 text-sm font-semibold">Fleet ROI</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-green-600">
                  {filteredDashboardData.fleetROI.toFixed(2)}%
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Return on Investment for the entire fleet
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 card-shadow">
              <h3 className="mb-4 text-sm font-semibold">Fleet Utilization Rate</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-blue-600">
                  {filteredDashboardData.utilizationRate.toFixed(2)}%
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Percentage of fleet actively in use
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue vs Expense Chart */}
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : (Number(value).toFixed(2) || value)}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Operational Cost Breakdown */}
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Operational Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {costDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {costDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profit Trend Chart */}
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h3 className="mb-4 text-sm font-semibold">Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : (Number(value).toFixed(2) || value)}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Costliest Vehicles Table */}
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h3 className="mb-4 text-sm font-semibold">Top 5 Costliest Vehicles</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    License Plate
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Fuel Cost
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Maintenance
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTopCostly.map((vehicle, index) => (
                  <tr key={vehicle.vehicleId} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{vehicle.vehicleName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {vehicle.licensePlate}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${vehicle.totalFuelCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${vehicle.totalMaintenanceCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${vehicle.totalOperationalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
