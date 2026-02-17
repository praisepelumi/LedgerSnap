import { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useCategories, useCreateCategory } from "../../hooks/useCategories.js";
import { CategoryBadge } from "./CategoryBadge.js";
import type { Category } from "@receipt/shared";

// Same preset colors as CategoryManager — keeps new categories visually consistent
const presetColors = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#6B7280", "#F97316", "#14B8A6",
];

function randomPresetColor(): string {
  return presetColors[Math.floor(Math.random() * presetColors.length)];
}

// Sentinel value used for the "Create new" option in the combobox
const CREATE_SENTINEL: Category = {
  id: -1,
  name: "",
  color: "",
  isDefault: false,
  createdAt: "",
};

interface CategorySelectProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
  suggestedCategory?: string | null;
}

export function CategorySelect({
  value,
  onChange,
  suggestedCategory,
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const [query, setQuery] = useState("");

  // Find the currently selected category object
  const selectedCategory = useMemo(
    () => categories?.find((c) => c.id === value) ?? null,
    [categories, value]
  );

  // Filter categories based on typed query
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!query) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

  // Check if the query exactly matches an existing category name
  const exactMatch = useMemo(
    () =>
      categories?.some(
        (cat) => cat.name.toLowerCase() === query.trim().toLowerCase()
      ) ?? false,
    [categories, query]
  );

  const showCreateOption = query.trim().length > 0 && !exactMatch;

  // Handle creating a new category inline
  const handleCreate = async () => {
    try {
      const newCategory = await createMutation.mutateAsync({
        name: query.trim(),
        color: randomPresetColor(),
      });
      toast.success(`Category "${newCategory.name}" created`);
      onChange(newCategory.id);
      setQuery("");
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to create category";
      toast.error(message);
    }
  };

  // Handle combobox value changes
  const handleChange = async (cat: Category | null) => {
    // If user selected the "Create" sentinel option, trigger creation
    if (cat && cat.id === -1) {
      await handleCreate();
      return;
    }
    onChange(cat?.id ?? null);
    setQuery("");
  };

  if (isLoading) {
    return <div className="input-field animate-pulse bg-ink-100 h-10" />;
  }

  return (
    <div>
      <Combobox
        value={selectedCategory}
        onChange={handleChange}
        by="id"
      >
        <div className="relative">
          <ComboboxInput
            className="input-field pr-10"
            displayValue={(cat: Category | null) => cat?.name ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create category..."
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="w-4 h-4 text-ink-400" />
          </ComboboxButton>

          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-ink-200 py-1">
            {/* "No category" option */}
            <ComboboxOption
              value={null}
              className="relative cursor-pointer select-none py-2 px-3 text-sm text-ink-400 hover:bg-receipt-cream data-[focus]:bg-receipt-cream"
            >
              No category
            </ComboboxOption>

            {/* Existing categories */}
            {filteredCategories.map((cat) => (
              <ComboboxOption
                key={cat.id}
                value={cat}
                className="relative cursor-pointer select-none py-2 px-3 hover:bg-receipt-cream data-[focus]:bg-receipt-cream"
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <CategoryBadge name={cat.name} color={cat.color} size="sm" />
                    {selected && (
                      <CheckIcon className="w-4 h-4 text-receipt-success" />
                    )}
                  </div>
                )}
              </ComboboxOption>
            ))}

            {/* Empty state */}
            {filteredCategories.length === 0 && !showCreateOption && (
              <div className="py-2 px-3 text-sm text-ink-400">
                No categories found.
              </div>
            )}

            {/* Create new category option */}
            {showCreateOption && (
              <ComboboxOption
                value={{ ...CREATE_SENTINEL, name: query.trim() }}
                className="cursor-pointer select-none py-2 px-3 hover:bg-receipt-cream data-[focus]:bg-receipt-cream border-t border-receipt-line"
              >
                <div className="flex items-center gap-2 text-sm text-receipt-stamp">
                  <PlusIcon className="w-4 h-4" />
                  {createMutation.isPending
                    ? "Creating..."
                    : `Create "${query.trim()}"`}
                </div>
              </ComboboxOption>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* AI suggestion hint */}
      {suggestedCategory && !value && (
        <p className="text-xs text-ink-400 mt-1">
          AI suggests:{" "}
          <span className="font-medium text-receipt-stamp">
            {suggestedCategory}
          </span>
        </p>
      )}
    </div>
  );
}
