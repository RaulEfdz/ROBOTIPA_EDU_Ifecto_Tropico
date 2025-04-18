import { db } from "@/lib/db";
import { randomColorWithIntensity } from "@/tools/handlerColors";
import { Course, Purchase } from "@prisma/client";
type PurchaseWithCourse = Purchase & {
  course: Course;
};
const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += purchase.course.price!;
  });
  return grouped;
};
export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId
        }
      },
      include: {
        course: true,
      }
    });
    const groupedEarnings = groupByCourse(purchases);

    type EarningsByCourse = {
      [courseTitle: string]: number;
    };
    // Definir un tipo para el acumulador en TypeScript
    type InscriptionsByCourse = {
      [courseTitle: string]: number;
    };
    // Agrupar las inscripciones por título del curso

    const inscriptionsByCourse = purchases.reduce((acc: InscriptionsByCourse, purchase) => {
      const title = purchase.course.title;
      if (!acc[title]) {
        acc[title] = 0;
      }
      acc[title]++; // Incrementar el contador para cada inscripción
      return acc;
    }, {} as InscriptionsByCourse);

    const data = Object.entries(inscriptionsByCourse).map(([courseTitle, count]) => ({
      name: courseTitle,
      total: count,
      color: randomColorWithIntensity({ excepting: ['White_1', 'White_2', 'White'] })
    }));
    
    const totalSales = purchases.length;
    return {
      data: data,
      totalSales,
    }

  } catch (error) {
    console.error("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    }
  }
}


function createDataVariation(originalData: any[], totalSales: number) {
  let datas: { name: string; total: number; color: string }[] = [];
  for (let i = 0; i < totalSales; i++) {
    const randomAddition = Math.floor(Math.random() * 10); // Número aleatorio entre 0 y 9
    const uniqueName = `Name-${Math.random().toString(36).substr(2, 5)}-${i}`; // Genera un string aleatorio único con el índice del bucle
    const excludedColors = ['White_1', 'White_2', 'White']; // Colores base a excluir
    const additionalExclusions = Math.random() > 0.5 ? ['PanelCustom'] : []; // 50% de probabilidad de excluir 'PanelCustom'
    datas.push({
      total: originalData[0].total + randomAddition,
      name: uniqueName,
      color: randomColorWithIntensity({ excepting: excludedColors.concat(additionalExclusions) })
    });
  }
  return datas;
}
