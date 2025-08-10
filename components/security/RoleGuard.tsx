"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { type RoleName } from "@/utils/roles/hierarchy"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: RoleName
  adminOnly?: boolean
  fallbackPath?: string
  showError?: boolean
}

interface UserInfo {
  role: RoleName
  hasAccess: boolean
  reason?: string
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  adminOnly = false,
  fallbackPath = "/",
  showError = true
}: RoleGuardProps) {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    validateAccess()
  }, [requiredRole, adminOnly])

  const validateAccess = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validar acceso con el backend
      const response = await axios.post("/api/auth/validate-access", {
        requiredRole,
        adminOnly
      })

      setUserInfo({
        role: response.data.role,
        hasAccess: response.data.hasAccess,
        reason: response.data.reason
      })

      // Si no tiene acceso, redirigir después de un momento
      if (!response.data.hasAccess) {
        setTimeout(() => {
          router.push(fallbackPath)
        }, 3000)
      }

    } catch (error: any) {
      console.error("Error validating access:", error)
      
      if (error.response?.status === 401) {
        setError("Sesión expirada. Redirigiendo al login...")
        setTimeout(() => {
          router.push("/sign-in")
        }, 2000)
      } else if (error.response?.status === 403) {
        setUserInfo({
          role: "unknown",
          hasAccess: false,
          reason: error.response.data?.reason || "Acceso denegado"
        })
        setTimeout(() => {
          router.push(fallbackPath)
        }, 3000)
      } else {
        setError("Error de conexión. Intentando nuevamente...")
        setTimeout(validateAccess, 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verificando permisos...</p>
          <p className="text-sm text-muted-foreground">
            Validando acceso al módulo
          </p>
        </div>
      </div>
    )
  }

  // Error de conexión
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error de Conexión</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={validateAccess} className="w-full">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Acceso denegado
  if (userInfo && !userInfo.hasAccess) {
    if (!showError) {
      router.push(fallbackPath)
      return null
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground mb-4">
                {userInfo.reason || "No tienes permisos para acceder a esta sección"}
              </p>
              
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Rol actual:</strong> {userInfo.role}
                  <br />
                  {requiredRole && <><strong>Rol requerido:</strong> {requiredRole}</>}
                  {adminOnly && <><strong>Acceso:</strong> Solo administradores</>}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Serás redirigido automáticamente en unos segundos...
                </p>
                <Button onClick={() => router.push(fallbackPath)} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Inicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Acceso permitido - mostrar contenido
  return <>{children}</>
}