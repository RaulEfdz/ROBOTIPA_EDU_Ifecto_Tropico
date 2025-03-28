"use client";
import { useEffect, useState, useCallback } from "react";

export type DocumentType = {
  id: string;
  nombre: string;
  fechaCreacion: string;
  status: string;
  key: string;
};

export const useMaterialAttach = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchStatus, setFetchStatus] = useState<string>("Loading...");

  const fetchDocuments = useCallback(async () => {
    async function fetchFiles() {
      const response = await fetch("/api/attachment/getAll", {
        method: "POST",
        body: JSON.stringify({}), // Cuerpo vacío según la documentación
      });
      return response.json();
    }

    try {
      setLoading(true);
      setFetchStatus("Fetching documents...");
      const data = await fetchFiles();
      if (!data.files || data.files.length === 0) {
        setFetchStatus("No documents found.");
        setDocuments([]);
        return;
      }
      const documentsData = data.files.map((file: any) => ({
        id: file.id,
        nombre: file.name,
        fechaCreacion: new Date(file.uploadedAt).toLocaleDateString(),
        status: file.status,
        key: file.key,
      }));
      setDocuments(documentsData);
      setFetchStatus("Documents fetched successfully.");
    } catch (error) {
      setFetchStatus("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, fetchStatus, refetch: fetchDocuments };
};
