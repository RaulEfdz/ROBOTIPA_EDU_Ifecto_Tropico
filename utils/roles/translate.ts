interface Roles {
  teacher: string;
  student: string;
  admin: string;
  visitor: string;
}

// Rol => UUID desde env
const roles: Roles = {
  teacher: process.env.NEXT_PUBLIC_TEACHER_ID || "",
  student: process.env.NEXT_PUBLIC_STUDENT_ID || "",
  admin: process.env.NEXT_PUBLIC_ADMIN_ID || "",
  visitor: process.env.NEXT_PUBLIC_VISITOR_ID || "",
};

// ✅ Traduce nombre ↔ UUID
export function translateRole(input: string): string {
  // Si input es el nombre del rol, devuelve el ID
  if (input in roles) {
    return roles[input as keyof Roles];
  }

  // Si input es un ID, devuelve el nombre del rol
  const roleName = Object.entries(roles).find(([, id]) => id === input)?.[0];
  if (roleName) {
    return roleName;
  }

  throw new Error(`Rol no encontrado: ${input}`);
}

// ✅ Devuelve todos los roles con nombre e ID
export function getAllRoles(): { name: string; id: string }[] {
  return Object.entries(roles).map(([name, id]) => ({ name, id }));
}

// ✅ Accesos rápidos a cada rol por ID
export function getTeacherId(): string {
  return roles.teacher;
}

export function getStudentId(): string {
  return roles.student;
}

export function getAdminId(): string {
  return roles.admin;
}

export function getVisitorId(): string {
  return roles.visitor;
}

export function isValidRole(roleId: string): boolean {
  return Object.values(roles).includes(roleId);
}
