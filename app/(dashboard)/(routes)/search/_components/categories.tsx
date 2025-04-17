"use client";

import { Category } from "@prisma/client";
import { FcInspection, FcWorkflow } from "react-icons/fc";
import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: Category[];
}

export const Categories = ({ items }: CategoriesProps) => {
  // Ordena para mostrar la Guía al final
  const sortedItems = items.sort((a, b) => {
    if (a.name === "Guía de la Plataforma") return 1;
    if (b.name === "Guía de la Plataforma") return -1;
    return a.name.localeCompare(b.name);
  });

  const getIcon = (item: Category) =>
    item.name !== "Guía de la Plataforma" ? FcInspection : FcWorkflow;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 px-1 scroll-smooth scrollbar-hide">
      {sortedItems.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={getIcon(item)}
          value={item.id}
        />
      ))}
    </div>
  );
};
