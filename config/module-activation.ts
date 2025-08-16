/**
 * Configuración de activación de módulos por rol
 * Este archivo controla qué módulos están activos para cada rol según el estado de pago del cliente
 * 
 * ⚡ CÓMO USAR EL SISTEMA SIMPLE:
 * 
 * 1. Para ACTIVAR/DESACTIVAR módulos cuando el cliente pague:
 *    → Edita /config/modules.ts
 *    → Cambia false → true (o viceversa)
 * 
 * 2. Para VERIFICAR si un módulo está activo en tu código:
 *    → import { isModuleActiveForRole } from './config/module-activation'
 *    → if (isModuleActiveForRole('teacher', 'protocols')) { ... }
 * 
 * 3. Para ACTIVAR módulos programáticamente:
 *    → activateModuleForRole('teacher', 'protocols')
 *    → activateModulesAfterPayment('teacher', ['protocols', 'sessions'])
 * 
 * IMPORTANTE: Este archivo se conecta automáticamente con /config/modules.ts
 */

import { MODULES, isActive as isSimpleActive, activate, deactivate, activateMultiple } from './modules';

export type RoleType = 'super_admin' | 'admin' | 'teacher' | 'student' | 'visitor' | 'unknown';

export interface ModuleConfig {
  /** Nombre del módulo */
  name: string;
  /** Etiqueta para mostrar en la UI */
  label: string;
  /** Ruta del módulo */
  route?: string;
  /** Si el módulo está activo */
  isActive: boolean;
  /** Si requiere pago para activarse */
  requiresPayment: boolean;
  /** Descripción del módulo */
  description?: string;
  /** Submódulos si los tiene */
  subModules?: SubModuleConfig[];
}

export interface SubModuleConfig {
  /** Nombre del submódulo */
  name: string;
  /** Etiqueta para mostrar en la UI */
  label: string;
  /** Ruta del submódulo */
  route: string;
  /** Si el submódulo está activo */
  isActive: boolean;
  /** Si requiere pago para activarse */
  requiresPayment: boolean;
  /** Descripción del submódulo */
  description?: string;
}

/**
 * Configuración de módulos para SUPER ADMIN
 * Acceso completo a todos los módulos
 */
export const SUPER_ADMIN_MODULES: ModuleConfig[] = [
  {
    name: 'dashboard',
    label: 'Panel Principal',
    route: '/',
    isActive: true,
    requiresPayment: false,
    description: 'Dashboard principal con estadísticas generales'
  },
  {
    name: 'course_catalog',
    label: 'Catálogo de Cursos',
    route: '/courses/catalog',
    isActive: true,
    requiresPayment: false,
    description: 'Catálogo completo de cursos disponibles'
  },
  {
    name: 'user_management',
    label: 'Gestión de Usuarios',
    isActive: true,
    requiresPayment: false,
    description: 'Administración completa de usuarios del sistema',
    subModules: [
      {
        name: 'admins',
        label: 'Administradores',
        route: '/admin/users/admins',
        isActive: true,
        requiresPayment: false,
        description: 'Gestión de usuarios administradores'
      },
      {
        name: 'teachers',
        label: 'Profesores',
        route: '/admin/users/teachers',
        isActive: true,
        requiresPayment: false,
        description: 'Gestión de profesores y sus permisos'
      },
      {
        name: 'students',
        label: 'Estudiantes',
        route: '/admin/users/students',
        isActive: true,
        requiresPayment: false,
        description: 'Gestión de estudiantes registrados'
      },
      {
        name: 'visitors',
        label: 'Visitantes',
        route: '/admin/users/visitor',
        isActive: true,
        requiresPayment: false,
        description: 'Gestión de usuarios visitantes'
      },
      {
        name: 'all_users',
        label: 'Todos los Usuarios',
        route: '/admin/users/all',
        isActive: true,
        requiresPayment: false,
        description: 'Vista consolidada de todos los usuarios'
      }
    ]
  },
  {
    name: 'teacher_management',
    label: 'Gestión de Profesores',
    isActive: true,
    requiresPayment: false,
    description: 'Herramientas administrativas para profesores',
    subModules: [
      {
        name: 'teacher_payments',
        label: 'Pagos a Profesores',
        route: '/admin/teacher-payments',
        isActive: true,
        requiresPayment: false,
        description: 'Gestión de pagos y comisiones de profesores'
      },
      {
        name: 'teacher_analytics',
        label: 'Analítica de Profesores',
        route: '/teacher/analytics',
        isActive: true,
        requiresPayment: false,
        description: 'Métricas y rendimiento de profesores'
      }
    ]
  },
  {
    name: 'course_management',
    label: 'Gestión de Cursos',
    route: '/teacher/courses',
    isActive: true,
    requiresPayment: false,
    description: 'Administración completa de cursos'
  },
  {
    name: 'exam_management',
    label: 'Gestión de Exámenes',
    route: '/exams',
    isActive: true,
    requiresPayment: false,
    description: 'Creación y gestión de quizzes y exámenes'
  },
  {
    name: 'certificates',
    label: 'Certificados',
    route: '/admin/certificates',
    isActive: true,
    requiresPayment: false,
    description: 'Gestión y creación de certificados'
  },
  {
    name: 'manual_registrations',
    label: 'Registros Manuales',
    route: '/admin/manual-registrations',
    isActive: true,
    requiresPayment: false,
    description: 'Registro manual de usuarios y accesos'
  },
  {
    name: 'document_validation',
    label: 'Validación de Documentos',
    route: '/admin/validations',
    isActive: true,
    requiresPayment: false,
    description: 'Validación y verificación de documentos'
  },
  {
    name: 'analytics',
    label: 'Analítica Avanzada',
    route: '/admin/analytics',
    isActive: true,
    requiresPayment: false,
    description: 'Reportes y análisis avanzados del sistema'
  },
  {
    name: 'system_settings',
    label: 'Configuración del Sistema',
    isActive: true,
    requiresPayment: false,
    description: 'Configuraciones globales del sistema'
  }
];

