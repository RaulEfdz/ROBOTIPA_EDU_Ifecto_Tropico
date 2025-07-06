// components/courseColumns.ts

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Course, Category, User, Chapter } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";

type CourseWithRelations = Course & {
  category?: Category | null;
  user?: User | null;
  chapters?: Chapter[];
};

export const courseColumns: ColumnDef<CourseWithRelations>[] = [
  // Acciones
  {
    header: "Acciones",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link
          href={`/teacher/courses/${row.original.id}`}
          className="inline-flex items-center gap-2 text-sm bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1 transition"
          aria-label={`Editar curso ${row.original.title}`}
        >
          <Pencil className="h-4 w-4" />
          <span>Editar</span>
        </Link>
      </div>
    ),
  },

  // Imagen del curso
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) =>
      row.original.imageUrl ? (
        <Image
          src={row.original.imageUrl}
          alt={row.original.title}
          width={32}
          height={32}
          className="rounded-md object-cover min-w-[32px] min-h-[32px]"
        />
      ) : (
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
      ),
  },

  // Título (sin imagen ni iniciales)
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-sm line-clamp-2">
        {row.getValue("title")}
      </span>
    ),
  },

  // Categoría
  {
    accessorFn: (row) => row.category?.name || "Sin categoría",
    id: "category",
    header: ({ column }) => (
      <div className="hidden sm:table-cell">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center"
        >
          Categoría
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden sm:table-cell text-sm">
        {row.getValue("category")}
      </div>
    ),
  },

  // Precio
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Precio
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price");
      return (
        <span className="text-sm font-medium">
          {typeof price === "number" && price > 0
            ? `$${price.toFixed(2)}`
            : "Gratis"}
        </span>
      );
    },
  },

  // Publicado
  {
    accessorKey: "isPublished",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Publicado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.getValue("isPublished") ? (
        <Check className="text-green-600 w-4 h-4" />
      ) : (
        <X className="text-red-500 w-4 h-4" />
      ),
  },

  // Fecha de creación
  {
    id: "createdAt",
    header: ({ column }) => (
      <div className="hidden md:table-cell">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center"
        >
          Creado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date: Date = row.original.createdAt;
      return (
        <div className="hidden md:table-cell text-sm">
          {format(date, "dd/MM/yyyy")}
        </div>
      );
    },
  },

  // Fecha de actualización
  {
    id: "updatedAt",
    header: ({ column }) => (
      <div className="hidden lg:table-cell">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center"
        >
          Actualizado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date: Date = row.original.updatedAt;
      return (
        <div className="hidden lg:table-cell text-sm">
          {format(date, "dd/MM/yyyy")}
        </div>
      );
    },
  },

  // Instructor
  {
    accessorFn: (row) =>
      row.user?.fullName || row.user?.username || "Desconocido",
    id: "instructor",
    header: ({ column }) => (
      <div className="hidden lg:table-cell">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center"
        >
          Instructor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:table-cell text-sm">
        {row.getValue("instructor")}
      </div>
    ),
  },

  // Capítulos
  {
    accessorFn: (row) => row.chapters?.length || 0,
    id: "chapters",
    header: ({ column }) => (
      <div className="hidden md:table-cell">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center"
        >
          Capítulos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden md:table-cell text-sm">
        {row.getValue("chapters")}
      </div>
    ),
  },
];
