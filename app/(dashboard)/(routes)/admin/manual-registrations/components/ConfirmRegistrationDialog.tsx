/*
File: app/components/ConfirmRegistrationDialog.tsx
Description: Dialog to confirm manual registration action.
*/
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

// Assuming ParsedData is defined in the parent page or a shared types file
interface ParsedData {
  courseId: string;
  userId: string;
  date: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

interface ConfirmRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  data: ParsedData;
}

export function ConfirmRegistrationDialog({
  open,
  onClose,
  onConfirm,
  loading,
  data,
}: ConfirmRegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-6 w-6" /> Confirmar Registro Manual
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Estás a punto de otorgar acceso manualmente. Esta acción es
            irreversible y creará/actualizará un registro de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>Usuario:</strong> {data.userName || data.userId}
          </p>
          <p>
            <strong>Curso:</strong> {data.courseTitle || data.courseId}
          </p>
          <p>
            <strong>Fecha de Activación:</strong> {data.date}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            disabled={loading}
            onClick={onConfirm}
            className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Confirmar y Registrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
