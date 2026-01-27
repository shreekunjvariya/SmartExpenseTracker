import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  FolderTree,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ["#064E3B", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6"];

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`, { credentials: "include" }),
        fetch(`${API_URL}/api/reports/summary?period=month`, { credentials: "include" }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: user?.preferred_currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statCards = [
    {
      title: "This Month",
      value: formatCurrency(stats?.this_month?.total),
      subtext: `${stats?.this_month?.count || 0} expenses`,
      icon: <Wallet className="w-5 h-5" />,
      trend: stats?.change_percentage > 0 ? "up" : "down",
      trendValue: Math.abs(stats?.change_percentage || 0),
    },
    {
      title: "Last Month",
      value: formatCurrency(stats?.last_month?.total),
      subtext: `${stats?.last_month?.count || 0} expenses`,
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      title: "All Time",
      value: formatCurrency(stats?.all_time?.total),
      subtext: `${stats?.all_time?.count || 0} total expenses`,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: "Categories",
      value: stats?.categories_count || 0,
      subtext: "Active categories",
      icon: <FolderTree className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="dashboard-page">
      <Sidebar user={user} />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </p>
          </div>
          <Link to="/expenses">
            <Button
              className="bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-full px-6"
              data-testid="add-expense-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
              data-testid={`stat-card-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-[#D9F99D] rounded-xl flex items-center justify-center text-[#064E3B]">
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === "up" ? "text-destructive" : "text-[#10B981]"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {stat.trendValue}%
                    </div>
                  )}
                </div>
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Breakdown */}
          <Card className="lg:col-span-1 rounded-xl border border-[#E5E7EB] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">By Category</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.by_category?.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.by_category}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {summary.by_category.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No expense data yet
                </div>
              )}
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {summary?.by_category?.slice(0, 4).map((cat, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: cat.color || COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-mono font-medium">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend */}
          <Card className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Daily Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.daily_trend?.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.daily_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#064E3B"
                        strokeWidth={2}
                        dot={{ fill: "#064E3B", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#D9F99D", stroke: "#064E3B" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/expenses" className="block">
            <Card className="rounded-xl border border-[#E5E7EB] bg-white hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold">View All Expenses</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your expense history
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#064E3B]" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/categories" className="block">
            <Card className="rounded-xl border border-[#E5E7EB] bg-white hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold">Manage Categories</p>
                  <p className="text-sm text-muted-foreground">
                    Customize your expense categories
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#064E3B]" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports" className="block">
            <Card className="rounded-xl border border-[#E5E7EB] bg-white hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold">Generate Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Export and analyze your data
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#064E3B]" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
