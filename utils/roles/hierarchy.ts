// Sistema de jerarquía de roles
export const ROLE_HIERARCHY = {
  super_admin: 100,
  admin: 80,
  teacher: 50,
  student: 20,
  visitor: 10,
  unknown: 0
} as const

export type RoleName = keyof typeof ROLE_HIERARCHY
export type RoleLevel = typeof ROLE_HIERARCHY[keyof typeof ROLE_HIERARCHY]

// Permisos por módulo
export const MODULE_PERMISSIONS = {
  // Módulos generales
  dashboard: {
    student: ["view"],
    teacher: ["view"],
    admin: ["view"],
    super_admin: ["view", "manage"]
  },
  
  // Sesiones personalizadas
  sessions: {
    student: ["view_own", "create", "cancel"],
    teacher: ["view_own", "confirm", "manage_own"],
    admin: ["view_all", "manage_all", "reports"],
    super_admin: ["view_all", "manage_all", "reports", "delete"]
  },

  // Módulos administrativos (solo admin+)
  teacher_management: {
    admin: ["view", "manage", "payments", "performance"],
    super_admin: ["view", "manage", "payments", "performance", "delete"]
  },

  teacher_payments: {
    admin: ["view", "process", "export"],
    super_admin: ["view", "process", "export", "configure"]
  },

  teacher_performance: {
    admin: ["view", "reports"],
    super_admin: ["view", "reports", "analytics"]
  },

  system_settings: {
    super_admin: ["view", "manage", "configure"]
  },

  user_management: {
    admin: ["view", "basic_manage"],
    super_admin: ["view", "full_manage", "delete", "roles"]
  }
} as const

export type ModuleName = keyof typeof MODULE_PERMISSIONS
export type Permission = string

/**
 * Verifica si un rol tiene un nivel jerárquico mínimo
 */
export function hasMinimumRoleLevel(userRole: RoleName, minimumRole: RoleName): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0
  return userLevel >= minimumLevel
}

/**
 * Verifica si un rol tiene un permiso específico en un módulo
 */
export function hasModulePermission(
  userRole: RoleName, 
  module: ModuleName, 
  permission: Permission
): boolean {
  const modulePerms = MODULE_PERMISSIONS[module] as any
  if (!modulePerms || !modulePerms[userRole]) {
    return false
  }
  
  return modulePerms[userRole].includes(permission)
}

/**
 * Obtiene todos los permisos de un rol en un módulo
 */
export function getRolePermissions(userRole: RoleName, module: ModuleName): Permission[] {
  const modulePerms = MODULE_PERMISSIONS[module] as any
  if (!modulePerms || !modulePerms[userRole]) {
    return []
  }
  
  return modulePerms[userRole]
}

/**
 * Verifica si el usuario puede acceder a un módulo administrativo
 */
export function canAccessAdminModule(userRole: RoleName): boolean {
  return hasMinimumRoleLevel(userRole, 'admin')
}

/**
 * Verifica si el usuario puede gestionar otros usuarios
 */
export function canManageUsers(userRole: RoleName, targetRole: RoleName): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0
  
  // Solo se puede gestionar usuarios de nivel inferior
  return userLevel > targetLevel
}

/**
 * Lista de módulos disponibles según el rol
 */
export function getAvailableModules(userRole: RoleName): ModuleName[] {
  return Object.keys(MODULE_PERMISSIONS).filter(module => {
    const modulePerms = MODULE_PERMISSIONS[module as ModuleName] as any
    return modulePerms && modulePerms[userRole]
  }) as ModuleName[]
}