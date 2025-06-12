export const columnVisibility: { [key: string]: boolean } = {
  id: false, // Ocultar columna ID
  fullName: true, // Mostrar columna Nombre
  email: true, // Mostrar columna Email
  username: false, // Ocultar columna Nombre de usuario
  phone: false, // Ocultar columna Teléfono
  totalCourses: true, // Mostrar columna Cursos Inscritos
  completedCourses: true, // Mostrar columna Cursos Completados
  averageProgress: true, // Mostrar columna Progreso Promedio
  coursesDetail: true, // Mostrar columna Detalle por Curso
  customRole: false, // Ocultar columna Rol (ya sabemos que son estudiantes)
  provider: false, // Ocultar columna Proveedor
  lastSignInAt: true, // Mostrar columna Último inicio
  metadata: false, // Ocultar columna Metadatos
  isActive: true, // Mostrar columna Activo
  isBanned: false, // Ocultar columna Baneado
  isDeleted: false, // Ocultar columna Eliminado
  additionalStatus: false, // Ocultar columna Estado adicional
  createdAt: false, // Ocultar columna Creado
  updatedAt: false, // Ocultar columna Actualizado
  courses: false, // Ocultar columna Cursos (reemplazada por las nuevas)
  purchases: false, // Ocultar columna Compras
  userProgress: false, // Ocultar columna Progreso (reemplazada por las nuevas)
  invoices: false, // Ocultar columna Facturas
  examAttempts: false, // Ocultar columna Intentos de examen
  actions: true, // Mostrar columna Acciones
};
