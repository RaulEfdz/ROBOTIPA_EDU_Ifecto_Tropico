export interface ParsedData {
  courseId: string;
  userId: string;
  date: string; // Formato YYYY-MM-DD o YYYYMMDD según tu API de parseo
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
  // Añade aquí cualquier otro campo que tu API de parseo devuelva
}
