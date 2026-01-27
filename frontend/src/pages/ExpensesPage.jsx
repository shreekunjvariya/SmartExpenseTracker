import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Trash2,
  Edit,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ExpensesPage = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [formData, setFormData] = useState({
    amount: "",
    currency: user?.preferred_currency || "USD",
    description: "",
    category_id: "",
    subcategory_id: "",
    date: new Date(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/expenses`, { credentials: "include" }),
        fetch(`${API_URL}/api/categories`, { credentials: "include" }),
      ]);

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: formData.date.toISOString(),
      subcategory_id: formData.subcategory_id || null,
    };

    try {
      const url = editingExpense
        ? `${API_URL}/api/expenses/${editingExpense.expense_id}`
        : `${API_URL}/api/expenses`;

      const response = await fetch(url, {
        method: editingExpense ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save expense");

      toast.success(editingExpense ? "Expense updated!" : "Expense added!");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`${API_URL}/api/expenses/${expenseId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete expense");

      toast.success("Expense deleted!");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      currency: expense.currency,
      description: expense.description,
      category_id: expense.category_id,
      subcategory_id: expense.subcategory_id || "",
      date: new Date(expense.date),
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      amount: "",
      currency: user?.preferred_currency || "USD",
      description: "",
      category_id: "",
      subcategory_id: "",
      date: new Date(),
    });
  };

  const getCategory = (categoryId) =>
    categories.find((c) => c.category_id === categoryId);

  const getSubcategory = (categoryId, subcategoryId) => {
    const cat = getCategory(categoryId);
    return cat?.subcategories?.find((s) => s.subcategory_id === subcategoryId);
  };

  const selectedCategory = getCategory(formData.category_id);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || exp.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="expenses-page">
      <Sidebar user={user} />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your spending
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-full px-6"
                data-testid="add-expense-dialog-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="mt-1"
                      required
                      data-testid="expense-amount-input"
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger className="mt-1" data-testid="expense-currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What did you spend on?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1"
                    required
                    data-testid="expense-description-input"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category_id: value,
                        subcategory_id: "",
                      })
                    }
                  >
                    <SelectTrigger className="mt-1" data-testid="expense-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory?.subcategories?.length > 0 && (
                  <div>
                    <Label>Subcategory (Optional)</Label>
                    <Select
                      value={formData.subcategory_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subcategory_id: value })
                      }
                    >
                      <SelectTrigger className="mt-1" data-testid="expense-subcategory-select">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((sub) => (
                          <SelectItem
                            key={sub.subcategory_id}
                            value={sub.subcategory_id}
                          >
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 justify-start text-left font-normal"
                        data-testid="expense-date-btn"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          date && setFormData({ ...formData, date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#064E3B] hover:bg-[#064E3B]/90"
                  data-testid="expense-submit-btn"
                >
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="expense-search-input"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="expense-filter-select">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expenses List */}
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading expenses...
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No expenses found. Add your first expense!
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {filteredExpenses.map((expense) => {
                  const category = getCategory(expense.category_id);
                  const subcategory = getSubcategory(
                    expense.category_id,
                    expense.subcategory_id
                  );
                  return (
                    <div
                      key={expense.expense_id}
                      className="p-4 sm:p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
                      data-testid={`expense-item-${expense.expense_id}`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: category?.color || "#064E3B" }}
                        >
                          <span className="text-white text-sm font-bold">
                            {category?.name?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {expense.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {category?.name}
                            {subcategory && ` › ${subcategory.name}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold font-mono">
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-[#064E3B]"
                            onClick={() => handleEdit(expense)}
                            data-testid={`edit-expense-${expense.expense_id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(expense.expense_id)}
                            data-testid={`delete-expense-${expense.expense_id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExpensesPage;
