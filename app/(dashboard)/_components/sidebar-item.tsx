// "use client";

// import { usePathname, useRouter } from "next/navigation";

// import { cn } from "@/lib/utils";
// import { BASE_APP } from "@/utils/nameApp";

// interface SidebarItemProps {
//   icon: any;
//   label: any;
//   href: string;
// }

// export const SidebarItem = ({
//   icon: Icon,
//   label,
//   href,
// }: SidebarItemProps) => {
//   const pathname = usePathname();
//   const router = useRouter();

//   const isActive = (() => {
//     if (href === '/') {
//       return pathname === '/' || pathname === `/${BASE_APP}`;
//     }
//     return pathname.startsWith(`/${BASE_APP}${href}`);
//   })();

//   const onClick = () => {
//     router.push(href);
//   }

//   return (
//     <button
//       onClick={onClick}
//       type="button"
//       className={cn(
//         "flex items-center gap-x-2 text-sm font-medium pl-6 transition-all py-3",
//         "text-TextCustom hover:bg-slate-300/20",
//         "dark:text'white dark:hover:text-black dark:hover:bg-slate-700/20",
//         isActive && "bg-[#FFFCF8] text-slate-900 dark:bg-slate-800 dark:text-TextCustom"
//       )}
//     >
//       <div  className={cn(
//             "flex items-center gap-x-2 py-1 ",
//             isActive && "text-slate-900 dark:text-black"
//           )}>
//         <Icon
//           size={22}
//           className={cn(
//             "text-TextCustom dark:text-slate-400",
//             isActive && "text-slate-900 dark:text-black"
//           )}
//         />
//         {label}
//       </div>
//       <div
//         className={cn(
//           "ml-auto opacity-0 border-2 h-full transition-all",
//           "border-green-400 dark:border-grenn-400",
//           isActive && "opacity-100"
//         )}
//       />
//     </button>
//   )
// }
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
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-2 text-slate-50 text-sm font-medium pl-4 pr-3 py-3 rounded-lg hover:bg-TextCustom/10 transition-all duration-200",
        isActive ? "bg-TextCustom/20 shadow-sm" : "opacity-90 hover:opacity-100",
        isAnimated ? "animate-fadeIn" : "opacity-0"
      )}
    >
      <div className="flex items-center gap-x-2">
        <Icon className={cn("h-5 w-5", isActive ? "text-TextCustom" : "text-TextCustom/80")} />
        <div className={cn(isActive ? "text-TextCustom" : "text-TextCustom/90")}>{label}</div>
      </div>
    </Link>
  );
};