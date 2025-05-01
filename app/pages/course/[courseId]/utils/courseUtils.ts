// utils/courseUtils.ts
import DOMPurify from "dompurify";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Sanitize and decode HTML content
 */
export function sanitizeHtml(html?: string | null): string {
  if (!html) return "";
  let decoded = html;

  // If escaped HTML tags are present, decode them first
  if (html.includes("&lt;") || html.includes("&gt;")) {
    decoded = html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }

  // Use DOMPurify in the browser to prevent XSS
  return typeof window !== "undefined" ? DOMPurify.sanitize(decoded) : decoded;
}

/**
 * Strip HTML tags and create a simple text preview
 */
export function createTextPreview(
  content?: string | null,
  length = 100
): string {
  if (!content) return "";
  const textOnly = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return textOnly.length <= length
    ? textOnly
    : `${textOnly.slice(0, length)}...`;
}

/**
 * Format a Date object or ISO string to "DD de Month de YYYY" in Spanish
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format distance to now (e.g., "hace 3 días") in Spanish
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}
