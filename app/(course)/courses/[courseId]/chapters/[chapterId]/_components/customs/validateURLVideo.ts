export function validateURLVideo(url: string | null) {

    if (url === null) {
      return false;
    }
    // Comprobación mejorada para URLs de YouTube
    const isYouTubeURL = /(youtu\.be\/|youtube\.com\/(watch\?v=|embed\/))/i.test(url);

    // Simplificación del retorno utilizando directamente la condición
    return isYouTubeURL && url !== "https://rbtpmedup-landing-page.vercel.app/";
}