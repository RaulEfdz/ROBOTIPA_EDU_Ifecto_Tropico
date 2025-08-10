"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Video, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SESSIONS_NAVIGATION = [
  {
    label: "Mi Disponibilidad",
    href: "/teacher/availability",
    icon: Settings,
    description: "Configura horarios y precios"
  },
  {
    label: "Mis Sesiones", 
    href: "/teacher/sessions",
    icon: Video,
    description: "Gestiona sesiones programadas"
  },
  {
    label: "Mis Ganancias",
    href: "/teacher/earnings",
    icon: TrendingUp,
    description: "Revisa ingresos y analíticas"
  }
]

interface SessionsNavigationProps {
  className?: string
}

export default function SessionsNavigation({ className }: SessionsNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        {SESSIONS_NAVIGATION.map((item) => {
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