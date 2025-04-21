// locales/analytics-dashboard.ts

// Un set de traducción para cada clave, con español e inglés
export interface TranslationSet {
  es: string;
  en: string;
}

// Las claves que usamos en el dashboard
export interface AnalyticsDashboardTexts {
  // Loading State
  loadingMessage: TranslationSet;

  // Toasts
  analyticsLoadedSuccess: TranslationSet;
  errorLoadingAnalytics: TranslationSet;

  // Términos generales
  published: TranslationSet;
  unpublished: TranslationSet;
  free: TranslationSet;
  premium: TranslationSet;
  users: TranslationSet;
  courses: TranslationSet;
  chapters: TranslationSet;
  purchases: TranslationSet;
  invoices: TranslationSet;
  revenue: TranslationSet;
  exams: TranslationSet;
  attempts: TranslationSet;

  // Rangos de tiempo y pestañas
  week: TranslationSet;
  month: TranslationSet;
  year: TranslationSet;
  overview: TranslationSet;

  // Cabecera
  dashboardTitle: TranslationSet;

  // Tarjetas de estadísticas
  vsLastPeriod: TranslationSet;

  // Secciones
  growthTrends: TranslationSet;
  courseStatus: TranslationSet;
  chapterTypes: TranslationSet;
  summaryByCategory: TranslationSet;
  courseAnalytics: TranslationSet;
  chapterAnalytics: TranslationSet;
  revenueAnalytics: TranslationSet;
  examStatistics: TranslationSet;
  totalRevenue: TranslationSet;
  invoicesIssued: TranslationSet;
  totalExams: TranslationSet;
  publishedExams: TranslationSet;
  totalAttempts: TranslationSet;

  // Descripciones examen
  allExamsInSystem: TranslationSet;
  availableToStudents: TranslationSet;
  examSubmissions: TranslationSet;

  // Pie de página
  lastUpdated: TranslationSet;

  // Meses abreviados
  monthJan: TranslationSet;
  monthFeb: TranslationSet;
  monthMar: TranslationSet;
  monthApr: TranslationSet;
  monthMay: TranslationSet;
  monthJun: TranslationSet;
}

// Diccionario de textos traducidos
export const texts: AnalyticsDashboardTexts = {
  loadingMessage: {
    es: "Cargando datos del dashboard…",
    en: "Loading dashboard data…",
  },

  analyticsLoadedSuccess: {
    es: "Analíticas cargadas con éxito",
    en: "Analytics loaded successfully",
  },
  errorLoadingAnalytics: {
    es: "Error al cargar las analíticas",
    en: "Error loading analytics",
  },

  published: { es: "Publicados", en: "Published" },
  unpublished: { es: "No publicados", en: "Unpublished" },
  free: { es: "Gratis", en: "Free" },
  premium: { es: "Premium", en: "Premium" },
  users: { es: "Usuarios", en: "Users" },
  courses: { es: "Cursos", en: "Courses" },
  chapters: { es: "Capítulos", en: "Chapters" },
  purchases: { es: "Compras", en: "Purchases" },
  invoices: { es: "Facturas", en: "Invoices" },
  revenue: { es: "Ingresos", en: "Revenue" },
  exams: { es: "Exámenes", en: "Exams" },
  attempts: { es: "Intentos", en: "Attempts" },

  week: { es: "Semana", en: "Week" },
  month: { es: "Mes", en: "Month" },
  year: { es: "Año", en: "Year" },
  overview: { es: "Resumen", en: "Overview" },

  dashboardTitle: {
    es: "Panel de Analíticas",
    en: "Analytics Dashboard",
  },

  vsLastPeriod: { es: "vs período anterior", en: "vs last period" },

  growthTrends: {
    es: "Tendencias de Crecimiento (------T-----)",
    en: "Growth Trends",
  },
  courseStatus: { es: "Estado del Curso", en: "Course Status" },
  chapterTypes: { es: "Tipos de Capítulo", en: "Chapter Types" },
  summaryByCategory: { es: "Resumen por Categoría", en: "Summary by Category" },
  courseAnalytics: { es: "Analíticas de Cursos", en: "Course Analytics" },
  chapterAnalytics: { es: "Analíticas de Capítulos", en: "Chapter Analytics" },
  revenueAnalytics: { es: "Analíticas de Ingresos", en: "Revenue Analytics" },
  examStatistics: { es: "Estadísticas de Exámenes", en: "Exam Statistics" },
  totalRevenue: { es: "Ingresos Totales", en: "Total Revenue" },
  invoicesIssued: { es: "Facturas Emitidas", en: "Invoices Issued" },
  totalExams: { es: "Exámenes Totales", en: "Total Exams" },
  publishedExams: { es: "Exámenes Publicados", en: "Published Exams" },
  totalAttempts: { es: "Intentos Totales", en: "Total Attempts" },

  allExamsInSystem: {
    es: "Todos los exámenes en el sistema",
    en: "All exams in the system",
  },
  availableToStudents: {
    es: "Disponibles para estudiantes",
    en: "Available to students",
  },
  examSubmissions: {
    es: "Envíos de exámenes",
    en: "Exam submissions",
  },

  lastUpdated: { es: "Última actualización:", en: "Last updated:" },

  monthJan: { es: "Ene", en: "Jan" },
  monthFeb: { es: "Feb", en: "Feb" },
  monthMar: { es: "Mar", en: "Mar" },
  monthApr: { es: "Abr", en: "Apr" },
  monthMay: { es: "May", en: "May" },
  monthJun: { es: "Jun", en: "Jun" },
};

// Idiomas soportados y valor por defecto
export type Language = "es" | "en";
export const defaultLanguage: Language = "es";

// Firma de la función de traducción
export type TFunction = (key: keyof AnalyticsDashboardTexts) => string;
