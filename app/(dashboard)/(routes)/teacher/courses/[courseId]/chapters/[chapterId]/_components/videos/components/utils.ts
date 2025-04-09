// src/components/courses/chapters/ChapterVideoForm/utils.ts

/**
 * Extrae el ID de un video de YouTube a partir de una URL
 * Soporta varios formatos de URL de YouTube
 */
export const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|youtu\.be\/|\/v\/|\/e\/|\.be\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Función para normalizar URLs de video
 */
export const normalizeVideoUrl = (url: string) => {
  return url?.trim() || "";
};
