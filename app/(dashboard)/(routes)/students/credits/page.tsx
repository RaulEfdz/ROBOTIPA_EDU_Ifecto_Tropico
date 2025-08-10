"use client"

import { useState, useEffect } from "react"
import { CreditCard, Plus, History, TrendingUp, Award, ShoppingCart } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import StudentsHeader from "../_components/StudentsHeader"

interface StudentCredits {
  id: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  autoRecharge: boolean
  rechargeThreshold: number
  rechargeAmount: number
  transactions: CreditTransaction[]
}

interface CreditTransaction {
  id: string
  type: string
  amount: number
  description?: string
  balanceAfter: number
  createdAt: string
  session?: {
    id: string
    title: string
    scheduledAt: string
  }
}

const CREDIT_PACKAGES = [
  { credits: 1, price: 10, popular: false },
  { credits: 5, price: 45, popular: false, discount: 10 },
  { credits: 10, price: 80, popular: true, discount: 20 },
  { credits: 20, price: 140, popular: false, discount: 30 },
  { credits: 50, price: 300, popular: false, discount: 40 }
]

const TRANSACTION_TYPES = {
  purchase: { label: "Compra", color: "bg-green-100 text-green-800", icon: "+" },
  usage: { label: "Uso", color: "bg-red-100 text-red-800", icon: "-" },
  refund: { label: "Reembolso", color: "bg-blue-100 text-blue-800", icon: "+" },
  bonus: { label: "Bonus", color: "bg-purple-100 text-purple-800", icon: "+" },
  expiration: { label: "Expiración", color: "bg-gray-100 text-gray-800", icon: "-" }
}

