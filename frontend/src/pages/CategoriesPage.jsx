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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { toast } from "sonner";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Tag,
  FolderTree,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PRESET_COLORS = [
  "#064E3B",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

const CategoriesPage = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "folder",
    color: "#064E3B",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    icon: "tag",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `${API_URL}/api/categories/${editingCategory.category_id}`
        : `${API_URL}/api/categories`;

      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryForm),
      });

      if (!response.ok) throw new Error("Failed to save category");

      toast.success(
        editingCategory ? "Category updated!" : "Category created!"
      );
      setDialogOpen(false);
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure? This will also delete all expenses in this category."
      )
    )
      return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      toast.success("Category deleted!");
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${selectedCategoryId}/subcategories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(subcategoryForm),
        }
      );

      if (!response.ok) throw new Error("Failed to add subcategory");

      toast.success("Subcategory added!");
      setSubDialogOpen(false);
      resetSubcategoryForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;

    try {
      const response = await fetch(
        `${API_URL}/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete subcategory");

      toast.success("Subcategory deleted!");
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      icon: "folder",
      color: "#064E3B",
    });
  };

  const resetSubcategoryForm = () => {
    setSelectedCategoryId(null);
    setSubcategoryForm({
      name: "",
      icon: "tag",
    });
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="categories-page">
      <Sidebar user={user} />

      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Organize your expenses with custom categories
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetCategoryForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-[#064E3B] hover:bg-[#064E3B]/90 rounded-full px-6"
                data-testid="add-category-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Transportation"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="mt-1"
                    required
                    data-testid="category-name-input"
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full transition-transform ${
                          categoryForm.color === color
                            ? "ring-2 ring-offset-2 ring-[#064E3B] scale-110"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setCategoryForm({ ...categoryForm, color })
                        }
                        data-testid={`color-${color}`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#064E3B] hover:bg-[#064E3B]/90"
                  data-testid="category-submit-btn"
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subcategory Dialog */}
        <Dialog
          open={subDialogOpen}
          onOpenChange={(open) => {
            setSubDialogOpen(open);
            if (!open) resetSubcategoryForm();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Subcategory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subname">Subcategory Name</Label>
                <Input
                  id="subname"
                  placeholder="e.g., Groceries"
                  value={subcategoryForm.name}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                  data-testid="subcategory-name-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#064E3B] hover:bg-[#064E3B]/90"
                data-testid="subcategory-submit-btn"
              >
                Add Subcategory
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Categories List */}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <Card className="rounded-xl border border-[#E5E7EB] bg-white">
            <CardContent className="p-8 text-center">
              <FolderTree className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No categories yet. Create your first category!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card
                key={category.category_id}
                className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
                data-testid={`category-card-${category.category_id}`}
              >
                <Collapsible
                  open={expandedCategories[category.category_id]}
                  onOpenChange={() => toggleExpanded(category.category_id)}
                >
                  <div className="p-4 sm:p-6 flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-4 flex-1 text-left">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          <FolderTree className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.subcategories?.length || 0} subcategories
                          </p>
                        </div>
                        {expandedCategories[category.category_id] ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedCategoryId(category.category_id);
                          setSubDialogOpen(true);
                        }}
                        data-testid={`add-subcategory-${category.category_id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditCategory(category)}
                        data-testid={`edit-category-${category.category_id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCategory(category.category_id)}
                        data-testid={`delete-category-${category.category_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    {category.subcategories?.length > 0 && (
                      <div className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
                        {category.subcategories.map((sub) => (
                          <div
                            key={sub.subcategory_id}
                            className="px-6 py-3 flex items-center justify-between border-b border-[#E5E7EB] last:border-b-0"
                            data-testid={`subcategory-${sub.subcategory_id}`}
                          >
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <span>{sub.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                handleDeleteSubcategory(
                                  category.category_id,
                                  sub.subcategory_id
                                )
                              }
                              data-testid={`delete-subcategory-${sub.subcategory_id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoriesPage;
