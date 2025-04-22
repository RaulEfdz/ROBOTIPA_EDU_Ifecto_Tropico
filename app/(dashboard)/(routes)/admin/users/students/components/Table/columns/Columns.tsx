import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { translateRole } from '@/utils/roles/translate';
import { User } from '@/prisma/types';


// Definición de columnas
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'fullName',
    header: 'Nombre',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'username',
    header: 'Nombre de usuario',
  },
  {
    accessorKey: 'phone',
    header: 'Teléfono',
    cell: info => info.getValue() || '- - -',
  },
  {
    accessorKey: 'customRole',
    header: 'Rol',
    cell: info => (info.getValue() ? translateRole(String(info.getValue())).toUpperCase() : '- - -'),
  },
  {
    accessorKey: 'provider',
    header: 'Proveedor',
  },
  {
    accessorKey: 'lastSignInAt',
    header: 'Último inicio',
    cell: info => (info.getValue() ? new Date(info.getValue() as string).toLocaleString() : 'Nunca'),
  },
  {
    accessorKey: 'metadata',
    header: 'Metadatos',
    cell: info => JSON.stringify(info.getValue()) || '- - -',
  },
  {
    accessorKey: 'isActive',
    header: 'Activo',
    cell: info => (info.getValue() ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'isBanned',
    header: 'Baneado',
    cell: info => (info.getValue() ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'isDeleted',
    header: 'Eliminado',
    cell: info => (info.getValue() ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'additionalStatus',
    header: 'Estado adicional',
    cell: info => info.getValue() || '- - -',
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado',
    cell: info => new Date(info.getValue() as string).toLocaleString(),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Actualizado',
    cell: info => new Date(info.getValue() as string).toLocaleString(),
  },
  {
    accessorKey: 'courses',
    header: 'Cursos',
    cell: info => (info.getValue() as any[])?.length || '0',
  },
  {
    accessorKey: 'purchases',
    header: 'Compras',
    cell: info => (info.getValue() as any[])?.length || '0',
  },
  {
    accessorKey: 'userProgress',
    header: 'Progreso',
    cell: info => (info.getValue() as any[])?.length || '0',
  },
  {
    accessorKey: 'invoices',
    header: 'Facturas',
    cell: info => (info.getValue() as any[])?.length || '0',
  },
  {
    accessorKey: 'examAttempts',
    header: 'Intentos de examen',
    cell: info => (info.getValue() as any[])?.length || '0',
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">Detalles</Button>
      </div>
    ),
  },
];