"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  version?: "light" | "original";
}

export const Logo: React.FC<LogoProps> = ({
  width = 130,
  height = 50,
  version,
}) => {
  const { theme } = useTheme();

  // Determinar el URL del logo basado en el tema o la versión
  const logoUrl =
    version === "light"
      ? "rbtpligth.png"
      : theme === "dark"
        ? "rbtpligth.png"
        : "rbtpbasic.png";

  return <Image width={width} height={height} alt="logo" src={`/${logoUrl}`} />;
};
