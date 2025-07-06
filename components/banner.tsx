"use client";

import { AlertTriangle, CheckCircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "sticky top-0 z-1border-none text-sm flex items-center px-4 py-3 rounded-none w-full shadow-sm",
  {
    variants: {
      variant: {
        warning: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700",
        success: "bg-primary-100 text-green-800 border-green-300 dark:bg-primary-900/20 dark:text-primary-200 dark:border-green-700",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

interface BannerProps extends VariantProps<typeof bannerVariants> {
  label: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
};

export const Banner = ({ label, variant }: BannerProps) => {
  const Icon = iconMap[variant || "warning"];

  return (
    <div className={cn(bannerVariants({ variant }))}>
      <Icon className="h-4 w-4 mr-2 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};
