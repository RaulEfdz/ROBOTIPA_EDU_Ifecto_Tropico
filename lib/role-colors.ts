/**
 * Sistema de colores por rol basado en la variable de entorno principal
 * Genera paletas cohesivas y profesionales para cada rol
 */

import { getPrimaryColor, hexToRgb, isHexColor } from './colors';

export interface RoleColorScheme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  hover: string;
  active: string;
}

/**
 * Genera una paleta de colores a partir de un color HEX base
 */
const generatePaletteFromHex = (hex: string): RoleColorScheme => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return getDefaultPalette();
  }

  const { r, g, b } = rgb;

  return {
    primary: hex,
    primaryDark: `rgb(${Math.round(r * 0.8)}, ${Math.round(g * 0.8)}, ${Math.round(b * 0.8)})`,
    primaryLight: `rgb(${Math.round(r + (255 - r) * 0.85)}, ${Math.round(g + (255 - g) * 0.85)}, ${Math.round(b + (255 - b) * 0.85)})`,
    accent: `rgb(${Math.round(r + (255 - r) * 0.3)}, ${Math.round(g + (255 - g) * 0.3)}, ${Math.round(b + (255 - b) * 0.3)})`,
    background: `rgb(${Math.round(r * 0.95)}, ${Math.round(g * 0.95)}, ${Math.round(b * 0.95)})`,
    surface: `rgba(${r}, ${g}, ${b}, 0.05)`,
    border: `rgba(${r}, ${g}, ${b}, 0.15)`,
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    hover: `rgba(255, 255, 255, 0.1)`,
    active: `rgba(255, 255, 255, 0.15)`,
  };
};

/**
 * Paleta por defecto (fallback)
 */
const getDefaultPalette = (): RoleColorScheme => ({
  primary: '#06206A',
  primaryDark: '#041548',
  primaryLight: '#E8EDF8',
  accent: '#4A7FBD',
  background: '#050C1A',
  surface: 'rgba(6, 32, 106, 0.05)',
  border: 'rgba(6, 32, 106, 0.15)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  hover: 'rgba(255, 255, 255, 0.1)',
  active: 'rgba(255, 255, 255, 0.15)',
});

/**
 * Modificadores de color para cada rol
 */
const ROLE_MODIFIERS = {
  // Rol normal - usa el color principal sin modificar
  default: {
    hueShift: 0,
    saturationMultiplier: 1,
    lightnessOffset: 0,
  },
  // Administrador - más intenso y con toque rojizo
  admin: {
    hueShift: -15, // Hacia el rojo
    saturationMultiplier: 1.2,
    lightnessOffset: -5,
  },
  // Profesor - ligeramente más cálido
  teacher: {
    hueShift: 5, // Hacia verde
    saturationMultiplier: 1.1,
    lightnessOffset: 0,
  },
  // Estudiante - más suave y claro
  student: {
    hueShift: 15, // Hacia cyan
    saturationMultiplier: 0.9,
    lightnessOffset: 10,
  },
  // Visitante - muy suave
  visitor: {
    hueShift: 0,
    saturationMultiplier: 0.7,
    lightnessOffset: 20,
  },
};

/**
 * Convierte RGB a HSL
 */
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

/**
 * Convierte HSL a RGB
 */
const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Aplica modificadores de rol a un color
 */
const applyRoleModifier = (hex: string, role: keyof typeof ROLE_MODIFIERS): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const modifier = ROLE_MODIFIERS[role];
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const newH = (h + modifier.hueShift + 360) % 360;
  const newS = Math.min(100, Math.max(0, s * modifier.saturationMultiplier));
  const newL = Math.min(100, Math.max(0, l + modifier.lightnessOffset));

  const [r, g, b] = hslToRgb(newH, newS, newL);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Obtiene la paleta de colores para un rol específico
 */
export const getRoleColorScheme = (role: 'default' | 'admin' | 'teacher' | 'student' | 'visitor' = 'default'): RoleColorScheme => {
  const primaryColor = getPrimaryColor();
  
  if (!isHexColor(primaryColor)) {
    return getDefaultPalette();
  }

  // Aplicar modificador del rol al color primario
  const modifiedColor = applyRoleModifier(primaryColor, role);
  
  return generatePaletteFromHex(modifiedColor);
};

/**
 * Obtiene estilos CSS inline para un rol
 */
export const getRoleStyles = (role: 'default' | 'admin' | 'teacher' | 'student' | 'visitor' = 'default') => {
  const colors = getRoleColorScheme(role);
  
  return {
    '--role-primary': colors.primary,
    '--role-primary-dark': colors.primaryDark,
    '--role-primary-light': colors.primaryLight,
    '--role-accent': colors.accent,
    '--role-background': colors.background,
    '--role-surface': colors.surface,
    '--role-border': colors.border,
    '--role-text': colors.text,
    '--role-text-secondary': colors.textSecondary,
    '--role-text-muted': colors.textMuted,
    '--role-hover': colors.hover,
    '--role-active': colors.active,
  } as React.CSSProperties;
};

/**
 * Mapeo de roles UUID a nombres de rol para el sistema de colores
 */
export const mapRoleUUIDToColorRole = (roleUUID: string): 'default' | 'admin' | 'teacher' | 'student' | 'visitor' => {
  // IDs desde .env
  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
  const TEACHER_ID = process.env.NEXT_PUBLIC_TEACHER_ID;
  const STUDENT_ID = process.env.NEXT_PUBLIC_STUDENT_ID;
  const VISITOR_ID = process.env.NEXT_PUBLIC_VISITOR_ID;

  switch (roleUUID) {
    case ADMIN_ID:
      return 'admin';
    case TEACHER_ID:
      return 'teacher';
    case STUDENT_ID:
      return 'student';
    case VISITOR_ID:
      return 'visitor';
    default:
      return 'default';
  }
};

/**
 * CSS Classes dinámicas para roles
 */
export const getRoleCSSClasses = (role: 'default' | 'admin' | 'teacher' | 'student' | 'visitor' = 'default') => {
  const colors = getRoleColorScheme(role);
  
  return {
    sidebar: `bg-[${colors.primary}] border-[${colors.border}]`,
    surface: `bg-[${colors.surface}] border-[${colors.border}]`,
    text: `text-[${colors.text}]`,
    textSecondary: `text-[${colors.textSecondary}]`,
    textMuted: `text-[${colors.textMuted}]`,
    hover: `hover:bg-[${colors.hover}]`,
    active: `bg-[${colors.active}]`,
    accent: `bg-[${colors.accent}]`,
  };
};