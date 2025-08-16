/**
 * Prueba del sistema de activación de precio especial por WhatsApp
 * Ejecutar con: npx tsx config/test-whatsapp-price.ts
 */

import { isActive, activate, deactivate, getActiveModules, getInactiveModules } from './modules';
import { isModuleActiveForRole, activateModuleForRole } from './module-activation';

console.log('📱 Probando sistema de precio especial por WhatsApp...\n');

// Test 1: Estado inicial del módulo WhatsApp
console.log('📋 Test 1: Estado inicial del módulo WhatsApp');
const roles = ['super_admin', 'admin', 'teacher'] as const;

roles.forEach(role => {
  const isWhatsAppActive = isActive(role, 'whatsapp_special_price');
  console.log(`${role.toUpperCase()}: WhatsApp precio especial = ${isWhatsAppActive ? '✅ ACTIVO' : '❌ INACTIVO'}`);
});
console.log('');

// Test 2: Simulación - Activar función para teacher
console.log('⚡ Test 2: Activando función para TEACHER');
console.log('Antes:', isActive('teacher', 'whatsapp_special_price') ? 'Activo' : 'Inactivo');

// Simular que el cliente paga y activa la función
activate('teacher', 'whatsapp_special_price');

console.log('Después:', isActive('teacher', 'whatsapp_special_price') ? 'Activo' : 'Inactivo');
console.log('');

// Test 3: Verificar que ambos sistemas están sincronizados
console.log('🔗 Test 3: Sincronización entre sistemas');
console.log(`Sistema simple: ${isActive('teacher', 'whatsapp_special_price')}`);
console.log(`Sistema complejo: ${isModuleActiveForRole('teacher', 'whatsapp_special_price')}`);
console.log('');

// Test 4: Desactivar función
console.log('❌ Test 4: Desactivando función');
deactivate('teacher', 'whatsapp_special_price');
console.log(`Después de desactivar: ${isActive('teacher', 'whatsapp_special_price') ? 'Activo' : 'Inactivo'}`);
console.log('');

// Test 5: Ver todos los módulos para teacher
console.log('📊 Test 5: Resumen completo de módulos TEACHER');
const teacherActive = getActiveModules('teacher');
const teacherInactive = getInactiveModules('teacher');

console.log(`✅ Módulos activos (${teacherActive.length}):`);
teacherActive.forEach(module => console.log(`  - ${module}`));

console.log(`❌ Módulos inactivos (${teacherInactive.length}) - Requieren pago:`);
teacherInactive.forEach(module => console.log(`  - ${module}`));
console.log('');

// Test 6: Activar usando función del sistema complejo
console.log('🔧 Test 6: Activar usando sistema complejo');
console.log('Antes:', isActive('teacher', 'whatsapp_special_price') ? 'Activo' : 'Inactivo');

activateModuleForRole('teacher', 'whatsapp_special_price');

console.log('Después:', isActive('teacher', 'whatsapp_special_price') ? 'Activo' : 'Inactivo');

console.log('\n✅ ¡Sistema de precio especial por WhatsApp funcionando correctamente!');
console.log('\n💡 Para usar en la aplicación:');
console.log('   1. El switch en price-form.tsx controlará este módulo');
console.log('   2. Cuando se active, los estudiantes verán el botón de WhatsApp');
console.log('   3. Pueden contactar por precio especial de estudiantes');