"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  href: string;
  isAnimated?: boolean;
  isCollapsed?: boolean;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isAnimated = false,
  isCollapsed = false,
}: SidebarItemProps) => {
  const pathname = usePathname() || "";
  const isPanel = href === "/teacher";
  const isActive = isPanel
    ? pathname === href
    : (pathname === href || (href !== "/" && new RegExp(`^${href.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?:/|$)`).test(pathname)));

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group",
        isCollapsed ? "justify-center px-2 py-3" : "gap-x-3 px-3 py-2.5",
        isActive
          ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20"
          : "text-white/80 hover:bg-white/10 hover:text-white",
        isAnimated && "animate-fadeIn"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors",
          isActive ? "text-white" : "text-white/70 group-hover:text-white"
        )}
      />
      {!isCollapsed && (
        <span
          className={cn(
            "flex-1 truncate transition-colors leading-4",
            isActive ? "text-white" : "text-white/80 group-hover:text-white"
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-primary text-white border-white/20"
          >
            {typeof label === "string" ? label : "Navegar"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};
