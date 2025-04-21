export const columnVisibility: { [key: string]: boolean } = {
  id: false,               // Mostrar columna ID
  fullName: true,         // Mostrar columna Nombre
  email: true,            // Mostrar columna Email
  username: true,         // Mostrar columna Nombre de usuario
  phone: false,           // Ocultar columna Teléfono
  customRole: true,       // Mostrar columna Rol
  provider: false,        // Ocultar columna Proveedor
  lastSignInAt: true,     // Mostrar columna Último inicio
  metadata: false,        // Ocultar columna Metadatos
  isActive: true,         // Mostrar columna Activo
  isBanned: true,         // Mostrar columna Baneado
  isDeleted: false,       // Ocultar columna Eliminado
  additionalStatus: false, // Ocultar columna Estado adicional
  createdAt: true,        // Mostrar columna Creado
  updatedAt: true,        // Mostrar columna Actualizado
  courses: true,          // Mostrar columna Cursos
  purchases: false,       // Ocultar columna Compras
  userProgress: false,    // Ocultar columna Progreso
  invoices: false,        // Ocultar columna Facturas
  examAttempts: false,    // Ocultar columna Intentos de examen
  actions: true,          // Mostrar columna Acciones
};