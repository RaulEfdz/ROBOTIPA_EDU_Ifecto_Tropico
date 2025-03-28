'use client'
import { Category } from "@prisma/client";
import {
  FcInspection, FcWorkflow
} from "react-icons/fc";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: Category[];
}

export const Categories = ({
  items,
}: CategoriesProps) => {
  // Ordenar los elementos para que 'Guía de la Plataforma' vaya al final
  const sortedItems = items.sort((a, b) => {
    if (a.name === "Guía de la Plataforma") return 1;
    if (b.name === "Guía de la Plataforma") return -1;
    return 0;
  });

  const itemIcon = (item:any) => {
    return item.name !== "Guía de la Plataforma" ? FcInspection : FcWorkflow
  }
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {sortedItems.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={itemIcon(item)}
          value={item.id}
        />
      ))}
    </div>
  )
}
