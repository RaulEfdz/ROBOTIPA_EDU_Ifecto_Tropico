export function formatText(inputText: string) {
    if (typeof inputText !== 'string') {
      throw new Error('Input must be a string');
    }
  
    // Función para quitar tildes y caracteres especiales
    const normalizeText = (text: string) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 _]/g, '');
  
    // Normaliza el texto, reemplaza '_' por espacios y convierte a mayúsculas
    const formattedText = normalizeText(inputText).replace(/_/g, ' ').toUpperCase();
  
    return formattedText;
  }
  
  // Ejemplo de uso
  
export function formatQuestionsInText(text: string): string {
  // Divide el texto en oraciones usando `.`, `!` o `?` como delimitadores
  const sentences = text.split(/(?<=[.?!])\s+/);

  const formattedSentences = sentences.map((sentence) => {
    const trimmedSentence = sentence.trim();

    // Verifica si la oración es una pregunta basada en signos `?` al final
    const isQuestion = trimmedSentence.endsWith("?");
    const alreadyFormatted = trimmedSentence.startsWith("¿") && isQuestion;

    if (isQuestion && !alreadyFormatted) {
      return `¿${trimmedSentence}`;
    }

    return trimmedSentence; // Mantiene la frase si ya está correcta o no es pregunta
  });

  return formattedSentences.join(" ");
}


export const formatTimestamp = (timestamp: number | string): string => {
  // Asegurarnos que el timestamp es un número
  const ts = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  
  const date = new Date(ts);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('es-ES', options);
};
