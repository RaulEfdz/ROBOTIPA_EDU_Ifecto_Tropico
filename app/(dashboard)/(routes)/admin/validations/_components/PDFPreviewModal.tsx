"use client";

import { useState } from "react";
import { X, Download, ExternalLink, FileText, User, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  validation: ValidationItem;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return <Badge variant="secondary">Sin documento</Badge>;
    case "PENDING":
      return <Badge variant="default" className="bg-yellow-500">Pendiente</Badge>;
    case "APPROVED":
      return <Badge variant="default" className="bg-green-500">Aprobado</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rechazado</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatFileSize = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export function PDFPreviewModal({ open, onClose, validation }: PDFPreviewModalProps) {
  const [pdfError, setPdfError] = useState(false);

  const handleDownload = () => {
    if (validation.fileUrl) {
      const link = document.createElement('a');
      link.href = validation.fileUrl;
      link.download = validation.fileName || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenExternal = () => {
    if (validation.fileUrl) {
      window.open(validation.fileUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documento de Validación</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(validation.status)}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Panel de información */}
          <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
            {/* Información del usuario */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Información del Usuario</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{validation.user.fullName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {validation.user.email}
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Registrado: {formatDate(validation.user.createdAt)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Información del documento */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Información del Documento</h3>
              <div className="space-y-2">
                {validation.fileName && (
                  <div>
                    <div className="text-xs text-muted-foreground">Nombre del archivo</div>
                    <div className="text-sm font-medium">{validation.fileName}</div>
                  </div>
                )}
                
                {validation.fileSize && (
                  <div>
                    <div className="text-xs text-muted-foreground">Tamaño</div>
                    <div className="text-sm">{formatFileSize(validation.fileSize)}</div>
                  </div>
                )}

                {validation.uploadedAt && (
                  <div>
                    <div className="text-xs text-muted-foreground">Fecha de subida</div>
                    <div className="text-sm">{formatDate(validation.uploadedAt)}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Estado de revisión */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Estado de Revisión</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Estado actual</div>
                  <div className="mt-1">{getStatusBadge(validation.status)}</div>
                </div>

                {validation.reviewer && (
                  <div>
                    <div className="text-xs text-muted-foreground">Revisado por</div>
                    <div className="text-sm">{validation.reviewer.fullName}</div>
                    {validation.reviewedAt && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(validation.reviewedAt)}
                      </div>
                    )}
                  </div>
                )}

                {validation.rejectionReason && (
                  <div>
                    <div className="text-xs text-muted-foreground">Motivo de rechazo</div>
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-wrap break-words">
                      {validation.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Acciones */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Acciones</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button
                  onClick={handleOpenExternal}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva pestaña
                </Button>
              </div>
            </div>
          </div>

          {/* Visor PDF */}
          <div className="flex-1 min-w-0">
            <div className="h-full border rounded-lg overflow-hidden bg-gray-50">
              {validation.fileUrl && !pdfError ? (
                <iframe
                  src={`${validation.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full"
                  title="PDF Preview"
                  onError={() => setPdfError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full flex-col space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">
                      {pdfError 
                        ? "No se pudo cargar la vista previa del PDF" 
                        : "No hay documento disponible"
                      }
                    </p>
                    {validation.fileUrl && (
                      <div className="space-x-2">
                        <Button onClick={handleDownload} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                        <Button onClick={handleOpenExternal} variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir en nueva pestaña
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}