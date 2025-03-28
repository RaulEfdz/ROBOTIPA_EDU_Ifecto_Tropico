import { LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/icon-badge"

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
}: InfoCardProps) => {
  return (
    <div className="border rounded-md flex items-center gap-x-2 p-1">
      <IconBadge
        variant={variant}
        icon={Icon}
      />
      <div>
        <p className="font-medium">
          
        </p>
        <p className="text-gray-500 text-sm">
        {numberOfItems} {numberOfItems === 1 ? "Curso" : "Cursos"} {label}  
        </p>
      </div>
    </div>
  )
}