export default function StudentCreditsPage() {
  const { toast } = useToast()
  const [credits, setCredits] = useState<StudentCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  // Configuración de auto-recarga
  const [autoRecharge, setAutoRecharge] = useState(false)
  const [rechargeThreshold, setRechargeThreshold] = useState(5)
  const [rechargeAmount, setRechargeAmount] = useState(10)

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/live-sessions/credits")
      setCredits(response.data)
      
      if (response.data) {
        setAutoRecharge(response.data.autoRecharge)
        setRechargeThreshold(response.data.rechargeThreshold)
        setRechargeAmount(response.data.rechargeAmount)
      }
    } catch (error) {
      console.error("Error fetching credits:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los créditos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const purchaseCredits = async (creditPackage: typeof CREDIT_PACKAGES[0]) => {
    try {
      setPurchasing(true)
      
      // Simular compra de créditos (aquí integrarías con el sistema de pagos real)
      const purchaseData = {
        amount: creditPackage.credits,
        type: "purchase",
        description: `Compra de ${creditPackage.credits} crédito${creditPackage.credits !== 1 ? 's' : ''}`,
        paymentId: `payment_${Date.now()}` // Simular ID de pago
      }

      await axios.post("/api/live-sessions/credits", purchaseData)
      
      toast({
        title: "¡Compra exitosa!",
        description: `Has adquirido ${creditPackage.credits} crédito${creditPackage.credits !== 1 ? 's' : ''}`,
      })

      setIsPurchaseModalOpen(false)
      setSelectedPackage(null)
      fetchCredits()

    } catch (error: any) {
      console.error("Error purchasing credits:", error)
      toast({
        title: "Error en la compra",
        description: error.response?.data?.error || "No se pudo completar la compra",
        variant: "destructive"
      })
    } finally {
      setPurchasing(false)
    }
  }

  const updateSettings = async () => {
    try {
      const settings = {
        autoRecharge,
        rechargeThreshold,
        rechargeAmount
      }

      await axios.put("/api/live-sessions/credits", settings)
      
      toast({
        title: "Configuración actualizada",
        description: "Tus preferencias de recarga han sido guardadas"
      })

      setIsSettingsModalOpen(false)
      fetchCredits()

    } catch (error: any) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      })
    }
  }

  const getTransactionType = (type: string) => {
    return TRANSACTION_TYPES[type as keyof typeof TRANSACTION_TYPES] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
      icon: ""
    }
  }

  if (loading) {
    return (
      <>
        <StudentsHeader
          title="Mis Créditos"
          description="Gestiona tus créditos para sesiones personalizadas"
        />
        <div className="px-4 lg:px-6 pb-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando información de créditos...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <StudentsHeader
        title="Mis Créditos"
        description="Gestiona tus créditos para sesiones personalizadas"
      >
        <div className="flex gap-2">
          <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Configuración
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Comprar Créditos
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </StudentsHeader>
    
    <div className="px-4 lg:px-6 pb-6">

      {/* Resumen de créditos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponibles</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {credits?.remainingCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Listo para usar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adquiridos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {credits?.totalCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde el inicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Usados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {credits?.usedCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              En sesiones realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-recarga</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credits?.autoRecharge ? "ON" : "OFF"}
            </div>
            <p className="text-xs text-muted-foreground">
              {credits?.autoRecharge ? `Cuando < ${credits.rechargeThreshold}` : "Desactivada"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de créditos bajos */}
      {credits && credits.remainingCredits <= 2 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800">Créditos bajos</h3>
                <p className="text-sm text-orange-700">
                  Te quedan solo {credits.remainingCredits} crédito{credits.remainingCredits !== 1 ? 's' : ''}. 
                  Considera comprar más para no interrumpir tus sesiones.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsPurchaseModalOpen(true)}
                className="ml-auto bg-orange-600 hover:bg-orange-700"
              >
                Comprar Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!credits?.transactions || credits.transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay transacciones aún</p>
              <p className="text-sm text-muted-foreground mt-1">
                Compra créditos o programa una sesión para ver tu historial
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {credits.transactions.map((transaction) => {
                const typeInfo = getTransactionType(transaction.type)
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {typeInfo.icon}{Math.abs(transaction.amount)} crédito{Math.abs(transaction.amount) !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        {transaction.session && (
                          <p className="text-xs text-muted-foreground">
                            Sesión: {transaction.session.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Balance: {transaction.balanceAfter}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), "PPp", { locale: es })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal de compra de créditos */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Comprar Créditos</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.credits} className={`cursor-pointer transition-all hover:shadow-lg ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="text-center">
                  {pkg.popular && (
                    <Badge className="mb-2 w-fit mx-auto">Más Popular</Badge>
                  )}
                  <CardTitle className="text-2xl">{pkg.credits} Créditos</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    ${pkg.price}
                  </div>
                  {pkg.discount && (
                    <div className="text-sm text-green-600">
                      {pkg.discount}% de descuento
                    </div>
                  )}
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-sm text-muted-foreground mb-4">
                    ${(pkg.price / pkg.credits).toFixed(1)} por crédito
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setSelectedPackage(pkg)
                      purchaseCredits(pkg)
                    }}
                    disabled={purchasing}
                  >
                    {purchasing ? "Procesando..." : "Comprar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuración */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de Créditos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-base">Auto-recarga</div>
                <div className="text-sm text-muted-foreground">
                  Compra automática cuando los créditos sean bajos
                </div>
              </div>
              <Switch
                checked={autoRecharge}
                onCheckedChange={setAutoRecharge}
              />
            </div>
            
            {autoRecharge && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Umbral de recarga</label>
                  <Input
                    type="number"
                    value={rechargeThreshold}
                    onChange={(e) => setRechargeThreshold(parseInt(e.target.value))}
                    min={1}
                    max={10}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recargar cuando queden menos créditos
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cantidad a recargar</label>
                  <Input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(parseInt(e.target.value))}
                    min={1}
                    max={50}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Créditos a comprar automáticamente
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSettingsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={updateSettings}
                className="flex-1"
              >
                Guardar Configuración
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
