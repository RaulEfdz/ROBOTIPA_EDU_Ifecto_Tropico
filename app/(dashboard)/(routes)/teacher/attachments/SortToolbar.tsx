"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FC } from "react";

interface SortToolbarProps {
  onChange: (sortValue: string) => void;
}

export const SortToolbar: FC<SortToolbarProps> = ({ onChange }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span className="text-sm text-gray-600">Ordenar por:</span>
      <Select onValueChange={onChange}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nombreAsc">Nombre (A-Z)</SelectItem>
          <SelectItem value="nombreDesc">Nombre (Z-A)</SelectItem>
          <SelectItem value="fechaAsc">Fecha más antigua</SelectItem>
          <SelectItem value="fechaDesc">Fecha más reciente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
