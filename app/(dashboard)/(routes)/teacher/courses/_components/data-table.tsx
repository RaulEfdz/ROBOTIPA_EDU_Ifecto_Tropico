// components/TeacherTable.tsx

'use client';

import * as React from 'react';
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
} from '@tanstack/react-table';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Edit2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Users,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TeacherTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Custom action column
  const actionColumn: ColumnDef<TData, any> = {
    id: 'actions',
    cell: () => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-blue-600" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-600" />
              <span>Gestionar estudiantes</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span>Programar clases</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  // Modificar columnas existentes sin cambiar su estructura base
  const enhancedColumns = React.useMemo(() => {
    return [
      ...columns.map(column => {
        // El tipado correcto es mantener la columna original y solo ajustar el renderizado
        return column;
      }),
      actionColumn
    ];
  }, [columns]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Cursos</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tus cursos y contenido educativo</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar cursos..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
              className="pl-9 border-slate-200 rounded-lg focus-visible:ring-emerald-500"
            />
          </div>
          
          <Link href="/teacher/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Nuevo curso</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Card with Table */}
      <Card className="overflow-hidden border-slate-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-slate-50 border-b-0">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-11 px-6 text-slate-600 font-medium text-sm"
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-2">
                            {header.column.id === 'title' && <BookOpen className="h-4 w-4 text-emerald-600" />}
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto ml-1"
                                onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                              >
                                <ArrowUpDown className="h-3 w-3 text-emerald-500" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b hover:bg-slate-50/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-6 py-3">
                          {cell.column.id === 'title' ? (
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
                                {(cell.getValue() as string)?.[0]?.toUpperCase() || 'C'}
                              </div>
                              <span>{cell.getValue() as string}</span>
                            </div>
                          ) : cell.column.id === 'status' ? (
                            <Badge 
                              className={`
                                ${(cell.getValue() as string) === 'Publicado' ? 
                                  'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 
                                  'bg-amber-100 text-amber-800 hover:bg-amber-200'}
                                rounded-full px-3 py-1.5 font-medium
                              `}
                            >
                              {(cell.getValue() as string) === 'Publicado' ? '● Publicado' : '◌ Borrador'}
                            </Badge>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={enhancedColumns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <BookOpen className="h-8 w-8 mb-2 text-slate-300" />
                        <p>No se encontraron cursos</p>
                        <p className="text-sm">Comienza creando tu primer curso</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Table Footer with Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span>Mostrando</span>
              <strong className="font-medium text-slate-700">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </strong>
              <span>-</span>
              <strong className="font-medium text-slate-700">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </strong>
              <span>de</span>
              <strong className="font-medium text-slate-700">{table.getFilteredRowModel().rows.length}</strong>
              <span>cursos</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-3 flex items-center gap-1 rounded-md text-slate-600 border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Anterior</span>
              </Button>
              
              <div className="flex items-center">
                {Array.from({length: Math.min(5, table.getPageCount())}, (_, i) => {
                  const pageIndex = i;
                  const isActive = pageIndex === table.getState().pagination.pageIndex;
                  
                  return (
                    <Button
                      key={i}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={`h-8 w-8 p-0 ${
                        isActive ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 px-3 flex items-center gap-1 rounded-md text-slate-600 border-slate-200"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}