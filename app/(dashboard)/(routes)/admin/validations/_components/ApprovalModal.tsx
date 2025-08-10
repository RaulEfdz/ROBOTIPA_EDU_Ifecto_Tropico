"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationItem {
  id: string;
  status: "NO_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  uploadedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    createdAt: string;
  };
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  validation: ValidationItem;
  action: "approve" | "reject";
  onSuccess: () => void;
}

export function ApprovalModal({ open, onClose, validation, action, onSuccess }: ApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const isReject = action === "reject";
  const title = isReject ? "Rechazar Documento" : "Aprobar Documento";
  const description = isReject 
    ? "El documento será marcado como rechazado y el usuario podrá subir un nuevo documento." 
    : "El documento será marcado como aprobado y el usuario tendrá acceso completo a la plataforma.";

  const handleSubmit = async () => {
    if (isReject && !reason.trim()) {
      toast.error("Debes especificar el motivo del rechazo");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isReject 
        ? `/api/admin/validations/${validation.id}/reject`
        : `/api/admin/validations/${validation.id}/approve`;

      const body: any = {};
      if (note.trim()) body.note = note.trim();
      if (isReject && reason.trim()) body.reason = reason.trim();

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update validation");
      }

      const data = await response.json();
      
      toast.success(
        isReject 
          ? "Documento rechazado exitosamente" 
          : "Documento aprobado exitosamente"
      );

      onSuccess();
    } catch (error) {
      console.error("Error updating validation:", error);
      toast.error(
        `Error al ${isReject ? "rechazar" : "aprobar"} el documento: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setNote("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isReject ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del usuario y documento */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="text-sm">
              <strong>Usuario:</strong> {validation.user.fullName}
            </div>
            <div className="text-sm">
              <strong>Email:</strong> {validation.user.email}
            </div>
            {validation.fileName && (
              <div className="text-sm">
                <strong>Documento:</strong> {validation.fileName}
              </div>
            )}
          </div>

          {/* Campo de motivo (solo para rechazo) */}
          {isReject && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Motivo del rechazo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Explica por qué se rechaza el documento (ej: documento ilegible, información incompleta, formato incorrecto...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Este motivo será enviado al usuario para que pueda corregir el problema.
              </p>
            </div>
          )}

          {/* Campo de nota adicional (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Nota adicional (opcional)
            </Label>
            <Textarea
              id="note"
              placeholder={
                isReject 
                  ? "Agregar información adicional sobre el rechazo..."
                  : "Agregar comentarios sobre la aprobación..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Advertencia para rechazo */}
          {isReject && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El usuario recibirá una notificación por email con el motivo del rechazo y 
                podrá subir un nuevo documento para revisión.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmación para aprobación */}
          {!isReject && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El usuario recibirá una notificación por email confirmando la aprobación 
                y tendrá acceso completo a todos los cursos de la plataforma.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-row space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (isReject && !reason.trim())}
            variant={isReject ? "destructive" : "default"}
            className={!isReject ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isReject ? (
              <XCircle className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {loading 
              ? (isReject ? "Rechazando..." : "Aprobando...") 
              : (isReject ? "Rechazar Documento" : "Aprobar Documento")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}