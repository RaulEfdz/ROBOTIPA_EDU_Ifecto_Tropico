/**
 * Archivo de prueba para verificar la configuración de módulos
 * Ejecutar con: npx tsx config/test-module-activation.ts
 */

import {
  getActiveModulesForRole,
  getAllModulesForRole,
  isModuleActiveForRole,
  moduleRequiresPayment,
  activateModuleForRole,
  deactivateModuleForRole,
  getPendingPaymentModules,
  activateModulesAfterPayment,
  RoleType
} from './module-activation';

console.log('🧪 Probando configuración de módulos...\n');

// Test 1: Verificar módulos activos por rol
console.log('📋 Test 1: Módulos activos por rol');
const roles: RoleType[] = ['super_admin', 'admin', 'teacher', 'student', 'visitor'];

roles.forEach(role => {
  const activeModules = getActiveModulesForRole(role);
  console.log(`${role.toUpperCase()}: ${activeModules.length} módulos activos`);
  activeModules.forEach(module => {
    console.log(`  ✅ ${module.label} (${module.name})`);
  });
  console.log('');
});

// Test 2: Verificar módulos que requieren pago
console.log('💰 Test 2: Módulos que requieren pago para TEACHER');
const teacherPendingModules = getPendingPaymentModules('teacher');
console.log(`Módulos pendientes de pago: ${teacherPendingModules.length}`);
teacherPendingModules.forEach(module => {
  console.log(`  💳 ${module.label} - ${module.description}`);
});
console.log('');

// Test 3: Simular activación después del pago
console.log('🔓 Test 3: Activando módulos después del pago');
console.log('Antes del pago:');
console.log(`  custom_sessions activo: ${isModuleActiveForRole('teacher', 'custom_sessions')}`);
console.log(`  protocols activo: ${isModuleActiveForRole('teacher', 'protocols')}`);

// Simular pago activando módulos
activateModuleForRole('teacher', 'custom_sessions');
activateModuleForRole('teacher', 'protocols');

console.log('Después del pago:');
console.log(`  custom_sessions activo: ${isModuleActiveForRole('teacher', 'custom_sessions')}`);
console.log(`  protocols activo: ${isModuleActiveForRole('teacher', 'protocols')}`);
console.log('');

// Test 4: Verificar configuración de ADMIN vs SUPER_ADMIN
console.log('👥 Test 4: Comparación ADMIN vs SUPER_ADMIN');
const adminModules = getAllModulesForRole('admin');
const superAdminModules = getAllModulesForRole('super_admin');

console.log(`ADMIN: ${adminModules.length} módulos totales`);
console.log(`SUPER_ADMIN: ${superAdminModules.length} módulos totales`);

const adminPendingPayment = getPendingPaymentModules('admin');
const superAdminPendingPayment = getPendingPaymentModules('super_admin');

console.log(`ADMIN módulos que requieren pago: ${adminPendingPayment.length}`);
console.log(`SUPER_ADMIN módulos que requieren pago: ${superAdminPendingPayment.length}`);
console.log('');

// Test 5: Verificar acceso de estudiantes
console.log('🎓 Test 5: Configuración de STUDENT');
const studentActiveModules = getActiveModulesForRole('student');
const studentPendingModules = getPendingPaymentModules('student');

console.log(`Módulos activos: ${studentActiveModules.length}`);
studentActiveModules.forEach(module => {
  console.log(`  ✅ ${module.label}`);
});

console.log(`Módulos premium: ${studentPendingModules.length}`);
studentPendingModules.forEach(module => {
  console.log(`  💎 ${module.label}`);
});

console.log('\n✅ Pruebas completadas exitosamente!');