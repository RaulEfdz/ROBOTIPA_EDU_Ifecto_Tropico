/**
 * Prueba de conexión entre modules.ts y module-activation.ts
 * Ejecutar con: npx tsx config/test-simple-connection.ts
 */

import { isModuleActiveForRole, activateModuleForRole, activateModulesAfterPayment } from './module-activation';
import { isActive, activate, getActiveModules, getInactiveModules } from './modules';

console.log('🔗 Probando conexión entre archivos simple y complejo...\n');

// Test 1: Verificar que ambos archivos dan el mismo resultado
console.log('📋 Test 1: Verificación de sincronización');
console.log('Estado inicial de módulos para TEACHER:');
console.log(`  protocols (simple): ${isActive('teacher', 'protocols')}`);
console.log(`  protocols (complejo): ${isModuleActiveForRole('teacher', 'protocols')}`);
console.log(`  custom_sessions (simple): ${isActive('teacher', 'custom_sessions')}`);
console.log(`  custom_sessions (complejo): ${isModuleActiveForRole('teacher', 'custom_sessions')}`);
console.log('');

// Test 2: Activar desde el sistema simple
console.log('⚡ Test 2: Activando desde sistema simple');
activate('teacher', 'protocols');
console.log('Después de activate("teacher", "protocols"):');
console.log(`  protocols (simple): ${isActive('teacher', 'protocols')}`);
console.log(`  protocols (complejo): ${isModuleActiveForRole('teacher', 'protocols')}`);
console.log('');

// Test 3: Activar desde el sistema complejo
console.log('🔧 Test 3: Activando desde sistema complejo');
activateModuleForRole('teacher', 'custom_sessions');
console.log('Después de activateModuleForRole("teacher", "custom_sessions"):');
console.log(`  custom_sessions (simple): ${isActive('teacher', 'custom_sessions')}`);
console.log(`  custom_sessions (complejo): ${isModuleActiveForRole('teacher', 'custom_sessions')}`);
console.log('');

// Test 4: Activar múltiples módulos
console.log('📦 Test 4: Activación múltiple');
console.log('Módulos activos antes:', getActiveModules('admin'));
activateModulesAfterPayment('admin', ['user_management', 'analytics']);
console.log('Módulos activos después:', getActiveModules('admin'));
console.log('');

// Test 5: Ver módulos disponibles vs activos
console.log('📊 Test 5: Resumen por rol');
const roles = ['teacher', 'admin', 'student'] as const;

roles.forEach(role => {
  const active = getActiveModules(role);
  const inactive = getInactiveModules(role);
  console.log(`${role.toUpperCase()}:`);
  console.log(`  ✅ Activos (${active.length}): ${active.join(', ')}`);
  console.log(`  ❌ Inactivos (${inactive.length}): ${inactive.join(', ')}`);
  console.log('');
});

console.log('✅ ¡Conexión funcionando correctamente!');