import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategories";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import type { Category } from "@receipt/shared";

const PRESET_COLORS = [
  "#C14533", // red (receipt-stamp)
  "#F0C75E", // gold (receipt-highlight)
  "#4A9F6E", // green (receipt-success)
  "#D4913D", // amber (receipt-warning)
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
  "#14B8A6", // teal
];

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // ── Open modal for create ────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingCategory(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setIsModalOpen(true);
  }, []);

  // ── Open modal for edit ──────────────────────────────────────────────────
  const openEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIsModalOpen(true);
  }, []);

  // ── Close modal ──────────────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName("");
    setColor(PRESET_COLORS[0]);
  }, []);

  // ── Save (create or update) ──────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: { name: trimmedName, color } },
        {
          onSuccess: () => {
            toast.success("Category updated");
            closeModal();
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Failed to update"
            );
          },
        }
      );
    } else {
      createMutation.mutate(
        { name: trimmedName, color },
        {
          onSuccess: () => {
            toast.success("Category created");
            closeModal();
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Failed to create"
            );
          },
        }
      );
    }
  }, [name, color, editingCategory, createMutation, updateMutation, closeModal]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (category: Category) => {
      if (category.isDefault) {
        toast.error("Default categories cannot be deleted");
        return;
      }

      if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) {
        return;
      }

      deleteMutation.mutate(category.id, {
        onSuccess: () => {
          toast.success("Category deleted");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to delete"
          );
        },
      });
    },
    [deleteMutation]
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title font-display text-3xl text-ink-800">
          Categories
        </h1>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <TagIcon className="w-12 h-12 mx-auto mb-3 text-ink-200" />
          <p className="font-display text-lg text-ink-500">No categories yet</p>
          <p className="text-sm mt-1">Create one to organize your receipts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meals, Travel, Office"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSaving) handleSave();
              }}
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-ink-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-ink-400">Custom:</label>
              <input
                type="text"
                className="input-field flex-1 font-mono text-sm"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#C14533"
                maxLength={7}
              />
              <div
                className="w-8 h-8 rounded-lg border border-receipt-line shrink-0"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              className="btn-secondary flex-1"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSaving && <Spinner size="sm" />}
              {editingCategory ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Category Card ──────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="receipt-card p-4 flex items-start justify-between group">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <div>
          <h3 className="font-medium text-ink-700 text-sm">
            {category.name}
          </h3>
          {category.isDefault && (
            <span className="text-[10px] text-ink-400 font-medium">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
          aria-label={`Edit ${category.name}`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        {!category.isDefault && (
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 rounded-lg text-ink-400 hover:text-receipt-danger hover:bg-red-50 transition-colors"
            aria-label={`Delete ${category.name}`}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
