"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ParsedData {
  courseId: string;
  userId: string;
  date: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

interface ParseRequestFormProps {
  onParsed: (data: ParsedData) => void;
  requestCodeValue: string;
  onRequestCodeChange: (value: string) => void;
}

export function ParseRequestForm({
  onParsed,
  requestCodeValue,
  onRequestCodeChange,
}: ParseRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!requestCodeValue.trim()) {
      setError("El ID de solicitud no puede estar vacío.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/manual-access/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: requestCodeValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Error al procesar el ID.";
        const details = data.details || "";
        const fullMsg = details ? `${errMsg}: ${details}` : errMsg;
        setError(fullMsg);
        toast.error(
          <>
            <div>
              <strong>{errMsg}</strong>
              {details && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
                  {details}
                </div>
              )}
            </div>
          </>,
          { duration: 10000 }
        );
        setLoading(false);
        return;
      }
      onParsed(data);
      toast.success("ID procesado correctamente. Verifica los datos.");
    } catch (err: any) {
      const msg = err.message || "Error al procesar el ID.";
      setError(msg);
      toast.error(msg, { duration: 10000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="requestCode"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          ID de Solicitud Completo
        </label>
        <div className="flex gap-2">
          <Input
            id="requestCode"
            type="text"
            value={requestCodeValue}
            onChange={(e) => onRequestCodeChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleParse()}
            placeholder={`Ej: cursoId${process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|"}userId${process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|"}YYYYMMDD`}
            className="flex-grow dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
          />
          <Button
            onClick={handleParse}
            disabled={loading || !requestCodeValue.trim()}
            className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Verificar ID"
            )}
          </Button>
        </div>
      </div>
      {error && (
        <Alert
          variant="destructive"
          className="dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
        >
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error de Validación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
