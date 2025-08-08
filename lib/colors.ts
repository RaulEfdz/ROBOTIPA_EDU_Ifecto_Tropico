/**
 * Utilidades para manejo de colores dinámicos basados en variables de entorno
 */

export interface ColorVariants {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Mapeo de colores Tailwind con todas sus variantes
 */
const TAILWIND_COLORS: Record<string, ColorVariants> = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
};

/**
 * Obtiene el color primario desde las variables de entorno
 */
export const getPrimaryColor = (): string => {
  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#06206A';
  return primaryColor;
};

/**
 * Detecta si el color es HEX o un nombre de color Tailwind
 */
export const isHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Convierte HEX a RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Genera variantes de luminosidad para un color HEX
 */
export const generateColorVariants = (hex: string): ColorVariants => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return TAILWIND_COLORS.blue; // Fallback
  }

  const { r, g, b } = rgb;

  // Generar variantes mezclando con blanco (más claro) y negro (más oscuro)
  const variants: ColorVariants = {
    50: `rgb(${Math.round(r + (255 - r) * 0.95)}, ${Math.round(g + (255 - g) * 0.95)}, ${Math.round(b + (255 - b) * 0.95)})`,
    100: `rgb(${Math.round(r + (255 - r) * 0.9)}, ${Math.round(g + (255 - g) * 0.9)}, ${Math.round(b + (255 - b) * 0.9)})`,
    200: `rgb(${Math.round(r + (255 - r) * 0.75)}, ${Math.round(g + (255 - g) * 0.75)}, ${Math.round(b + (255 - b) * 0.75)})`,
    300: `rgb(${Math.round(r + (255 - r) * 0.5)}, ${Math.round(g + (255 - g) * 0.5)}, ${Math.round(b + (255 - b) * 0.5)})`,
    400: `rgb(${Math.round(r + (255 - r) * 0.25)}, ${Math.round(g + (255 - g) * 0.25)}, ${Math.round(b + (255 - b) * 0.25)})`,
    500: hex, // Color base
    600: `rgb(${Math.round(r * 0.85)}, ${Math.round(g * 0.85)}, ${Math.round(b * 0.85)})`,
    700: `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`,
    800: `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`,
    900: `rgb(${Math.round(r * 0.4)}, ${Math.round(g * 0.4)}, ${Math.round(b * 0.4)})`,
    950: `rgb(${Math.round(r * 0.25)}, ${Math.round(g * 0.25)}, ${Math.round(b * 0.25)})`,
  };

  return variants;
};

/**
 * Obtiene las clases CSS dinámicas para el color primario
 */
export const getPrimaryColorClasses = () => {
  const primaryColor = getPrimaryColor();
  
  if (isHexColor(primaryColor)) {
    const variants = generateColorVariants(primaryColor);
    
    return {
      // Backgrounds
      'bg-primary-50': { backgroundColor: variants[50] },
      'bg-primary-100': { backgroundColor: variants[100] },
      'bg-primary-200': { backgroundColor: variants[200] },
      'bg-primary-300': { backgroundColor: variants[300] },
      'bg-primary-400': { backgroundColor: variants[400] },
      'bg-primary-500': { backgroundColor: variants[500] },
      'bg-primary-600': { backgroundColor: variants[600] },
      'bg-primary-700': { backgroundColor: variants[700] },
      'bg-primary-800': { backgroundColor: variants[800] },
      'bg-primary-900': { backgroundColor: variants[900] },
      'bg-primary-950': { backgroundColor: variants[950] },
      
      // Hover backgrounds
      'hover:bg-primary-600': variants[600],
      'hover:bg-primary-700': variants[700],
      
      // Text colors
      'text-primary-600': { color: variants[600] },
      'text-primary-700': { color: variants[700] },
      
      // Border colors
      'border-primary-600': { borderColor: variants[600] },
      'border-primary-700': { borderColor: variants[700] },
    };
  }

  // Si es un color Tailwind, usar las clases normales
  const colorName = primaryColor.toLowerCase();
  if (TAILWIND_COLORS[colorName]) {
    return {
      'bg-primary-600': `bg-${colorName}-600`,
      'bg-primary-700': `bg-${colorName}-700`,
      'hover:bg-primary-600': `hover:bg-${colorName}-600`,
      'hover:bg-primary-700': `hover:bg-${colorName}-700`,
      'text-primary-600': `text-${colorName}-600`,
      'text-primary-700': `text-${colorName}-700`,
      'border-primary-600': `border-${colorName}-600`,
      'border-primary-700': `border-${colorName}-700`,
    };
  }

  // Fallback por defecto
  return {
    'bg-primary-600': 'bg-blue-600',
    'bg-primary-700': 'bg-blue-700',
    'hover:bg-primary-600': 'hover:bg-blue-600',
    'hover:bg-primary-700': 'hover:bg-blue-700',
    'text-primary-600': 'text-blue-600',
    'text-primary-700': 'text-blue-700',
    'border-primary-600': 'border-blue-600',
    'border-primary-700': 'border-blue-700',
  };
};

/**
 * Hook-like function para obtener estilos dinámicos
 */
export const usePrimaryColorStyle = (variant: '600' | '700' = '600') => {
  const primaryColor = getPrimaryColor();
  
  if (isHexColor(primaryColor)) {
    const variants = generateColorVariants(primaryColor);
    return {
      backgroundColor: variants[variant],
    };
  }

  // Para colores Tailwind, retornar clase CSS
  const colorName = primaryColor.toLowerCase();
  if (TAILWIND_COLORS[colorName]) {
    return `bg-${colorName}-${variant}`;
  }

  return `bg-blue-${variant}`;
};