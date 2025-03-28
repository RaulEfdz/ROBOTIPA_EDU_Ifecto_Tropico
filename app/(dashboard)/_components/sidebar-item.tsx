"use client";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { BASE_APP } from "@/utils/nameApp";

interface SidebarItemProps {
  icon: any;
  label: any;
  href: string;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (() => {
    if (href === '/') {
      return pathname === '/' || pathname === `/${BASE_APP}`;
    }
    return pathname.startsWith(`/${BASE_APP}${href}`);
  })();

  const onClick = () => {
    router.push(href);
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-sm font-medium pl-6 transition-all py-3",
        "text-white hover:bg-slate-300/20",
        "dark:text'white dark:hover:text-black dark:hover:bg-slate-700/20",
        isActive && "bg-[#FFFCF8] text-slate-900 dark:bg-slate-800 dark:text-white"
      )}
    >
      <div  className={cn(
            "flex items-center gap-x-2 py-1 ",
            isActive && "text-slate-900 dark:text-black"
          )}>
        <Icon
          size={22}
          className={cn(
            "text-white dark:text-slate-400",
            isActive && "text-slate-900 dark:text-black"
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 h-full transition-all",
          "border-green-400 dark:border-grenn-400",
          isActive && "opacity-100"
        )}
      />
    </button>
  )
}
