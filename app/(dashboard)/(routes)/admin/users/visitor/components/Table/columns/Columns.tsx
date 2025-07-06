import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { translateRole } from '@/utils/roles/translate';
import { User } from '@/prisma/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Eye } from 'lucide-react';

// Extender el tipo User para incluir métricas de visitante
interface VisitorWithStats extends User {
  visitorStats?: {
    daysSinceRegistration: number;
    hasInteracted: boolean;
    hasPurchased: boolean;
    engagementScore: number;
    potentialValue: 'Alto' | 'Medio' | 'Bajo';
    coursesViewed: Array<{
      title: string;
      price: number | null;
    }>;
  };
}

// Definición de columnas
export const columns: ColumnDef<VisitorWithStats>[] = [
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
    id: 'registrationTime',
    header: 'Tiempo Registrado',
    cell: ({ row }) => {
      const days = row.original.visitorStats?.daysSinceRegistration || 0;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {days > 30 ? `${Math.floor(days / 30)} meses` : `${days} días`}
          </span>
        </div>
      );
    },
  },
  {
    id: 'engagement',
    header: 'Nivel de Engagement',
    cell: ({ row }) => {
      const score = row.original.visitorStats?.engagementScore || 0;
      const hasInteracted = row.original.visitorStats?.hasInteracted;
      
      return (
        <div className="w-[120px]">
          <div className="flex items-center gap-2">
            <Progress 
              value={score} 
              className={`h-2 ${score > 70 ? 'bg-primary-100' : score > 30 ? 'bg-yellow-100' : 'bg-gray-100'}`} 
            />
            <span className="text-sm font-medium">{score}%</span>
          </div>
          {!hasInteracted && (
            <span className="text-xs text-muted-foreground">Sin actividad</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'potentialValue',
    header: 'Valor Potencial',
    cell: ({ row }) => {
      const value = row.original.visitorStats?.potentialValue || 'Bajo';
      const hasPurchased = row.original.visitorStats?.hasPurchased;
      
      const variants = {
        'Alto': { variant: 'default' as const, icon: <TrendingUp className="h-3 w-3" /> },
        'Medio': { variant: 'secondary' as const, icon: <Eye className="h-3 w-3" /> },
        'Bajo': { variant: 'outline' as const, icon: null }
      };
      
      const { variant, icon } = variants[value];
      
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={variant} className="gap-1">
            {icon}
            {value}
          </Badge>
          {hasPurchased && (
            <span className="text-xs text-green-600">Con compras</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'coursesInterest',
    header: 'Interés en Cursos',
    cell: ({ row }) => {
      const coursesViewed = row.original.visitorStats?.coursesViewed || [];
      
      if (coursesViewed.length === 0) {
        return <span className="text-muted-foreground text-sm">Sin interacciones</span>;
      }
      
      return (
        <div className="space-y-1">
          {coursesViewed.slice(0, 2).map((course, index) => (
            <div key={index} className="text-xs">
              <span className="font-medium truncate max-w-[200px] inline-block" title={course.title}>
                {course.title}
              </span>
            </div>
          ))}
          {coursesViewed.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{coursesViewed.length - 2} más...
            </span>
          )}
        </div>
      );
    },
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