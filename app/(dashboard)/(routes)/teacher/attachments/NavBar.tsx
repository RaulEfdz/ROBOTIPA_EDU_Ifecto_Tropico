"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, RefreshCw, Plus } from "lucide-react";

interface NavBarProps {
  onSearch: (value: string) => void;
  onFilter: (filter: { label: string; value: any }) => void;
  onRefresh: () => void;
  filters: { label: string; value: any }[];
  setModalOpenCreate: (isOpenModalCreate: boolean) => void;
}

export function NavBar({
  onSearch,
  onFilter,
  onRefresh,
  filters,
  setModalOpenCreate,
}: NavBarProps) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterClick = (filter: { label: string; value: any }) => {
    onFilter(filter);
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md mb-4">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-64"
        />
        <Button variant="outline" onClick={() => onSearch(searchTerm)}>
          Buscar
        </Button>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {filters.map((filter, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleFilterClick(filter)}
              >
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh Button */}
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Add Resource Button */}
        {/* <Button
          variant="outline"
          onClick={() => setModalOpenCreate(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Recurso</span>
        </Button> */}
      </div>
    </div>
  );
}