/**
 * Configuración de módulos para ADMIN
 * Acceso administrativo con algunas limitaciones
 */
export const ADMIN_MODULES: ModuleConfig[] = [
  {
    name: 'dashboard',
    label: 'Panel Principal',
    route: '/',
    isActive: true,
    requiresPayment: false,
    description: 'Dashboard principal con estadísticas'
  },
  {
    name: 'course_catalog',
    label: 'Catálogo de Cursos',
    route: '/courses/catalog',
    isActive: true,
    requiresPayment: false,
    description: 'Catálogo de cursos disponibles'
  },
  {
    name: 'user_management',
    label: 'Gestión de Usuarios',
    isActive: true,
    requiresPayment: true, // Requiere pago para admins
    description: 'Administración de usuarios del sistema',
    subModules: [
      {
        name: 'teachers',
        label: 'Profesores',
        route: '/admin/users/teachers',
        isActive: true,
        requiresPayment: true,
        description: 'Gestión de profesores'
      },
      {
        name: 'students',
        label: 'Estudiantes',
        route: '/admin/users/students',
        isActive: true,
        requiresPayment: true,
        description: 'Gestión de estudiantes'
      },
      {
        name: 'visitors',
        label: 'Visitantes',
        route: '/admin/users/visitor',
        isActive: true,
        requiresPayment: true,
        description: 'Gestión de visitantes'
      },
      {
        name: 'all_users',
        label: 'Todos los Usuarios',
        route: '/admin/users/all',
        isActive: false, // Desactivado para admin por defecto
        requiresPayment: true,
        description: 'Vista consolidada de usuarios'
      }
    ]
  },
  {
    name: 'teacher_management',
    label: 'Gestión de Profesores',
    isActive: false, // Desactivado hasta pago
    requiresPayment: true,
    description: 'Herramientas administrativas para profesores',
    subModules: [
      {
        name: 'teacher_payments',
        label: 'Pagos a Profesores',
        route: '/admin/teacher-payments',
        isActive: false,
        requiresPayment: true,
        description: 'Gestión de pagos de profesores'
      }
    ]
  },
  {
    name: 'course_management',
    label: 'Gestión de Cursos',
    route: '/teacher/courses',
    isActive: true,
    requiresPayment: false,
    description: 'Administración básica de cursos'
  },
  {
    name: 'manual_registrations',
    label: 'Registros Manuales',
    route: '/admin/manual-registrations',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Registro manual de usuarios'
  },
  {
    name: 'document_validation',
    label: 'Validación de Documentos',
    route: '/admin/validations',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Validación de documentos'
  },
  {
    name: 'analytics',
    label: 'Analítica',
    route: '/admin/analytics',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Reportes y análisis básicos'
  }
];

