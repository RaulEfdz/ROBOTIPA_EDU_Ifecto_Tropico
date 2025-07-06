// File: app/(course)/courses/catalog/components/CatalogSearch.tsx
import { Input } from "@/components/ui/input";
import { Search, XCircle } from "lucide-react";

import { SortByType } from "./CatalogContent";

interface CatalogSearchProps {
  searchTerm: string;
  sortBy: SortByType;
  onSearchTermChange: (value: string) => void;
  onSortByChange: (value: SortByType) => void;
  onSearchSubmit: () => void;
  clearSearch: () => void;
}

export default function CatalogSearch({
  searchTerm,
  sortBy,
  onSearchTermChange,
  onSortByChange,
  onSearchSubmit,
  clearSearch,
}: CatalogSearchProps) {
  return (
    <section className="mb-8 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div className="md:col-span-2">
          <label
            htmlFor="search-courses"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Buscar Curso
          </label>
          <div className="relative">
            <Input
              id="search-courses"
              type="text"
              placeholder="Escribe el nombre del curso..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 pr-10 py-2 w-full dark:bg-slate-700 dark:text-white rounded-md"
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            {searchTerm && (
              <XCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                onClick={clearSearch}
              />
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="sort-by"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Ordenar Por
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortByType)}
            className="w-full p-2 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="recent">Más Recientes</option>
            <option value="title_asc">Título (A-Z)</option>
            <option value="title_desc">Título (Z-A)</option>
            <option value="price_asc">Precio (Menor a Mayor)</option>
            <option value="price_desc">Precio (Mayor a Menor)</option>
          </select>
        </div>
      </form>
    </section>
  );
}
