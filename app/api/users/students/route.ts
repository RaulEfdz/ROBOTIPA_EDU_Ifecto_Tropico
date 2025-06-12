import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/students - Devuelve todos los estudiantes con información de progreso
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de estudiante
    if (!STUDENT_ID || typeof STUDENT_ID !== "string") {
      console.error(
        "[API students] Environment variable STUDENT_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Student Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Estudiantes con información de progreso
    const students = await db.user.findMany({
      where: { customRole: STUDENT_ID },
      orderBy: { fullName: "asc" },
      include: {
        purchases: {
          include: {
            course: {
              include: {
                chapters: {
                  where: { isPublished: true },
                  select: { id: true }
                }
              }
            }
          }
        },
        userProgress: {
          where: { isCompleted: true }
        }
      }
    });

    // Procesar datos para calcular el progreso por curso
    const studentsWithProgress = students.map(student => {
      const coursesProgress = student.purchases.map(purchase => {
        const course = purchase.course;
        const totalChapters = course.chapters.length;
        const completedChapters = student.userProgress.filter(
          progress => course.chapters.some(chapter => chapter.id === progress.chapterId)
        ).length;
        
        const progressPercentage = totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          totalChapters,
          completedChapters,
          progressPercentage
        };
      });

      // Calcular progreso general del estudiante
      const totalCourses = coursesProgress.length;
      const completedCourses = coursesProgress.filter(cp => cp.progressPercentage === 100).length;
      const averageProgress = totalCourses > 0
        ? Math.round(coursesProgress.reduce((sum, cp) => sum + cp.progressPercentage, 0) / totalCourses)
        : 0;

      return {
        ...student,
        coursesProgress,
        studentStats: {
          totalCourses,
          completedCourses,
          averageProgress
        }
      };
    });

    return NextResponse.json({ success: true, students: studentsWithProgress });
  } catch (error) {
    console.error("[API students GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching students." },
      { status: 500 }
    );
  }
}
