"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";

import { useMaterialAttach } from "./useMaterialAttach";
import { NavBar } from "./NavBar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteFileModal } from "./DeleteFileModal";
import { CreateFileModal } from "./CreateFileModal";
import { RenameFileModal } from "./RenameFileModal";
import toast from "react-hot-toast";

export function generateFileUrl(key: string): string {
  return `https://utfs.io/f/${key}`;
}

export function TableMaterialAttach() {
  const { documents, loading, refetch } = useMaterialAttach();
  

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [isModalOpenDelete, setModalOpenDelete] = React.useState(false);
  const [isModalOpenCreate, setModalOpenCreate] = React.useState(false);
  const [isModalOpenRename, setModalOpenRename] = React.useState(false);


  const [selectedFile, setSelectedFile] = React.useState<{ key: string; name: string } | null>(
    null
  );

  const filters = [
    { label: "Todos", value: "all" },
    { label: "Activos", value: "active" },
    { label: "Inactivos", value: "inactive" },
  ];

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
      },
      {
        accessorKey: "fechaCreacion",
        header: "Fecha de Creación",
        cell: ({ row }) => <div className="text-gray-600">{row.getValue("fechaCreacion")}</div>,
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant={status !== "default" ? "default" : "secondary"}
              className="capitalize font-light"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const document = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 lg:px-3"
                onClick={() => {
                  setSelectedFile({ key: document.key, name: document.nombre });
                  setModalOpenRename(true);
                }}
              >
                Renombrar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-2 lg:px-3"
                onClick={() => {
                  setSelectedFile({ key: document.key, name: document.nombre });
                  setModalOpenDelete(true);
                }}
              >
                Eliminar
              </Button>
            </div>
          );
        },
      },
      {
        id: "file",
        header: "Archivo",
        cell: ({ row }) => {
          const document = row.original;
          const fileUrl = generateFileUrl(document.key);
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="Abrir archivo"
            >
              <FileText className="w-4 h-4" />
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: documents || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue({ pageIndex, pageSize })
          : updaterOrValue;

      setPageIndex(nextPagination.pageIndex);
      setPageSize(nextPagination.pageSize);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card className="w-full">
      <NavBar
      setModalOpenCreate={setModalOpenCreate}
        onSearch={(value) => setColumnFilters([{ id: "nombre", value }])}
        onFilter={(filter) => {}}
        onRefresh={() => {}}
        filters={filters}
      />

      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {loading ? "Cargando..." : "Sin resultados."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              filas por página
            </span>
          </div>
        </div>
      </CardContent>

      <DeleteFileModal
        isOpen={isModalOpenDelete}
        onClose={() => setModalOpenDelete(false)}
        fileKey={selectedFile?.key || ""}
        fileName={selectedFile?.name || ""}
        onDeleteSuccess={() => {
          toast.success("Recurso eliminado: ")

          refetch()
        }}
      />
       <RenameFileModal
        isOpen={isModalOpenRename}
        onClose={() => setModalOpenRename(false)}
        fileKey={selectedFile?.key || ""} 
        currentName={selectedFile?.name || ""} 
        onRenameSuccess={
          (newName)=>{

            console.clear()
            toast.success("Nuevo nombre: ", newName)
            // refetch()
          }
          }      
        />
    <CreateFileModal 
     isOpen={isModalOpenCreate}
     onClose={() => setModalOpenCreate(false)}
      onCreateSuccess={
        (response)=>{
          refetch()
        }
      }/>

    </Card>
  );
}
