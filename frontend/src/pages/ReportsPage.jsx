import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, subDays } from "date-fns";
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
  CartesianGrid,
  Legend,
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ["#064E3B", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6"];

const ReportsPage = ({ user }) => {
  const [period, setPeriod] = useState("month");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [period]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/reports/summary?period=${period}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await fetch(
        `${API_URL}/api/reports/export?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export successful!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Please paste CSV data first");
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ csv_data: importData }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Import failed");

      toast.success(`Imported ${data.imported} expenses!`);
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} rows had errors`);
      }
      setImportData("");
      fetchSummary();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setImporting(false);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="reports-page">
      <Sidebar user={user} />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and export data
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-[#E5E7EB]">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="export" data-testid="tab-export">
              Export
            </TabsTrigger>
            <TabsTrigger value="import" data-testid="tab-import">
              Import
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Period Selection */}
            <div className="flex gap-2">
              {["week", "month", "year"].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  className={
                    period === p
                      ? "bg-[#064E3B] hover:bg-[#064E3B]/90"
                      : ""
                  }
                  onClick={() => setPeriod(p)}
                  data-testid={`period-${p}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                    Total Spent ({period})
                  </p>
                  <p className="text-3xl font-bold font-mono">
                    {formatCurrency(summary?.total)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {summary?.count || 0} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                    Top Category
                  </p>
                  {summary?.by_category?.length > 0 ? (
                    <>
                      <p className="text-xl font-bold">
                        {summary.by_category[0].name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(summary.by_category[0].total)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                    Daily Average
                  </p>
                  <p className="text-3xl font-bold font-mono">
                    {formatCurrency(
                      (summary?.total || 0) /
                        (period === "week" ? 7 : period === "month" ? 30 : 365)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">per day</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.by_category?.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.by_category}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
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
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No expense data for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Category Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.by_category?.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summary.by_category} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #E5E7EB",
                            }}
                          />
                          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                            {summary.by_category.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color || COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No expense data for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Details */}
            {summary?.by_category?.length > 0 && (
              <Card className="rounded-xl border border-[#E5E7EB] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Detailed Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-[#E5E7EB]">
                    {summary.by_category.map((cat, index) => (
                      <div
                        key={index}
                        className="py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor:
                                cat.color || COLORS[index % COLORS.length],
                            }}
                          />
                          <div>
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {cat.count} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono">
                            {formatCurrency(cat.total)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {((cat.total / summary.total) * 100).toFixed(1)}% of
                            total
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="rounded-xl border border-[#E5E7EB] bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Expenses to CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a date range to export your expenses as a CSV file.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">From</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[200px] justify-start"
                            data-testid="export-from-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateRange.from, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) =>
                              date && setDateRange({ ...dateRange, from: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">To</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[200px] justify-start"
                            data-testid="export-to-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateRange.to, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) =>
                              date && setDateRange({ ...dateRange, to: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  className="bg-[#064E3B] hover:bg-[#064E3B]/90"
                  data-testid="export-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>

                <div className="bg-[#F9FAFB] rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">CSV Format:</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    Date, Description, Amount, Currency, Category, Subcategory
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card className="rounded-xl border border-[#E5E7EB] bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Expenses from CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#F9FAFB] rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Required CSV Format:</p>
                  <code className="text-xs text-muted-foreground font-mono block">
                    Date,Description,Amount,Currency,Category,Subcategory
                  </code>
                  <code className="text-xs text-muted-foreground font-mono block mt-1">
                    2024-01-15,Coffee,5.50,USD,Food & Dining,Coffee & Snacks
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Category names must match your existing categories exactly.
                  </p>
                </div>

                <div>
                  <Textarea
                    placeholder="Paste your CSV data here (including header row)..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="import-textarea"
                  />
                </div>

                <Button
                  onClick={handleImport}
                  disabled={importing || !importData.trim()}
                  className="bg-[#064E3B] hover:bg-[#064E3B]/90"
                  data-testid="import-btn"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Expenses
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReportsPage;
