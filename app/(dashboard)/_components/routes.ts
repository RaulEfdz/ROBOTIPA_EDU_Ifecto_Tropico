import {
  Layout,
  Compass,
  Bell,
  HelpCircle,
  List,
  Folder,
  Brain,
  Users,
  UserCheck,
  UserPlus,
  BarChart,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  FileSignature,
  Files, // Añadido para Registros Manuales y Certificados
} from "lucide-react";

export interface Badge {
  color?: string;
  viewLabel?: boolean;
  until?: Date;
  textLabel?: string;
}

export interface SubRoute {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: Badge;
  superAdmin?: boolean;
}

export interface Route {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  badge?: Badge;
  superAdmin?: boolean;
  subRoutes?: SubRoute[];
  isCollapsible?: boolean;
}

export const guestRoutes: Route[] = [
  { icon: Compass, label: "Catálogo", href: "/courses/catalog" },

  { icon: Layout, label: "Tablero", href: "/" },
  // { icon: Bell, label: "Notificaciones", href: "/notifications" },
  // { icon: HelpCircle, label: "Ayuda", href: "/help" },
  {
    icon: FileSignature,
    label: "Mis Certificados",
    href: "/students/my-certificates",
  },
];

export const teacherRoutes: Route[] = [
  { icon: Compass, label: "Catálogo", href: "/courses/catalog" },

  { icon: Layout, label: "Tablero", href: "/teacher" },
  { icon: List, label: "Cursos", href: "/teacher/courses" },
  {
    icon: Folder,
    label: "Recursos",
    href: "/teacher/attachments",
    // badge: {
    //   viewLabel: true,
    //   until: new Date("2025-10-01"),
    //   // textLabel: "Nuevo",
    //   color: "text-green-400",
    // },
  },
  {
    icon: Brain,
    label: "Quizzes",
    href: "/exams",
    // badge: {
    //   viewLabel: true,
    //   until: new Date("2025-10-01"),
    //   // textLabel: "Nuevo",
    //   color: "text-emerald-400",
    // },
  },
  {
    icon: Users,
    label: "Usuarios y Registros", // Renombrado para agrupar más cosas
    isCollapsible: true,
    href: "/admin/users",
    subRoutes: [
      {
        icon: UserCheck,
        label: "Administradores",
        href: "/admin/users/admins",
        // superAdmin: true, // Quitar si Profesores también deben ver
      },
      {
        icon: UserCheck,
        label: "Profesores",
        href: "/admin/users/teachers",
        // superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Estudiantes",
        href: "/admin/users/students",
        // superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Visitantes",
        href: "/admin/users/visitor",
        // superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Todos los Usuarios",
        href: "/admin/users/all",
      },
      // --- NUEVA SUB-RUTA PARA REGISTRO MANUAL ---
      {
        icon: FileSignature,
        label: "Registros Manuales",
        href: "/admin/manual-registrations",
        // badge: {
        //   viewLabel: true,
        //   until: new Date("2025-12-31"),
        //   textLabel: "Nuevo",
        // },
        // No se pone 'superAdmin: true' si es para Profesores Y Administradores.
      },
      // --- FIN NUEVA SUB-RUTA ---
    ],
    // superAdmin: true, // Quitar si Profesores también deben ver la sección
  },
  {
    icon: BarChart,
    label: "Analítica",
    href: "/teacher/analytics",
    // badge: {
    //   viewLabel: true,
    //   until: new Date("2025-10-01"),
    //   textLabel: "Actualizado",
    //   color: "text-rose-400",
    // },
    superAdmin: true,
  },
  {
    icon: FileSignature,
    label: "Gestionar Certificados",
    href: "/admin/certificates/manage",
  },
  {
    icon: FileSignature,
    label: "Certificado Dinámico",
    href: "/admin/certificates/dynamic-create",
    badge: {
      viewLabel: true,
      until: new Date("2025-12-31"),
      textLabel: "Nuevo",
      color: "text-emerald-400",
    },
  },
  // {
  //   icon: FileSignature,
  //   label: "Crear Certificado Manual",
  //   href: "/admin/certificates/manage",
  //   badge: {
  //     viewLabel: true,
  //     until: new Date("2025-12-31"),
  //     textLabel: "Manual",
  //     color: "text-emerald-400",
  //   },
  // },
];
