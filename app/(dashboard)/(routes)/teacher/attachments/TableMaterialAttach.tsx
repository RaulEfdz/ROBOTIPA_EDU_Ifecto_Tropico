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
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { useMaterialAttach } from "./useMaterialAttach";
import { useStorageAnalysis } from "./useStorageAnalysis";
import { NavBar } from "./NavBar";
import { StorageDetails } from "./StorageDetails";

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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DeleteFileModal } from "./DeleteFileModal";
import { CreateFileModal } from "./CreateFileModal";
import { RenameFileModal } from "./RenameFileModal";
import toast from "react-hot-toast";
import { SortToolbar } from "./SortToolbar";

export function generateFileUrl(key: string): string {
  return `https://utfs.io/f/${key}`;
}

export function TableMaterialAttach() {
  const DEFAULT_PAGE_SIZE = 10;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [isModalOpenDelete, setModalOpenDelete] = React.useState(false);
  const [isModalOpenCreate, setModalOpenCreate] = React.useState(false);
  const [isModalOpenRename, setModalOpenRename] = React.useState(false);
  const [storageReportView, setStorageReportView] = React.useState<boolean>(false);
  const [selectedFile, setSelectedFile] = React.useState<{ key: string; name: string } | null>(null);

  const { documents, loading, refetch, pagination } = useMaterialAttach({
    limit: pageSize,
    offset: pageIndex * pageSize,
    initialFetch: true,
  });

  const { report: storageReport, analyze, loading: analyzing } = useStorageAnalysis();
  const handleAnalyzeStorage = () => analyze();

  React.useEffect(() => {
    if (pagination?.currentPage !== undefined) {
      setPageIndex(pagination.currentPage);
    }
  }, [pagination]);

  const handleRefresh = React.useCallback(() => {
    refetch({ offset: pageIndex * pageSize, limit: pageSize });
    toast.success("Datos actualizados");
  }, [pageIndex, pageSize, refetch]);

  const handleDeleteSelectedFiles = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("No hay archivos seleccionados.");
      return;
    }

    const confirmDelete = confirm(`¿Eliminar ${selectedRows.length} archivos seleccionados?`);
    if (!confirmDelete) return;

    const fileKeys = selectedRows.map((row) => row.original.key);

    try {
      const res = await fetch("/api/attachment/delete", {
        method: "POST",
        body: JSON.stringify({ fileKeys }),
      });

      const result = await res.json();
      if (!res.ok || result.some((r: any) => r.success === false)) {
        toast.error("Error al eliminar uno o más archivos.");
        return;
      }

      toast.success(`Se eliminaron ${fileKeys.length} archivos.`);
      table.resetRowSelection();
      refetch({ offset: pageIndex * pageSize, limit: pageSize });
    } catch (error) {
      toast.error("Ocurrió un error al intentar eliminar los archivos.");
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium flex items-center">
          <FileText className="h-4 w-4 text-blue-500 mr-2" />
          {row.getValue("nombre")}
        </div>
      ),
    },
    {
      accessorKey: "fechaCreacion",
      header: "Fecha de Creación",
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue("fechaCreacion")).toLocaleDateString("es-ES")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "Activo" ? "default" : "secondary"}
            className={`capitalize font-medium ${
              status === "Activo"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
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
        const fileUrl = generateFileUrl(document.key);
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedFile({ key: document.key, name: document.nombre });
                setModalOpenRename(true);
              }}
            >
              <Edit className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedFile({ key: document.key, name: document.nombre });
                setModalOpenDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </a>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: documents || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
      refetch({ offset: next.pageIndex * next.pageSize, limit: next.pageSize });
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
        onFilter={(filter) => {
          if (filter.value === "all") return setColumnFilters([]);
          setColumnFilters([
            {
              id: "status",
              value: filter.value === "active" ? "Activo" : "Inactivo",
            },
          ]);
        }}
        onRefresh={handleRefresh}
        filters={[
          { label: "Todos", value: "all" },
          { label: "Activos", value: "active" },
          { label: "Inactivos", value: "inactive" },
        ]}
      />

      <SortToolbar
        onChange={(value) => {
          if (value === "nombreAsc") setSorting([{ id: "nombre", desc: false }]);
          if (value === "nombreDesc") setSorting([{ id: "nombre", desc: true }]);
          if (value === "fechaAsc") setSorting([{ id: "fechaCreacion", desc: false }]);
          if (value === "fechaDesc") setSorting([{ id: "fechaCreacion", desc: true }]);
        }}
      />

      <CardContent className="p-0">
        <div className="rounded-md border border-gray-100">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold text-gray-700">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-500">Cargando materiales...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-10 w-10 mb-2 opacity-20" />
                      <p>No se encontraron materiales</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setModalOpenCreate(true)}>
                        Agregar nuevo material
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage() || loading} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage() || loading} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Página <strong>{pageIndex + 1}</strong> de <strong>{pagination?.totalPages || 1}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar</span>
          <Select value={pageSize.toString()} onValueChange={(value) => {
            const newSize = Number(value);
            setPageSize(newSize);
            setPageIndex(0);
            refetch({ offset: 0, limit: newSize });
          }}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">filas por página</span>
        </div>
      </CardFooter>

      <DeleteFileModal isOpen={isModalOpenDelete} onClose={() => setModalOpenDelete(false)} fileKey={selectedFile?.key || ""} fileName={selectedFile?.name || ""} onDeleteSuccess={() => {
        toast.success(`Recurso eliminado: ${selectedFile?.name}`);
        refetch({ offset: pageIndex * pageSize, limit: pageSize });
      }} />

      <RenameFileModal isOpen={isModalOpenRename} onClose={() => setModalOpenRename(false)} fileKey={selectedFile?.key || ""} currentName={selectedFile?.name || ""} onRenameSuccess={(newName) => {
        toast.success(`Archivo renombrado a: ${newName}`);
        refetch({ offset: pageIndex * pageSize, limit: pageSize });
      }} />

      <CreateFileModal isOpen={isModalOpenCreate} onClose={() => setModalOpenCreate(false)} onCreateSuccess={() => {
        toast.success("Nuevo archivo creado correctamente");
        refetch({ offset: pageIndex * pageSize, limit: pageSize });
      }} />

      <div className="flex justify-between items-center px-4 py-2">
        <Button variant="destructive" size="sm" onClick={handleDeleteSelectedFiles} disabled={table.getSelectedRowModel().rows.length === 0}>
          Eliminar seleccionados
        </Button>
        <Button variant={storageReportView ? "outline" : "secondary"} size="sm" onClick={() => {
          if (!storageReportView) handleAnalyzeStorage();
          setStorageReportView((prev) => !prev);
        }} disabled={analyzing}>
          {storageReportView ? "Cerrar" : analyzing ? "Analizando..." : "Analizar almacenamiento"}
        </Button>
      </div>

      {storageReport && storageReportView && (
        <StorageDetails report={storageReport} onRefresh={handleRefresh} />
      )}
    </Card>
  );
}
