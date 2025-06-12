import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { translateRole } from '@/utils/roles/translate';
import { User } from '@/prisma/types';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, Calendar } from 'lucide-react';

// Extender el tipo User para incluir estadísticas de admin
interface AdminWithStats extends User {
  adminStats?: {
    daysSinceCreation: number;
    lastActiveToday: boolean;
    systemStats: {
      totalUsers: number;
      totalCourses: number;
      totalPurchases: number;
      totalRevenue: number;
      usersByRole: {
        teachers: number;
        students: number;
        admins: number;
        visitors: number;
      };
    };
  };
}

// Definición de columnas
export const columns: ColumnDef<AdminWithStats>[] = [
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
    cell: ({ row }) => {
      const lastSignIn = row.getValue('lastSignInAt') as string;
      const isActiveToday = row.original.adminStats?.lastActiveToday;
      
      return (
        <div className="flex items-center gap-2">
          <span>{lastSignIn ? new Date(lastSignIn).toLocaleString() : 'Nunca'}</span>
          {isActiveToday && (
            <Badge variant="default" className="h-5">
              <Activity className="h-3 w-3 mr-1" />
              Hoy
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'accountAge',
    header: 'Antigüedad',
    cell: ({ row }) => {
      const days = row.original.adminStats?.daysSinceCreation || 0;
      const years = Math.floor(days / 365);
      const months = Math.floor((days % 365) / 30);
      
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {years > 0 ? `${years} año${years > 1 ? 's' : ''}` : ''}
            {years > 0 && months > 0 ? ', ' : ''}
            {months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : ''}
            {years === 0 && months === 0 ? `${days} días` : ''}
          </span>
        </div>
      );
    },
  },
  {
    id: 'permissions',
    header: 'Permisos',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-yellow-600" />
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Acceso Total
          </Badge>
        </div>
      );
    },
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