"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Video, CreditCard, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const STUDENT_NAVIGATION = [
  {
    label: "Buscar Profesores",
    href: "/students/find-teachers",
    icon: Search,
    description: "Encuentra y reserva sesiones"
  },
  {
    label: "Mis Sesiones", 
    href: "/students/sessions",
    icon: Video,
    description: "Gestiona tus sesiones programadas"
  },
  {
    label: "Mis Créditos",
    href: "/students/credits",
    icon: CreditCard,
    description: "Administra tu saldo"
  }
]

interface StudentsNavigationProps {
  className?: string
}

export default function StudentsNavigation({ className }: StudentsNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        {STUDENT_NAVIGATION.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
                "hover:bg-accent/50 hover:shadow-sm",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm border-primary" 
                  : "bg-background border-border hover:border-accent-foreground/20"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className={cn(
                  "text-xs mt-0.5 truncate",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}