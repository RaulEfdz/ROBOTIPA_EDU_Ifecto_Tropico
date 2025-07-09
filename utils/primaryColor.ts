// utils/primaryColor.ts

export function getPrimaryColor(): string {
  const color = process.env.NEXT_PUBLIC_PRIMARY_COLOR;
  switch (color) {
    case "blue": // Azul Tailwind
      return "#3b82f6";
    case "rose": // Rosa Tailwind
      return "#f43f5e";
    case "indigo": // Índigo Tailwind
      return "#6366f1";
    case "amber": // Ámbar Tailwind
      return "#f59e42";
    case "emerald": // Verde esmeralda Tailwind
      return "#10b981";
    case "orange": // Naranja Tailwind
      return "#f97316";
    case "red": // Rojo Tailwind
      return "#ef4444";
    case "green": // Verde Tailwind
      return "#22c55e";
    case "yellow": // Amarillo Tailwind
      return "#eab308";
    case "purple": // Morado Tailwind
      return "#a855f7";
    case "cyan": // Cyan Tailwind
      return "#06b6d4";
    case "teal": // Verde azulado Tailwind
      return "#14b8a6";
    // Puedes agregar más colores aquí según tu paleta
    default:
      // Si es un color hex válido, lo retorna, si no, retorna negro por defecto
      return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#010101";
  }
}
