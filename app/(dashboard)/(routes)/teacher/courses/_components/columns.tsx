
// components/courseColumns.ts

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@prisma/client';

export const courseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'isPublished',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Estado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isPub = row.getValue('isPublished');
      return (
        <Badge variant={isPub ? 'default' : 'secondary'}>
          {isPub ? 'Publicado' : 'Oculto'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/teacher/courses/${row.original.id}`} className="flex items-center space-x-1 text-sm hover:text-gray-600">
        <Pencil className="h-4 w-4" />
        <span>Editar</span>
      </Link>
    ),
  },
];

