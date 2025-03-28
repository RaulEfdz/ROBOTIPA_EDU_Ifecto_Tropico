"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { BASE_APP } from "@/utils/nameApp";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    // Construir la nueva URL basada en los parámetros actuales y el valor de búsqueda
    const url = qs.stringifyUrl({
      url: pathname || "/",
      query: {
        categoryId: currentCategoryId,
        title: debouncedValue,
      },
    }, { skipEmptyString: true, skipNull: true });

    // Corregir el href si es necesario
    const correctedHref = url.startsWith(`/${BASE_APP}`)
      ? url.replace(`/${BASE_APP}`, "")
      : url;

    // Navegar a la nueva URL corregida
    router.push(correctedHref);

  }, [debouncedValue, currentCategoryId, router, pathname]);

  return (
    <div className="relative  border-none">
      <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[300px] pl-9 border-none bg-slate-100 rounded-none"
        placeholder="Buscar un curso"
      />
    </div>
  );
};
