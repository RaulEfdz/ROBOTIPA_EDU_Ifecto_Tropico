"use client";
import { LucideMaximize } from "lucide-react";
import React, { useState, useEffect } from "react";

interface PdfViewerProps {
  pdfNameId?: string;
  pdfLink?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfNameId, pdfLink }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPdfLink = async () => {
      setIsLoading(true); // Inicia el estado de carga
      setFetchError(null); // Limpia cualquier error previo

      try {
        if (pdfNameId) {
          const [name, eid] = pdfNameId.split("_&!");

          const response = await fetch("/api/attachment/getFile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eid }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch PDF link");
          }

          const data = await response.json();
          setPdfUrl(data.fileUrl); // Asume que el backend devuelve un `fileUrl` en la respuesta
        } else if (pdfLink) {
          setPdfUrl(pdfLink); // Usa el enlace proporcionado directamente
        } else {
          throw new Error("No PDF identifier or link provided");
        }
      } catch (err: any) {
        console.error("Error fetching PDF:", err);
        setFetchError(
          err.message || "An error occurred while fetching the PDF"
        );
      } finally {
        setIsLoading(false); // Finaliza el estado de carga
      }
    };

    fetchPdfLink();
  }, [pdfNameId, pdfLink]);

  return (
    <div className="h-full">
      {isLoading ? (
        <p>Loading PDF...</p>
      ) : fetchError ? (
        <p style={{ color: "red" }}>{fetchError}</p>
      ) : pdfUrl ? (
        <>
          <div className="mt-4 text-center w-full flex justify-center">
            <button
              onClick={() => window.open(pdfUrl, "_blank")}
              className="px-4 py-2 bg-black text-TextCustom rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300 flex items-center space-x-2"
            >
              <LucideMaximize />
              <span>Maximizar</span>
            </button>
          </div>
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={{ width: "100%", height: "95%", border: "none" }}
          />
        </>
      ) : (
        <p>No PDF available</p>
      )}
    </div>
  );
};

export default PdfViewer;
