"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

// Paleta de colores de la marca
const brandPrimary = "#FFFCF8";
const brandSecondaryDark = "#47724B";
const brandSecondary = "#ACBC64";
const brandTertiaryDark = "#386329";
const brandTertiary = "#C8E065";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const numberedColumns: ColumnDef<TData, TValue>[] = [
    {
      id: "number",
      header: () => "#",
      cell: (info) => info.row.index + 1,
      size: 50,
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: numberedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div
      className="w-full mx-auto rounded-xl shadow-md p-6 transition bg-TextCustom"
      style={{ background: brandPrimary }}
    >
      {/* Barra superior */}
      <div
        className="flex items-center justify-between p-4 rounded-lg shadow-inner mb-4"
        style={{
          background: `linear-gradient(to right, ${brandSecondary}, ${brandTertiary})`,
        }}
      >
        <Input
          placeholder="Buscar cursos..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full max-w-md bg-TextCustom placeholder:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-[#ACBC64] transition"
          style={{
            border: `1px solid ${brandSecondaryDark}`,
            color: "#000",
          }}
        />
        <Link href="/teacher/create">
          <Tooltip>
            <Button
              className="flex items-center ml-4 hover:scale-[1.02] transition"
              style={{
                background: brandPrimary,
                color: brandTertiaryDark,
                border: `1px solid ${brandSecondaryDark}`,
              }}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Nuevo curso
            </Button>
          </Tooltip>
        </Link>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border overflow-x-auto">
        <Table className="table-auto w-full text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#f0f0f0] text-black">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className="transition hover:bg-[#f3fdf4] hover:shadow-sm"
                  style={{
                    background: idx % 2 === 0 ? brandPrimary : "#fdfdfd",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3"
                      style={{ color: "#000" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={numberedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between py-6 px-2">
        <div className="text-sm" style={{ color: brandSecondaryDark }}>
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md transition"
            style={{
              background: brandPrimary,
              color: brandSecondaryDark,
              border: `1px solid ${brandSecondaryDark}`,
            }}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md transition"
            style={{
              background: brandPrimary,
              color: brandSecondaryDark,
              border: `1px solid ${brandSecondaryDark}`,
            }}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
