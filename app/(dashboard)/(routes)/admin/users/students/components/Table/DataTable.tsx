import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { User } from "@/prisma/types";
import { columnVisibility } from "./columns/ColumnVisibility";
import { utils, writeFile } from "xlsx";

// Componente de tabla
interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export default function TeacherDataTable({ data, columns }: Props<User>) {
  const Cv = columnVisibility;
  // Configura la visibilidad de columnas
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: Cv, // Aplica la configuración de visibilidad
    },
  });

  // Extraer las columnas visibles usando accessorKey
  const visibleCols = columns.filter(
    (col: any) => col.accessorKey && columnVisibility[col.accessorKey]
  );

  // Función para exportar los datos visibles a CSV/Excel
  const handleExport = () => {
    const exportData = data.map((row) => {
      const obj: any = {};
      visibleCols.forEach((col: any) => {
        const key = col.accessorKey;
        obj[key] = (row as any)[key];
      });
      return obj;
    });
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Estudiantes");
    writeFile(wb, "estudiantes.xlsx");
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-2">
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
          onClick={handleExport}
        >
          Exportar a Excel
        </button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
