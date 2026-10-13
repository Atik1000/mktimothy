"use client";

import { Spinner } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, Grid, Hash, X, Image as ImageIcon, Upload, LayoutGrid
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  _count: { listings: number; blogs: number };
}

const COLOR_PRESETS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#84CC16",
  "#06B6D4", "#EF4444", "#F97316", "#EC4899", "#14B8A6",
];

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: Partial<Category> | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    color: category?.color || "#3B82F6",
    image: category?.image || "",
    isActive: category?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const imageFormData = new FormData();
      imageFormData.append("images", file);

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/upload/images", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: imageFormData,
      });

      if (response.ok) {
        const result = await response.json();
        const url = result.url || result.urls?.[0];
        if (url) {
          setForm((prev) => ({ ...prev, image: url }));
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Failed to get image URL from response");
        }
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    await onSave({ ...form, id: category?.id });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-[#18181b] border border-white/10 shadow-2xl rounded-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg tracking-tight">
            {category?.id ? "Edit Category" : "New Category"}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Businesses for Sale"
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description..."
              rows={2}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">Image</label>
            {form.image ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                <img src={form.image} alt="Category preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-rose-500/90 text-white p-1.5 rounded-lg hover:bg-rose-600 transition-colors backdrop-blur-sm shadow-sm"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors bg-[#09090b]">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="category-image-upload" />
                <label htmlFor="category-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                    {uploading ? <Spinner size="w-4 h-4" className="text-emerald-500" /> : <Upload size={18} />}
                  </div>
                  <span className="text-zinc-300 text-sm font-medium">{uploading ? "Uploading..." : "Click to upload image"}</span>
                  <span className="text-zinc-500 text-xs">PNG, JPG, GIF up to 5MB</span>
                </label>
              </div>
            )}
            {form.image && (
              <label htmlFor="category-image-upload" className="mt-3 flex items-center justify-center gap-2 text-emerald-400 text-xs font-medium cursor-pointer hover:text-emerald-300 transition-colors">
                <ImageIcon size={14} /> Replace image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="category-image-upload" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${form.color === c ? "border-white scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative rounded-lg overflow-hidden w-10 h-10 shrink-0 border border-white/10 shadow-sm">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="flex-1 bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${form.isActive ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-zinc-300 text-sm font-medium">Active (visible to users)</span>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 border border-white/10 text-zinc-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-500 text-[#09090b] py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : category?.id ? "Update Category" : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesAdmin() {
  const { user, handleApiResponse } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<Partial<Category> | null | "new">(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const isValid = await handleApiResponse(response);
      if (!isValid) return;
      const result = await response.json();
      if (result.success) setCategories(result.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCategories();
  }, [user]);

  const handleSave = async (data: any) => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const isEdit = !!data.id;
      const response = await fetch(
        isEdit ? `/api/admin/categories/${data.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (result.success) {
        toast.success(isEdit ? "Category updated" : "Category created");
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (category: Category) => {
    if (category._count.listings > 0) {
      toast.error(`Cannot delete: ${category._count.listings} listing(s) use this category`);
      return;
    }
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleToggleActive = async (category: Category) => {
    await handleSave({ id: category.id, isActive: !category.isActive });
  };

  const openNew = () => setModalData({});
  const openEdit = (cat: Category) => setModalData(cat);

  const filteredCategories = categories.filter(c => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive) ||
      (statusFilter === 'inactive' && !c.isActive);
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleStatusFilter = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter((prev) => (prev === filter ? 'all' : filter));
  };

  const metrics = [
    { id: 1, title: 'Total Categories', value: categories.length.toString(), icon: Grid, color: 'blue', onClick: () => setStatusFilter('all'), active: false, hint: 'Show all categories' },
    { id: 2, title: 'Active', value: categories.filter((c) => c.isActive).length.toString(), icon: CheckCircle2, color: 'emerald', onClick: () => toggleStatusFilter('active'), active: statusFilter === 'active', hint: 'Show active categories only' },
    { id: 3, title: 'Inactive', value: categories.filter((c) => !c.isActive).length.toString(), icon: XCircle, color: 'rose', onClick: () => toggleStatusFilter('inactive'), active: statusFilter === 'inactive', hint: 'Show inactive categories only' },
    { id: 4, title: 'Total Listings', value: categories.reduce((sum, c) => sum + c._count.listings, 0).toString(), icon: LayoutGrid, color: 'purple', onClick: () => router.push('/listings'), active: false, hint: 'Go to listings management' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 font-sans min-h-screen">
      {modalData !== null && (
        <CategoryModal
          category={modalData === "new" ? {} : modalData}
          onClose={() => setModalData(null)}
          onSave={handleSave}
        />
      )}

      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Categories</h1>
            <p className="text-zinc-400 text-sm mt-1">Create and manage listing categories without developer help.</p>
          </div>
          <button 
            onClick={openNew}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            New Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colorMap: Record<string, string> = {
              blue: 'text-blue-400 bg-blue-500/10',
              rose: 'text-rose-400 bg-rose-500/10',
              purple: 'text-purple-400 bg-purple-500/10',
              emerald: 'text-emerald-400 bg-emerald-500/10',
            };
            const selectedMap: Record<string, string> = {
              blue: 'border-blue-500/40 bg-blue-500/5',
              rose: 'border-rose-500/40 bg-rose-500/5',
              purple: 'border-purple-500/40 bg-purple-500/5',
              emerald: 'border-emerald-500/40 bg-emerald-500/5',
            };
            const accentMap: Record<string, string> = {
              blue: 'bg-blue-500/50',
              rose: 'bg-rose-500/50',
              purple: 'bg-purple-500/50',
              emerald: 'bg-emerald-500/50',
            };

            return (
              <button
                key={metric.id}
                type="button"
                onClick={metric.onClick}
                title={metric.hint}
                className={`bg-[#18181b] border p-5 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors text-left cursor-pointer ${
                  metric.active ? selectedMap[metric.color] : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-3xl font-bold text-white tracking-tight">{metric.value}</h3>
                  <div className={`p-2 rounded-lg ${colorMap[metric.color]}`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-sm text-zinc-400 font-medium">{metric.title}</p>
                <div className={`absolute bottom-0 left-0 w-full h-0.5 transition-opacity ${accentMap[metric.color]} ${metric.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden flex flex-col">
          
          {/* List Header / Search */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Categories Rows */}
          <div className="divide-y divide-white/5 flex-1">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <Grid className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">
                  {searchQuery || statusFilter !== 'all' ? "No categories matched your filters." : "No categories yet. Create your first one!"}
                </p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[15px] font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                        {category.name}
                      </h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-black/40 border border-white/5 px-2 py-0.5 rounded-md">
                        <Hash size={10} className="text-zinc-600" />
                        {category.slug.replace('/', '')}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-zinc-400 truncate pr-4">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="flex items-center gap-5 text-center">
                      <div>
                        <p className="text-[15px] font-bold text-zinc-200">{category._count.listings}</p>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Listings</p>
                      </div>
                      <div className="w-px h-8 bg-white/5 hidden sm:block"></div>
                      <div>
                        <p className="text-[15px] font-bold text-zinc-200">{category._count.blogs}</p>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Blogs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-l sm:border-l-0 border-white/5 pl-4 sm:pl-0">
                      <button 
                        onClick={() => handleToggleActive(category)}
                        className={`p-2 rounded-lg transition-colors border ${category.isActive ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-zinc-500 border-white/5 hover:text-white'}`}
                        title={category.isActive ? "Deactivate" : "Activate"}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => openEdit(category)}
                        className="p-2 text-zinc-400 hover:text-blue-400 border border-transparent hover:border-blue-500/20 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category)}
                        disabled={category._count.listings > 0}
                        className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                        title={category._count.listings > 0 ? "Cannot delete: has listings" : "Delete Category"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
}
