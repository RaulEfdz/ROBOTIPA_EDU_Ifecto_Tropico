"use client";

import React from "react";
import { Trash2 } from "lucide-react";

/**
 * Limpia localStorage, sessionStorage, cookies y Cache Storage.
 */
export async function clearSiteData(): Promise<void> {
  try {
    // Limpiar localStorage
    if (window.localStorage) {
      localStorage.clear();
    }
    // Limpiar sessionStorage
    if (window.sessionStorage) {
      sessionStorage.clear();
    }
    // Eliminar cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
    });
    // Limpiar Cache Storage (Service Workers)
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  } catch (error) {
    console.error("Error clearing site data:", error);
  }
}

interface ClearCacheIconButtonProps {
  /** Callback tras limpiar */
  onCleared?: () => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del ícono en píxeles */
  iconSize?: number;
}

/**
 * Botón con ícono para limpiar datos del sitio sin estilos llamativos.
 */
const ClearCacheIconButton: React.FC<ClearCacheIconButtonProps> = ({
  onCleared,
  className = "",
  iconSize = 20,
}) => {
  const handleClear = async () => {
    await clearSiteData();
    onCleared?.();
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      className={`p-1 bg-transparent border-none hover:bg-transparent ${className}`}
      aria-label="Clear cache and cookies"
    >
      <Trash2 size={iconSize} />
    </button>
  );
};

export default ClearCacheIconButton;
