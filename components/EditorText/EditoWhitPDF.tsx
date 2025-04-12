'use client';

import React, { useEffect, useRef, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { toast } from "sonner";

// Registrar el ícono para el botón "pdf" solo en el lado del cliente
if (typeof window !== "undefined") {
  const icons = Quill.import("ui/icons") as Record<string, any>;
  // Aquí se asigna un pequeño span con la etiqueta "PDF". Puedes usar un SVG o cualquier otro HTML.
  icons.pdf = '<span style="font-size:12px; font-weight:bold;">PDF</span>';
}

interface PdfEditorProps {
  initialText?: string;
  onChange: (content: string) => void;
  minHeight?: string;
  placeholder?: string;
}

const PdfEditor: React.FC<PdfEditorProps> = ({
  initialText = "",
  onChange,
  minHeight = "200px",
  placeholder = "Escribe algo..."
}) => {
  // Configuración del editor Quill con la barra de herramientas personalizada
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
          ["pdf"] // Botón personalizado para PDF
        ],
        handlers: {
          // Al hacer clic en el botón "pdf", se dispara un click sobre el input de archivo oculto
          pdf: () => {
            if (pdfInputRef.current) {
              pdfInputRef.current.click();
            }
          }
        }
      },
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true
      }
    },
    theme: "snow",
    placeholder
  });

  // Referencias y estados
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [isPdfConverting, setIsPdfConverting] = useState<boolean>(false);
  const [pdfConversionError, setPdfConversionError] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Cargar contenido inicial (si se provee) y limpiar el historial
  useEffect(() => {
    if (quill && initialText) {
      const delta = quill.clipboard.convert({ html: initialText });
      quill.setContents(delta, Quill.sources.SILENT);
      quill.history.clear();
    }
  }, [quill, initialText]);

  // Actualizar el contenido cada vez que se edita
  useEffect(() => {
    if (quill) {
      const handleTextChange = () => {
        let html = quill.root.innerHTML || "";
        if (html === "<p><br></p>") html = "";
        onChangeRef.current(html);
      };
      quill.on(Quill.events.TEXT_CHANGE, handleTextChange);

      return () => {
        quill.off(Quill.events.TEXT_CHANGE, handleTextChange);
      };
    }
  }, [quill]);

  // Manejo de la subida y conversión del archivo PDF
  const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setIsPdfConverting(true);
    setPdfConversionError(null);
  
    const formData = new FormData();
    formData.append("pdf_file", file);
  
    try {
      const response = await fetch("/api/convert-pdf", {
        method: "POST",
        body: formData,
      });
  
      // Verifica si la cabecera indica JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          // Proceso exitoso, actualizar el editor con el HTML recibido
          if (quill) {
            const delta = quill.clipboard.convert({ html: data.html });
            quill.setContents(delta, Quill.sources.USER);
            toast.success("PDF convertido e insertado!");
          }
        } else {
          setPdfConversionError(data.error || "Error al convertir PDF");
          toast.error(data.error || "Error al convertir PDF");
        }
      } else {
        // En caso de que no sea JSON, muestra un error genérico
        setPdfConversionError("La respuesta del servidor no es válida.");
        toast.error("Error: Respuesta no válida del servidor.");
      }
    } catch (e: any) {
      console.error("Error al enviar el archivo PDF:", e);
      setPdfConversionError("Ocurrió un error al enviar el archivo PDF.");
      toast.error("Error al enviar el archivo PDF.");
    } finally {
      setIsPdfConverting(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };
  

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Indicador mientras se está procesando la conversión */}
      {isPdfConverting && (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2 px-4 text-center">
          Convirtiendo PDF...
        </div>
      )}
      {/* Mensaje en caso de error */}
      {pdfConversionError && (
        <div className="bg-red-100 dark:bg-red-800 text-red-500 dark:text-red-400 py-2 px-4 text-center">
          {pdfConversionError}
        </div>
      )}
      {/* Input oculto para la selección del archivo PDF */}
      <input
        type="file"
        accept=".pdf"
        ref={pdfInputRef}
        style={{ display: "none" }}
        onChange={handlePdfFileChange}
      />
      {/* Área del editor */}
      <div
        ref={quillRef}
        style={{ minHeight }}
        className="prose dark:prose-invert max-w-none"
      />
    </div>
  );
};

export default PdfEditor;
