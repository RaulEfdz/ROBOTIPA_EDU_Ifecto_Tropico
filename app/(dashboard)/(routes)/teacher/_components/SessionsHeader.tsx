"use client"

import { ReactNode } from "react"
import SessionsNavigation from "./SessionsNavigation"

interface SessionsHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export default function SessionsHeader({ title, description, children }: SessionsHeaderProps) {
  return (
    <div className="p-4 lg:p-6">
      {/* Título de sección general */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-muted-foreground">Sesiones Personalizadas</h1>
      </div>
      
      {/* Navegación entre secciones */}
      <SessionsNavigation />
      
      {/* Cabecera de la página específica */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl lg:text-3xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        {children && (
          <div className="w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}