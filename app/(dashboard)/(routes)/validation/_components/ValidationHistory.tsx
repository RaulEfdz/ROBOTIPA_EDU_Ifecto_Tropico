"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, Upload, User, Calendar, FileText, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HistoryEntry {
  id: string;
  status: string;
  timestamp: string;
  previousStatus: string;
  action: string;
  note: string;
  fileName?: string;
  fileSize?: number;
  rejectionReason?: string;
  reviewerName?: string;
}

interface ValidationHistoryData {
  history: HistoryEntry[];
  current: any;
}

interface ValidationHistoryProps {
  validationId: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return Upload;
    case "PENDING":
      return Clock;
    case "APPROVED":
      return CheckCircle;
    case "REJECTED":
      return XCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return "text-gray-500";
    case "PENDING":
      return "text-yellow-600";
    case "APPROVED":
      return "text-green-600";
    case "REJECTED":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return "secondary";
    case "PENDING":
      return "default";
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatFileSize = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export function ValidationHistory({ validationId }: ValidationHistoryProps) {
  const [historyData, setHistoryData] = useState<ValidationHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/validation/history");
        if (!response.ok) {
          throw new Error("Failed to fetch validation history");
        }
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching validation history:", error);
        toast.error("Error al cargar el historial de validación");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [validationId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando historial...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historyData || historyData.history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay historial disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar el historial por fecha (más reciente primero)
  const sortedHistory = [...historyData.history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Validación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((entry, index) => {
            const StatusIcon = getStatusIcon(entry.status);
            const statusColor = getStatusColor(entry.status);
            const statusBadge = getStatusBadge(entry.status);

            return (
              <div key={entry.id} className="relative">
                {/* Línea conectora (excepto para el último item) */}
                {index < sortedHistory.length - 1 && (
                  <div className="absolute left-5 top-12 w-px h-6 bg-gray-200" />
                )}
                
                <div className="flex space-x-4">
                  {/* Icono de estado */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 ${statusColor.replace('text-', 'border-')}`}>
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">
                          {entry.action === "document_uploaded" && "Documento subido"}
                          {entry.action === "approved_by_admin" && "Documento aprobado"}
                          {entry.action === "rejected_by_admin" && "Documento rechazado"}
                          {!["document_uploaded", "approved_by_admin", "rejected_by_admin"].includes(entry.action) && 
                            entry.action.replace(/_/g, " ")
                          }
                        </h4>
                        <Badge variant={statusBadge as any} className="text-xs">
                          {entry.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(entry.timestamp).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2">
                      {entry.note && (
                        <p className="text-sm text-muted-foreground">
                          {entry.note}
                        </p>
                      )}

                      {entry.fileName && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{entry.fileName}</span>
                          {entry.fileSize && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(entry.fileSize)}</span>
                            </>
                          )}
                        </div>
                      )}

                      {entry.reviewerName && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Revisado por: {entry.reviewerName}</span>
                        </div>
                      )}

                      {entry.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>Motivo:</strong> {entry.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Separador (excepto para el último item) */}
                {index < sortedHistory.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen del estado actual */}
        {historyData.current && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Estado Actual</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Creado:</strong> {new Date(historyData.current.createdAt).toLocaleDateString()}</p>
              <p><strong>Última actualización:</strong> {new Date(historyData.current.updatedAt).toLocaleDateString()}</p>
              {historyData.current.reviewer && (
                <p><strong>Revisor:</strong> {historyData.current.reviewer.fullName}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}