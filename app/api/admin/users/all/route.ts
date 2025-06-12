import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      include: {
        // Cursos creados por el usuario (como instructor)
        courses: {
          include: {
            category: true,
            chapters: {
              where: { isPublished: true },
              include: {
                video: true,
                userProgress: true,
              },
            },
            attachments: true,
            purchases: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            Certificate: true,
            exams: true,
          },
        },
        // Cursos a los que está inscrito (comprados)
        purchases: {
          include: {
            course: {
              include: {
                category: true,
                chapters: {
                  where: { isPublished: true },
                },
                attachments: true,
                Certificate: true,
              },
            },
          },
        },
        // Progreso en capítulos
        userProgress: {
          where: { isCompleted: true },
          include: {
            chapter: {
              include: {
                course: true,
                video: true,
              },
            },
          },
        },
        // Certificados obtenidos
        Certificate: {
          include: {
            course: true,
          },
        },
        // Facturas
        invoices: true,
        // Intentos de exámenes
        examAttempts: {
          include: {
            exam: true,
            answers: true,
          },
        },
        // Suscripción
        Subscription: true,
        // Métodos de pago y pagos
        PaymentMethod: {
          include: {
            Payment: true,
          },
        },
        Payment: true,
        // Logs, notificaciones, accesos, documentos legales
        AuditLog: true,
        Notification: true,
        UserAccess: {
          include: {
            tool: true,
          },
        },
        LegalDocument: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Procesar datos para agregar estadísticas específicas por rol
    const usersWithStats = users.map(user => {
      let roleStats = {};

      // Estadísticas específicas por rol
      if (user.customRole === TEACHER_ID) {
        // Estadísticas para profesores
        const totalCourses = user.courses.length;
        const publishedCourses = user.courses.filter(course => course.isPublished).length;
        const totalStudents = new Set(
          user.courses.flatMap(course => course.purchases.map(p => p.userId))
        ).size;
        const totalRevenue = user.courses.reduce((sum, course) => 
          sum + (course.price || 0) * course.purchases.length, 0
        );

        roleStats = {
          type: 'teacher',
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalStudents,
          totalRevenue,
          averageStudentsPerCourse: totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0
        };

      } else if (user.customRole === STUDENT_ID) {
        // Estadísticas para estudiantes
        const enrolledCourses = user.purchases.length;
        const completedChapters = user.userProgress.length;
        const totalChapters = user.purchases.reduce((sum, purchase) => 
          sum + purchase.course.chapters.length, 0
        );
        const overallProgress = totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 100) 
          : 0;
        const certificatesEarned = user.Certificate.length;

        roleStats = {
          type: 'student',
          enrolledCourses,
          completedChapters,
          totalChapters,
          overallProgress,
          certificatesEarned,
          averageProgressPerCourse: enrolledCourses > 0 
            ? Math.round(overallProgress / enrolledCourses) 
            : 0
        };

      } else if (user.customRole === ADMIN_ID) {
        // Estadísticas para administradores
        const daysSinceCreation = Math.floor(
          (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const lastActiveToday = user.lastSignInAt && 
          new Date(user.lastSignInAt).toDateString() === new Date().toDateString();

        roleStats = {
          type: 'admin',
          daysSinceCreation,
          lastActiveToday,
          hasFullAccess: true,
          totalLogins: user.AuditLog.filter(log => log.action === 'login').length
        };

      } else if (user.customRole === VISITOR_ID) {
        // Estadísticas para visitantes
        const daysSinceRegistration = Math.floor(
          (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const hasInteracted = user.lastSignInAt !== null;
        const hasPurchased = user.purchases.length > 0;
        
        let engagementScore = 0;
        if (hasInteracted) engagementScore += 30;
        if (hasPurchased) engagementScore += 50;
        if (user.lastSignInAt && daysSinceRegistration > 0) {
          const loginFrequency = new Date(user.lastSignInAt).getTime() - new Date(user.createdAt).getTime();
          if (loginFrequency < 7 * 24 * 60 * 60 * 1000) engagementScore += 20;
        }

        roleStats = {
          type: 'visitor',
          daysSinceRegistration,
          hasInteracted,
          hasPurchased,
          engagementScore,
          potentialValue: hasPurchased ? 'Alto' : hasInteracted ? 'Medio' : 'Bajo'
        };
      }

      // Estadísticas generales
      const generalStats = {
        totalPayments: user.Payment.length,
        totalInvoices: user.invoices.length,
        hasActiveSubscription: user.Subscription?.isActive || false,
        notificationCount: user.Notification.length,
        unreadNotifications: user.Notification.filter(n => !n.read).length
      };

      return {
        ...user,
        roleStats,
        generalStats
      };
    });

    // Estadísticas globales del sistema
    const globalStats = {
      totalUsers: users.length,
      usersByRole: {
        admins: users.filter(u => u.customRole === ADMIN_ID).length,
        teachers: users.filter(u => u.customRole === TEACHER_ID).length,
        students: users.filter(u => u.customRole === STUDENT_ID).length,
        visitors: users.filter(u => u.customRole === VISITOR_ID).length
      },
      activeUsers: users.filter(u => u.isActive).length,
      usersWithPurchases: users.filter(u => u.purchases.length > 0).length,
      totalRevenue: users.reduce((sum, user) => 
        sum + user.courses.reduce((courseSum, course) => 
          courseSum + (course.price || 0) * course.purchases.length, 0
        ), 0
      )
    };

    return NextResponse.json({
      users: usersWithStats,
      globalStats
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