/**
 * Configuración de módulos para TEACHER
 * Acceso enfocado en herramientas de enseñanza
 */
export const TEACHER_MODULES: ModuleConfig[] = [
  {
    name: 'dashboard',
    label: 'Panel Principal',
    route: '/teacher',
    isActive: true,
    requiresPayment: false,
    description: 'Dashboard para profesores'
  },
  {
    name: 'course_catalog',
    label: 'Catálogo de Cursos',
    route: '/courses/catalog',
    isActive: true,
    requiresPayment: false,
    description: 'Explorar cursos disponibles'
  },
  {
    name: 'course_management',
    label: 'Mis Cursos',
    route: '/teacher/courses',
    isActive: true,
    requiresPayment: false,
    description: 'Gestión de cursos propios'
  },
  {
    name: 'resources',
    label: 'Recursos',
    route: '/teacher/attachments',
    isActive: true,
    requiresPayment: false,
    description: 'Gestión de materiales y recursos'
  },
  {
    name: 'exam_management',
    label: 'Quizzes',
    route: '/exams',
    isActive: true,
    requiresPayment: false,
    description: 'Creación de quizzes y exámenes'
  },
  {
    name: 'protocols',
    label: 'Protocolos',
    route: '/teacher/protocols',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Gestión de protocolos educativos'
  },
  {
    name: 'custom_sessions',
    label: 'Sesiones Personalizadas',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Sesiones uno a uno con estudiantes',
    subModules: [
      {
        name: 'availability',
        label: 'Mi Disponibilidad',
        route: '/teacher/availability',
        isActive: false,
        requiresPayment: true,
        description: 'Gestión de horarios disponibles'
      },
      {
        name: 'sessions',
        label: 'Mis Sesiones',
        route: '/teacher/sessions',
        isActive: false,
        requiresPayment: true,
        description: 'Sesiones programadas'
      }
    ]
  },
  {
    name: 'user_management_basic',
    label: 'Gestión Básica de Usuarios',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Herramientas básicas de gestión de usuarios',
    subModules: [
      {
        name: 'students',
        label: 'Mis Estudiantes',
        route: '/admin/users/students',
        isActive: false,
        requiresPayment: true,
        description: 'Estudiantes de mis cursos'
      }
    ]
  },
  {
    name: 'analytics_basic',
    label: 'Analítica Básica',
    route: '/teacher/analytics',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Estadísticas básicas de rendimiento'
  }
];

/**
 * Configuración de módulos para STUDENT
 * Acceso enfocado en aprendizaje
 */
export const STUDENT_MODULES: ModuleConfig[] = [
  {
    name: 'dashboard',
    label: 'Panel Principal',
    route: '/',
    isActive: true,
    requiresPayment: false,
    description: 'Dashboard del estudiante'
  },
  {
    name: 'course_catalog',
    label: 'Catálogo de Cursos',
    route: '/courses/catalog',
    isActive: true,
    requiresPayment: false,
    description: 'Explorar y matricularse en cursos'
  },
  {
    name: 'document_validation',
    label: 'Validación de Documentos',
    route: '/validation',
    isActive: true,
    requiresPayment: false,
    description: 'Validar documentos académicos'
  },
  {
    name: 'custom_sessions',
    label: 'Sesiones Personalizadas',
    isActive: false, // Premium feature
    requiresPayment: true,
    description: 'Sesiones personalizadas con profesores',
    subModules: [
      {
        name: 'find_teachers',
        label: 'Buscar Profesores',
        route: '/students/find-teachers',
        isActive: false,
        requiresPayment: true,
        description: 'Encontrar profesores para sesiones'
      },
      {
        name: 'credits',
        label: 'Mis Créditos',
        route: '/students/credits',
        isActive: false,
        requiresPayment: true,
        description: 'Gestión de créditos para sesiones'
      },
      {
        name: 'sessions',
        label: 'Mis Sesiones',
        route: '/students/sessions',
        isActive: false,
        requiresPayment: true,
        description: 'Sesiones programadas'
      }
    ]
  },
  {
    name: 'certificates',
    label: 'Mis Certificados',
    route: '/students/my-certificates',
    isActive: true,
    requiresPayment: false,
    description: 'Certificados obtenidos'
  }
];

