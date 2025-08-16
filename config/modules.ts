/**
 * CONFIGURACIÓN SIMPLE DE MÓDULOS
 * 
 * Cambia solo true/false para activar/desactivar módulos cuando el cliente pague
 * Este archivo se conecta automáticamente con module-activation.ts
 */

export const MODULES = {
  /**
   * SUPER ADMIN - Acceso completo siempre
   */
  super_admin: {
    dashboard: true,
    course_catalog: true,
    user_management: true,
    teacher_management: true,
    course_management: true,
    exam_management: true,
    certificates: true,
    manual_registrations: true,
    document_validation: true,
    analytics: true,
    system_settings: true,
    whatsapp_special_price: true,  // Siempre activo para super admin
  },

  /**
   * ADMIN - Algunas funciones requieren pago
   */
  admin: {
    dashboard: true,
    course_catalog: true,
    user_management: true,         // ✅ ACTIVO PARA TESTING
    teacher_management: true,      // ✅ ACTIVO PARA TESTING
    course_management: true,
    manual_registrations: true,    // ✅ ACTIVO PARA TESTING
    document_validation: true,     // ✅ ACTIVO PARA TESTING
    analytics: true,               // ✅ ACTIVO PARA TESTING
    certificates: true,            // ✅ ACTIVO PARA TESTING
    whatsapp_special_price: false, // 💰 CAMBIAR A true CUANDO PAGUE - Precio especial WhatsApp
  },

  /**
   * TEACHER - Funciones premium requieren pago
   */
  teacher: {
    dashboard: true,
    course_catalog: true,
    course_management: true,
    resources: true,
    exam_management: true,
    protocols: false,              // 💰 CAMBIAR A true CUANDO PAGUE
    custom_sessions: false,        // 💰 CAMBIAR A true CUANDO PAGUE
    user_management_basic: false,  // 💰 CAMBIAR A true CUANDO PAGUE
    analytics_basic: false,        // 💰 CAMBIAR A true CUANDO PAGUE
    whatsapp_special_price: false, // 💰 CAMBIAR A true CUANDO PAGUE - Precio especial WhatsApp
  },

  /**
   * STUDENT - Sesiones personalizadas son premium
   */
  student: {
    dashboard: true,
    course_catalog: true,
    document_validation: true,
    custom_sessions: false,        // 💰 CAMBIAR A true CUANDO PAGUE
    certificates: true,
  },

  /**
   * VISITOR - Acceso muy limitado
   */
  visitor: {
    course_catalog: true,
    dashboard: true,
    certificates: true,
  },

  /**
   * UNKNOWN - Same as visitor
   */
  unknown: {
    course_catalog: true,
    dashboard: true,
    certificates: true,
  }
} as const;

/**
 * FUNCIONES SIMPLES PARA USAR EN EL CÓDIGO
 */

/**
 * Verifica si un módulo está activo para un rol
 */
export function isActive(role: keyof typeof MODULES, module: string): boolean {
  return MODULES[role]?.[module as keyof typeof MODULES[typeof role]] || false;
}

/**
 * Activa un módulo (cuando el cliente pague)
 */
export function activate(role: keyof typeof MODULES, module: string): void {
  if (MODULES[role]) {
    (MODULES[role] as any)[module] = true;
  }
}

/**
 * Desactiva un módulo
 */
export function deactivate(role: keyof typeof MODULES, module: string): void {
  if (MODULES[role]) {
    (MODULES[role] as any)[module] = false;
  }
}

/**
 * Activa múltiples módulos de una vez (cuando el cliente pague un paquete)
 */
export function activateMultiple(role: keyof typeof MODULES, modules: string[]): void {
  modules.forEach(module => activate(role, module));
}

/**
 * Obtiene todos los módulos activos para un rol
 */
export function getActiveModules(role: keyof typeof MODULES): string[] {
  const roleModules = MODULES[role];
  if (!roleModules) return [];
  
  return Object.entries(roleModules)
    .filter(([_, isActive]) => isActive)
    .map(([module, _]) => module);
}

/**
 * Obtiene todos los módulos inactivos para un rol (los que requieren pago)
 */
export function getInactiveModules(role: keyof typeof MODULES): string[] {
  const roleModules = MODULES[role];
  if (!roleModules) return [];
  
  return Object.entries(roleModules)
    .filter(([_, isActive]) => !isActive)
    .map(([module, _]) => module);
}

/**
 * EJEMPLOS DE USO:
 * 
 * // Verificar si un módulo está activo
 * if (isActive('teacher', 'protocols')) {
 *   // Mostrar el módulo de protocolos
 * }
 * 
 * // Cuando el cliente pague, activar módulos
 * activate('teacher', 'protocols');
 * activate('teacher', 'custom_sessions');
 * 
 * // O activar múltiples de una vez
 * activateMultiple('teacher', ['protocols', 'custom_sessions', 'analytics_basic']);
 * 
 * // Ver qué está activo
 * const active = getActiveModules('teacher');
 * console.log('Módulos activos:', active);
 */