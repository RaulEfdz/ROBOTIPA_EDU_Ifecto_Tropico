import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/teachers - Devuelve todos los profesores con estadísticas de cursos
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de profesor
    if (!TEACHER_ID || typeof TEACHER_ID !== "string") {
      console.error(
        "[API TEACHERS] Environment variable TEACHER_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Teacher Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Profesores con información de cursos
    const teachers = await db.user.findMany({
      where: { customRole: TEACHER_ID },
      orderBy: { fullName: "asc" },
      include: {
        courses: {
          include: {
            chapters: {
              where: { isPublished: true },
              select: { id: true }
            },
            purchases: {
              select: { id: true, userId: true }
            }
          }
        }
      }
    });

    // Procesar datos para calcular estadísticas por profesor
    const teachersWithStats = await Promise.all(teachers.map(async (teacher) => {
      // Estadísticas de cursos
      const totalCourses = teacher.courses.length;
      const publishedCourses = teacher.courses.filter(course => course.isPublished).length;
      const totalStudentsEnrolled = new Set(
        teacher.courses.flatMap(course => course.purchases.map(p => p.userId))
      ).size;
      const totalRevenue = teacher.courses.reduce((sum, course) => 
        sum + (course.price || 0) * course.purchases.length, 0
      );

      // Estadísticas detalladas por curso
      const coursesStats = teacher.courses.map(course => ({
        courseId: course.id,
        courseTitle: course.title,
        isPublished: course.isPublished,
        price: course.price || 0,
        totalChapters: course.chapters.length,
        studentsEnrolled: course.purchases.length,
        revenue: (course.price || 0) * course.purchases.length
      }));

      return {
        ...teacher,
        coursesStats,
        teacherStats: {
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalStudentsEnrolled,
          totalRevenue,
          averageStudentsPerCourse: totalCourses > 0 
            ? Math.round(totalStudentsEnrolled / totalCourses) 
            : 0
        }
      };
    }));

    return NextResponse.json({ success: true, teachers: teachersWithStats });
  } catch (error) {
    console.error("[API TEACHERS GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching teachers." },
      { status: 500 }
    );
  }
}
