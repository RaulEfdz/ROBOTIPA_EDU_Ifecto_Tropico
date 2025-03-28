export function removeUnderscores(text:string) {
    if (typeof text !== "string") {
      throw new Error("El argumento debe ser un string");
    }
    return text.replace(/_/g, ' ');
  }
  