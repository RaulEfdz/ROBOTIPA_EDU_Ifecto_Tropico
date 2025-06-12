import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { translateRole } from '@/utils/roles/translate';
import { User } from '@/prisma/types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatCurrency';

// Extender el tipo User para incluir estadísticas de profesor
interface TeacherWithStats extends User {
  coursesStats?: Array<{
    courseId: string;
    courseTitle: string;
    isPublished: boolean;
    price: number;
    totalChapters: number;
    studentsEnrolled: number;
    revenue: number;
  }>;
  teacherStats?: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudentsEnrolled: number;
    totalRevenue: number;
    averageStudentsPerCourse: number;
  };
}

// Definición de columnas
export const columns: ColumnDef<TeacherWithStats>[] = [
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
    header: 'Cursos Totales',
    cell: ({ row }) => {
      const stats = row.original.teacherStats;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {stats?.totalCourses || 0}
          </Badge>
          {stats?.publishedCourses ? (
            <span className="text-xs text-muted-foreground">
              ({stats.publishedCourses} publicados)
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'studentsEnrolled',
    header: 'Estudiantes',
    cell: ({ row }) => {
      const stats = row.original.teacherStats;
      return (
        <div className="text-center">
          <Badge variant="outline">
            {stats?.totalStudentsEnrolled || 0}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">
            Promedio: {stats?.averageStudentsPerCourse || 0}/curso
          </div>
        </div>
      );
    },
  },
  {
    id: 'revenue',
    header: 'Ingresos Generados',
    cell: ({ row }) => {
      const stats = row.original.teacherStats;
      const revenue = stats?.totalRevenue || 0;
      return (
        <div className="font-medium">
          {formatCurrency(revenue)}
        </div>
      );
    },
  },
  {
    id: 'coursesDetail',
    header: 'Cursos Principales',
    cell: ({ row }) => {
      const coursesStats = row.original.coursesStats || [];
      if (coursesStats.length === 0) {
        return <span className="text-muted-foreground">Sin cursos</span>;
      }
      
      // Ordenar por estudiantes inscritos
      const topCourses = [...coursesStats]
        .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
        .slice(0, 2);
      
      return (
        <div className="space-y-1">
          {topCourses.map((course, index) => (
            <div key={index} className="text-xs">
              <div className="flex items-center gap-1">
                <span className="font-medium truncate max-w-[200px]" title={course.courseTitle}>
                  {course.courseTitle}
                </span>
                {course.isPublished ? (
                  <Badge variant="default" className="h-4 text-[10px]">Publicado</Badge>
                ) : (
                  <Badge variant="secondary" className="h-4 text-[10px]">Borrador</Badge>
                )}
              </div>
              <div className="text-muted-foreground">
                {course.studentsEnrolled} estudiantes • {formatCurrency(course.revenue)}
              </div>
            </div>
          ))}
          {coursesStats.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{coursesStats.length - 2} más...
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