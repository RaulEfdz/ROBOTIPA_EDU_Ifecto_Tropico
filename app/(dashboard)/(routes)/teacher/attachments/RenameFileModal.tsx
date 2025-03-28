import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type RenameFileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fileKey: string;
  currentName: string;
  onRenameSuccess: (response: any) => void;
};

export const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  onClose,
  fileKey,
  currentName,
  onRenameSuccess,
}) => {
  const [newName, setNewName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async () => {
    if (!newName.trim()) {
      setError("El nuevo nombre no puede estar vacío.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attachment/renameFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates: [{ fileKey, newName }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      onRenameSuccess(newName);
      setNewName("");
      onClose();
    } catch (err: any) {
      setError("Error al renombrar el archivo. Por favor, intenta de nuevo.");
      console.error("Rename error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renombrar Archivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Renombrar el archivo: <strong>{currentName}</strong>
          </p>
          <Input
            placeholder="Ingrese un nuevo nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleRename} disabled={loading || !newName.trim()}>
            {loading ? "Renombrando..." : "Renombrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
