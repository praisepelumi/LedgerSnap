import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "../../hooks/useCategories.js";
import { CategoryBadge } from "./CategoryBadge.js";
import { Modal } from "../ui/Modal.js";
import { Spinner } from "../ui/Spinner.js";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const presetColors = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#6B7280",
  "#F97316",
  "#14B8A6",
];

export function CategoryManager() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      await createMutation.mutateAsync({ name: newName.trim(), color: newColor });
      toast.success(`Category "${newName}" created`);
      setNewName("");
      setNewColor("#3B82F6");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Category "${name}" deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Your Categories</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories?.map((cat) => (
          <div
            key={cat.id}
            className="receipt-card p-4 flex items-center justify-between"
          >
            <CategoryBadge name={cat.name} color={cat.color} size="md" />
            <div className="flex items-center gap-2">
              {cat.isDefault && (
                <span className="text-[10px] text-ink-400 font-medium">
                  DEFAULT
                </span>
              )}
              {!cat.isDefault && (
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-receipt-danger hover:bg-red-50 transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Category"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Subscriptions"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    newColor === color
                      ? "ring-2 ring-offset-2 ring-ink-700 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="label mb-0">Preview:</label>
            <CategoryBadge
              name={newName || "Category"}
              color={newColor}
              size="md"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || createMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
