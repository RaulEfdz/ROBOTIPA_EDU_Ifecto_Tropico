import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { translateRole } from '@/utils/roles/translate';
import { User } from '@/prisma/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Extender el tipo User para incluir información de progreso
interface UserWithProgress extends User {
  coursesProgress?: Array<{
    courseId: string;
    courseTitle: string;
    totalChapters: number;
    completedChapters: number;
    progressPercentage: number;
  }>;
  studentStats?: {
    totalCourses: number;
    completedCourses: number;
    averageProgress: number;
  };
}

// Definición de columnas
export const columns: ColumnDef<UserWithProgress>[] = [
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
    id: 'totalCourses',
    header: 'Cursos Inscritos',
    cell: ({ row }) => {
      const stats = row.original.studentStats;
      return (
        <div className="text-center">
          <Badge variant="secondary">
            {stats?.totalCourses || 0}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'completedCourses',
    header: 'Cursos Completados',
    cell: ({ row }) => {
      const stats = row.original.studentStats;
      return (
        <div className="text-center">
          <Badge variant={stats?.completedCourses ? "default" : "outline"}>
            {stats?.completedCourses || 0}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'averageProgress',
    header: 'Progreso Promedio',
    cell: ({ row }) => {
      const stats = row.original.studentStats;
      const progress = stats?.averageProgress || 0;
      return (
        <div className="w-[120px]">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'coursesDetail',
    header: 'Detalle por Curso',
    cell: ({ row }) => {
      const coursesProgress = row.original.coursesProgress || [];
      if (coursesProgress.length === 0) {
        return <span className="text-muted-foreground">Sin cursos</span>;
      }
      
      return (
        <div className="space-y-1">
          {coursesProgress.slice(0, 2).map((course, index) => (
            <div key={index} className="text-xs">
              <div className="font-medium truncate max-w-[200px]" title={course.courseTitle}>
                {course.courseTitle}
              </div>
              <div className="flex items-center gap-1">
                <Progress value={course.progressPercentage} className="h-1 w-20" />
                <span className="text-muted-foreground">
                  {course.completedChapters}/{course.totalChapters} ({course.progressPercentage}%)
                </span>
              </div>
            </div>
          ))}
          {coursesProgress.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{coursesProgress.length - 2} más...
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
    cell: ({ row }) => {
      const student = row.original;
      const coursesProgress = student.coursesProgress || [];
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Aquí se podría abrir un modal con más detalles
              console.log('Detalles del estudiante:', student);
              console.log('Progreso en cursos:', coursesProgress);
            }}
          >
            Ver Detalles
          </Button>
        </div>
      );
    },
  },
];