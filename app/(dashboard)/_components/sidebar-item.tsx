"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  href: string;
  isAnimated?: boolean;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isAnimated = false,
}: SidebarItemProps) => {
  const pathname = usePathname() || "";
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-TextCustom/20 text-TextCustom shadow-sm"
          : "text-slate-50 opacity-90 hover:bg-TextCustom/10 hover:opacity-100",
        isAnimated && "animate-fadeIn"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive ? "text-TextCustom" : "text-TextCustom/80"
        )}
      />
      <span className={cn(isActive ? "text-TextCustom" : "text-TextCustom/90")}>
        {label}
      </span>
    </Link>
  );
};
