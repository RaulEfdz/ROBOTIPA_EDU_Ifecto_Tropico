// File: app/(course)/courses/catalog/components/CategoryFilter.tsx
import { ListFilter } from "lucide-react";
import { CategoryItem } from "./category-item";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mt-6">
      <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
        <ListFilter className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
        Filtrar por Categoría
      </h3>
      <div className="flex flex-wrap gap-2 items-center">
        <CategoryItem
          label="Todas"
          value={undefined}
          isSelected={!selectedCategoryId}
          onClick={() => onCategoryChange(null)}
        />
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            label={cat.name}
            value={cat.id}
            isSelected={selectedCategoryId === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
