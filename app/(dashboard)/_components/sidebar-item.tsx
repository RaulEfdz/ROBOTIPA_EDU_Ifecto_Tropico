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
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group",
        isCollapsed ? "justify-center px-2 py-3" : "gap-x-3 px-3 py-2.5",
        isActive
          ? "bg-emerald-600/40 text-emerald-100 shadow-lg backdrop-blur-sm border border-emerald-500/30"
          : "text-emerald-200 hover:bg-emerald-700/40 hover:text-emerald-100",
        isAnimated && "animate-fadeIn"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors",
          isActive 
            ? "text-emerald-100" 
            : "text-emerald-300 group-hover:text-emerald-100"
        )}
      />
      {!isCollapsed && (
        <span className={cn(
          "flex-1 truncate transition-colors leading-4",
          isActive ? "text-emerald-100" : "text-emerald-200 group-hover:text-emerald-100"
        )}>
          {label}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-emerald-800 text-emerald-100 border-emerald-700">
            {typeof label === 'string' ? label : 'Navegar'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
};
