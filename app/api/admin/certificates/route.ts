import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

const ALLOWED_ROLES = ["admin", "teacher"];

async function checkPermissions() {
  const session = await getUserDataServerAuth();
  if (!session || !session.user) return false;
  const user = session.user;
  if (
    ALLOWED_ROLES.includes(translateRole(user.role)) ||
    ALLOWED_ROLES.includes(translateRole(user.user_metadata?.custom_role))
  ) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    // const hasPermission = await checkPermissions();
    // if (!hasPermission) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Unauthorized. You do not have permission to access this resource.",
    //     },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams?.get("page") || "1", 10);
    const limit = parseInt(searchParams?.get("limit") || "10", 10);
    const search = searchParams?.get("search")?.trim() || "";
    const userFilter = searchParams?.get("user")?.trim() || "";
    const courseFilter = searchParams?.get("course")?.trim() || "";
    const codeFilter = searchParams?.get("code")?.trim() || "";

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

    const skip = (page - 1) * limit;
    const take = limit;

    const total = await db.certificate.count({ where });

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
  } catch (error: any) {
    console.error("Error in GET /api/admin/certificates:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred while fetching certificates.",
        message: error.message,
        ...(process.env.NODE_ENV !== "production" && {
          stack: error.stack,
          name: error.name,
        }),
      },
      { status: 500 }
    );
  }
}