/**
 * Configuración de módulos para VISITOR
 * Acceso muy limitado
 */
export const VISITOR_MODULES: ModuleConfig[] = [
  {
    name: 'course_catalog',
    label: 'Catálogo de Cursos',
    route: '/courses/catalog',
    isActive: true,
    requiresPayment: false,
    description: 'Explorar cursos disponibles'
  },
  {
    name: 'dashboard',
    label: 'Panel Principal',
    route: '/',
    isActive: true,
    requiresPayment: false,
    description: 'Dashboard básico'
  },
  {
    name: 'certificates',
    label: 'Certificados',
    route: '/students/my-certificates',
    isActive: true,
    requiresPayment: false,
    description: 'Ver certificados públicos'
  }
];

/**
 * Configuración principal que mapea roles a sus módulos
 */
export const MODULE_ACTIVATION_CONFIG = {
  super_admin: SUPER_ADMIN_MODULES,
  admin: ADMIN_MODULES,
  teacher: TEACHER_MODULES,
  student: STUDENT_MODULES,
  visitor: VISITOR_MODULES,
  unknown: VISITOR_MODULES // Por defecto, usar configuración de visitante
} as const;

/**
 * Obtiene los módulos activos para un rol específico
 */
export function getActiveModulesForRole(role: RoleType): ModuleConfig[] {
  const modules = MODULE_ACTIVATION_CONFIG[role] || MODULE_ACTIVATION_CONFIG.visitor;
  return modules.filter(module => module.isActive);
}

/**
 * Obtiene todos los módulos (activos e inactivos) para un rol específico
 */
export function getAllModulesForRole(role: RoleType): ModuleConfig[] {
  return MODULE_ACTIVATION_CONFIG[role] || MODULE_ACTIVATION_CONFIG.visitor;
}

/**
 * Verifica si un módulo específico está activo para un rol
 * CONECTA CON: /config/modules.ts para control simple
 */
export function isModuleActiveForRole(role: RoleType, moduleName: string): boolean {
  // Usa el archivo simple modules.ts como fuente de verdad
  return isSimpleActive(role, moduleName);
}

/**
 * Verifica si un módulo requiere pago para un rol específico
 */
export function moduleRequiresPayment(role: RoleType, moduleName: string): boolean {
  const modules = MODULE_ACTIVATION_CONFIG[role] || MODULE_ACTIVATION_CONFIG.visitor;
  const module = modules.find(m => m.name === moduleName);
  return module?.requiresPayment || false;
}

/**
 * Activa un módulo para un rol específico (para cuando el cliente pague)
 * CONECTA CON: /config/modules.ts para control simple
 */
export function activateModuleForRole(role: RoleType, moduleName: string): boolean {
  activate(role, moduleName);
  return true;
}

/**
 * Desactiva un módulo para un rol específico
 */
export function deactivateModuleForRole(role: RoleType, moduleName: string): boolean {
  const modules = MODULE_ACTIVATION_CONFIG[role];
  if (!modules) return false;
  
  const moduleIndex = modules.findIndex(m => m.name === moduleName);
  if (moduleIndex === -1) return false;
  
  modules[moduleIndex].isActive = false;
  
  // También desactivar submódulos si los tiene
  if (modules[moduleIndex].subModules) {
    modules[moduleIndex].subModules!.forEach(subModule => {
      subModule.isActive = false;
    });
  }
  
  return true;
}

/**
 * Obtiene módulos que requieren pago pero están inactivos
 */
export function getPendingPaymentModules(role: RoleType): ModuleConfig[] {
  const modules = MODULE_ACTIVATION_CONFIG[role] || MODULE_ACTIVATION_CONFIG.visitor;
  return modules.filter(module => !module.isActive && module.requiresPayment);
}

/**
 * Activar múltiples módulos después del pago
 * CONECTA CON: /config/modules.ts para control simple
 */
export function activateModulesAfterPayment(role: RoleType, moduleNames: string[]): boolean {
  activateMultiple(role, moduleNames);
  return true;
}