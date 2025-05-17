import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// Permisos permitidos
const ALLOWED_ROLES = ["admin", "teacher"];

// Utilidad para verificar permisos usando Supabase
async function checkPermissions() {
  const session = await getUserDataServerAuth();
  if (!session || !session.user) return false;
  const user = session.user;
  // Permitir por user.role o user.user_metadata.custom_role
  if (
    ALLOWED_ROLES.includes(user.role) ||
    ALLOWED_ROLES.includes(user.user_metadata?.custom_role)
  ) {
    return true;
  }
  return false;
}

// GET /api/admin/certificates?page=1&limit=10&search=...&user=...&course=...&code=...
export async function GET(req: NextRequest) {
  // Verificar permisos
  const hasPermission = await checkPermissions();
  if (!hasPermission) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Leer parámetros de paginación y filtros
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search")?.trim() || "";
  const userFilter = searchParams.get("user")?.trim() || "";
  const courseFilter = searchParams.get("course")?.trim() || "";
  const codeFilter = searchParams.get("code")?.trim() || "";

  // Construir filtro dinámico
  const where: Prisma.CertificateWhereInput = {};

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (userFilter) {
    where.user = {
      OR: [
        { fullName: { contains: userFilter, mode: "insensitive" } },
        { email: { contains: userFilter, mode: "insensitive" } },
      ],
    };
  }
  if (courseFilter) {
    where.course = {
      title: { contains: courseFilter, mode: "insensitive" },
    };
  }
  if (codeFilter) {
    where.code = { contains: codeFilter, mode: "insensitive" };
  }

  // Paginación
  const skip = (page - 1) * limit;
  const take = limit;

  // Consulta total para paginación
  const total = await db.certificate.count({ where });

  // Consulta principal
  const certificates = await db.certificate.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      course: { select: { id: true, title: true } },
    },
    orderBy: { issuedAt: "desc" },
    skip,
    take,
  });

  // Formatear respuesta
  const result = certificates.map((cert) => {
    let templateVersion = null;
    if (
      cert.data &&
      typeof cert.data === "object" &&
      "templateVersion" in cert.data
    ) {
      templateVersion = (cert.data as any).templateVersion;
    }
    return {
      id: cert.id,
      code: cert.code,
      issuedAt: cert.issuedAt,
      templateVersion,
      user: {
        id: cert.user?.id,
        fullName: cert.user?.fullName,
        email: cert.user?.email,
      },
      course: {
        id: cert.course?.id,
        title: cert.course?.title,
      },
    };
  });

  return NextResponse.json({
    data: result,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
