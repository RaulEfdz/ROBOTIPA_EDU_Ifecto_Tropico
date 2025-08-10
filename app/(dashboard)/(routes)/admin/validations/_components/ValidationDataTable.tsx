"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { PDFPreviewModal } from "./PDFPreviewModal";
import { ApprovalModal } from "./ApprovalModal";

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

interface ValidationDataTableProps {
  validations: ValidationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onValidationUpdate: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return <Badge variant="secondary">Sin documento</Badge>;
    case "PENDING":
      return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>;
    case "APPROVED":
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aprobado</Badge>;
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export function ValidationDataTable({ 
  validations, 
  pagination, 
  onPageChange, 
  onValidationUpdate 
}: ValidationDataTableProps) {
  const [previewModal, setPreviewModal] = useState<{ open: boolean; validation: ValidationItem | null }>({
    open: false,
    validation: null
  });
  
  const [approvalModal, setApprovalModal] = useState<{ 
    open: boolean; 
    validation: ValidationItem | null;
    action: "approve" | "reject" | null;
  }>({
    open: false,
    validation: null,
    action: null
  });

  const handlePreview = (validation: ValidationItem) => {
    if (!validation.fileUrl) {
      toast.error("No hay documento para previsualizar");
      return;
    }
    setPreviewModal({ open: true, validation });
  };

  const handleApprove = (validation: ValidationItem) => {
    setApprovalModal({ open: true, validation, action: "approve" });
  };

  const handleReject = (validation: ValidationItem) => {
    setApprovalModal({ open: true, validation, action: "reject" });
  };

  const closePreviewModal = () => {
    setPreviewModal({ open: false, validation: null });
  };

  const closeApprovalModal = () => {
    setApprovalModal({ open: false, validation: null, action: null });
  };

  const handleApprovalSuccess = () => {
    closeApprovalModal();
    onValidationUpdate();
    toast.success("Validación actualizada exitosamente");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Validaciones de Documentos
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {pagination.total} total • Página {pagination.page} de {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Fecha de Subida</TableHead>
                  <TableHead>Revisor</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validations.map((validation) => (
                  <TableRow key={validation.id}>
                    {/* Usuario */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{validation.user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {validation.user.email}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Registrado: {formatDate(validation.user.createdAt)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(validation.status)}
                        {validation.rejectionReason && (
                          <div className="text-xs text-red-600 max-w-32 truncate" title={validation.rejectionReason}>
                            {validation.rejectionReason}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Documento */}
                    <TableCell>
                      {validation.fileName ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="max-w-32 truncate" title={validation.fileName}>
                              {validation.fileName}
                            </span>
                          </div>
                          {validation.fileSize && (
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(validation.fileSize)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No subido
                        </div>
                      )}
                    </TableCell>

                    {/* Fecha de subida */}
                    <TableCell>
                      {validation.uploadedAt ? (
                        <div className="text-sm">
                          {formatDate(validation.uploadedAt)}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">-</div>
                      )}
                    </TableCell>

                    {/* Revisor */}
                    <TableCell>
                      {validation.reviewer ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {validation.reviewer.fullName}
                          </div>
                          {validation.reviewedAt && (
                            <div className="text-xs text-muted-foreground">
                              {formatDate(validation.reviewedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">-</div>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* Previsualizar documento */}
                        {validation.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(validation)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                        )}

                        {/* Aprobar/Rechazar (solo para pendientes) */}
                        {validation.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(validation)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(validation)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} validaciones
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.totalPages || 
                      (page >= pagination.page - 2 && page <= pagination.page + 2)
                    )
                    .map((page, index, array) => (
                      <div key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {previewModal.validation && (
        <PDFPreviewModal
          open={previewModal.open}
          onClose={closePreviewModal}
          validation={previewModal.validation}
        />
      )}

      {approvalModal.validation && approvalModal.action && (
        <ApprovalModal
          open={approvalModal.open}
          onClose={closeApprovalModal}
          validation={approvalModal.validation}
          action={approvalModal.action}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </>
  );
}