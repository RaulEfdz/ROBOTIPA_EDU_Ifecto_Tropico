export const getQuillSafeFileBlockHtml = (
  fileUrl: string,
  fileName: string
): string => {
  return `
       <a
        href="${fileUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="color: #000; text-decoration: underline; font-weight: bold;" // Añades font-weight
      > 📎[ Archivo: ${fileName} ] </a>
  `;
};