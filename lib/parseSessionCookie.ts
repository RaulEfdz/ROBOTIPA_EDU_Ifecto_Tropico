// lib/parseSessionCookie.ts

/**
 * Decodifica y parsea una cookie de sesión que puede venir en base64 o como JSON plano.
 * @param cookieStr El string de la cookie
 * @returns El objeto parseado o null si falla
 */
export function parseSessionCookie(cookieStr: string): any | null {
  try {
    if (!cookieStr) return null;
    if (cookieStr.startsWith("base64-")) {
      const base64 = cookieStr.replace("base64-", "");
      const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
      return JSON.parse(jsonStr);
    }
    return JSON.parse(cookieStr);
  } catch (e) {
    return null;
  }
}
