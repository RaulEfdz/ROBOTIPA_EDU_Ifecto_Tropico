"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  className?: string;
}

export const SearchInput = ({ className = "" }: SearchInputProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTitle = searchParams.get("title") || "";
  const [inputValue, setInputValue] = useState(currentTitle);

  useEffect(() => {
    setInputValue(currentTitle);
  }, [currentTitle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (inputValue.trim()) {
      params.set("title", inputValue.trim());
    } else {
      params.delete("title");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("title");
    router.push(`/search?${params.toString()}`);
    setInputValue("");
  };

  return (
    <form onSubmit={handleSearch} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-white rounded-full border border-slate-200 pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {inputValue && (
          <X
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer"
            onClick={handleClear}
          />
        )}
      </div>
      <Button type="submit" variant="default" size="sm">
        Buscar
      </Button>
    </form>
  );
};
