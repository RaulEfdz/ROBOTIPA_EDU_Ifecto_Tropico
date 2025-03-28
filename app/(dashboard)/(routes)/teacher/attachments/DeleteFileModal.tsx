import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type DeleteFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fileKey: string;
  fileName: string;
  onDeleteSuccess: () => void;
};


export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  isOpen,
  onClose,
  fileKey,
  fileName,
  onDeleteSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attachment/deleteFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKeys: [fileKey],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      onDeleteSuccess();
      onClose();
    } catch (err: any) {
      setError("Error al eliminar el archivo. Por favor, intenta de nuevo.");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Archivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            ¿Estás seguro de que deseas eliminar el archivo: <strong>{fileName}</strong>?
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
