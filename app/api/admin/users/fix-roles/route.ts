// app/api/admin/users/fix-roles/route.ts
// Admin API endpoint to fix users who have purchases but don't have the correct student role

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

// Only admins can access this endpoint
const ALLOWED_ROLES = ["admin"];

// Environment variables for role IDs
const STUDENT_ID = process.env.STUDENT_ID; // "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"
const VISITOR_ID = process.env.VISITOR_ID; // "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"

interface UserToFix {
  id: string;
  fullName: string;
  email: string;
  customRole: string;
  purchaseCount: number;
  purchases: Array<{
    id: string;
    courseId: string;
    createdAt: Date;
  }>;
}

async function checkPermissions() {
  const session = await getUserDataServerAuth();
  if (!session || !session.user) return false;
  
  const user = session.user;
  const role = user.user_metadata?.custom_role || user.role || "";
  
  return ALLOWED_ROLES.includes(translateRole(role));
}

async function findUsersWithPurchasesAndWrongRole(): Promise<UserToFix[]> {
  // Find users who have purchases but don't have the student role
  const usersWithPurchases = await db.user.findMany({
    where: {
      purchases: {
        some: {} // Has at least one purchase
      },
      customRole: {
        not: STUDENT_ID // Role is NOT student
      }
    },
    include: {
      purchases: {
        select: {
          id: true,
          courseId: true,
          createdAt: true
        }
      }
    }
  });

  return usersWithPurchases.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    customRole: user.customRole,
    purchaseCount: user.purchases.length,
    purchases: user.purchases
  }));
}

async function fixUserRole(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.user.update({
      where: { id: userId },
      data: { customRole: STUDENT_ID }
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// GET: Find users with purchases but wrong roles
export async function GET() {
  try {
    // Check permissions
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden acceder a este endpoint." },
        { status: 403 }
      );
    }

    if (!STUDENT_ID) {
      return NextResponse.json(
        { error: "STUDENT_ID no está configurado en las variables de entorno." },
        { status: 500 }
      );
    }

    const usersToFix = await findUsersWithPurchasesAndWrongRole();

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${usersToFix.length} usuarios con compras pero roles incorrectos.`,
      data: {
        usersToFix: usersToFix,
        totalCount: usersToFix.length,
        studentRoleId: STUDENT_ID,
        visitorRoleId: VISITOR_ID
      }
    });

  } catch (error) {
    console.error("[GET /api/admin/users/fix-roles] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al buscar usuarios." },
      { status: 500 }
    );
  }
}

// POST: Fix user roles (can fix specific users or all)
export async function POST(req: NextRequest) {
  try {
    // Check permissions
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden acceder a este endpoint." },
        { status: 403 }
      );
    }

    if (!STUDENT_ID) {
      return NextResponse.json(
        { error: "STUDENT_ID no está configurado en las variables de entorno." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { userIds, fixAll = false } = body;

    // Validate input
    if (!fixAll && (!userIds || !Array.isArray(userIds) || userIds.length === 0)) {
      return NextResponse.json(
        { error: "Se requiere 'userIds' (array de IDs) o 'fixAll: true'." },
        { status: 400 }
      );
    }

    let usersToFix: UserToFix[];

    if (fixAll) {
      // Fix all users with purchases but wrong roles
      usersToFix = await findUsersWithPurchasesAndWrongRole();
    } else {
      // Fix specific users
      usersToFix = await db.user.findMany({
        where: {
          id: { in: userIds },
          purchases: {
            some: {} // Must have purchases
          },
          customRole: {
            not: STUDENT_ID // Role is NOT student
          }
        },
        include: {
          purchases: {
            select: {
              id: true,
              courseId: true,
              createdAt: true
            }
          }
        }
      }).then(users => users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        customRole: user.customRole,
        purchaseCount: user.purchases.length,
        purchases: user.purchases
      })));
    }

    if (usersToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se encontraron usuarios que necesiten corrección de roles.",
        data: {
          fixed: [],
          errors: [],
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0
        }
      });
    }

    // Fix each user's role
    const results = await Promise.all(
      usersToFix.map(async (user) => {
        const result = await fixUserRole(user.id);
        return {
          userId: user.id,
          userEmail: user.email,
          userFullName: user.fullName,
          previousRole: user.customRole,
          purchaseCount: user.purchaseCount,
          ...result
        };
      })
    );

    const fixed = results.filter(r => r.success);
    const errors = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Proceso completado. ${fixed.length} usuarios corregidos, ${errors.length} errores.`,
      data: {
        fixed: fixed,
        errors: errors,
        totalProcessed: results.length,
        successCount: fixed.length,
        errorCount: errors.length,
        newRole: STUDENT_ID
      }
    });

  } catch (error) {
    console.error("[POST /api/admin/users/fix-roles] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al corregir roles de usuario." },
      { status: 500 }
    );
  }
}