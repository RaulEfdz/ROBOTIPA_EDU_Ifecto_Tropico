export function validateURLVideo(url: string | null): boolean {
  if (!url) return false;

  // Patrón para YouTube (youtu.be/ID o youtube.com/watch?v=ID o embed/ID)
  const youTubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/i;

  // Patrón para Vimeo (player.vimeo.com/video/ID o vimeo.com/ID)
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/i;

  // Validamos que coincida con YouTube o con Vimeo, y no sea la URL de tu landing por defecto
  return (
    (youTubeRegex.test(url) || vimeoRegex.test(url)) &&
    url !== "https://rbtpmedup-landing-page.vercel.app/"
  );
}
