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
  { icon: Layout, label: "Tablero", href: "/" },
  { icon: Compass, label: "Explorar", href: "/search" },
  { icon: Bell, label: "Notificaciones", href: "/notifications" },
  { icon: HelpCircle, label: "Ayuda", href: "/help" },
];

export const teacherRoutes: Route[] = [
  { icon: Layout, label: "Tablero", href: "/teacher" },
  { icon: List, label: "Cursos", href: "/teacher/courses" },
  {
    icon: Folder,
    label: "Recursos",
    href: "/teacher/attachments",
    badge: {
      viewLabel: true,
      until: new Date("2025-10-01"),
      textLabel: "Nuevo",
      color: "text-green-400",
    },
  },
  {
    icon: Brain,
    label: "Quizzes",
    href: "/teacher/quizzes",
    badge: {
      viewLabel: true,
      until: new Date("2025-10-01"),
      textLabel: "Nuevo",
      color: "text-blue-400",
    },
  },
  {
    icon: Users,
    label: "Usuarios",
    isCollapsible: true,
    href: "/users",
    subRoutes: [
      {
        icon: UserCheck,
        label: "Administradores",
        href: "/admin/users/admins",
        badge: {
          viewLabel: true,
          until: new Date("2025-10-01"),
          textLabel: "Nuevo",
          color: "text-purple-400",
        },
        superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Profesores",
        href: "/admin/users/teachers",
        badge: {
          viewLabel: true,
          until: new Date("2025-10-01"),
          textLabel: "Nuevo",
          color: "text-purple-400",
        },
        superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Estudiantes",
        href: "/admin/users/students",
        badge: {
          viewLabel: true,
          until: new Date("2025-10-01"),
          textLabel: "Nuevo",
          color: "text-purple-400",
        },
        superAdmin: true,
      },
      {
        icon: UserCheck,
        label: "Visitantes",
        href: "/admin/users/visitor",
        badge: {
          viewLabel: true,
          until: new Date("2025-10-01"),
          textLabel: "Nuevo",
          color: "text-purple-400",
        },
        superAdmin: true,
      },
    ],
  },
  {
    icon: BarChart,
    label: "Analítica",
    href: "/teacher/analytics",
    badge: {
      viewLabel: true,
      until: new Date("2025-10-01"),
      textLabel: "Actualizado",
      color: "text-rose-400",
    },
    superAdmin: true,
  },
  { icon: Settings, label: "Configuración", href: "/teacher/settings" },
];
