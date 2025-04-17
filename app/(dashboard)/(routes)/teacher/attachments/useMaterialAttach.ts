import { useState, useCallback, useRef, useEffect } from "react";

export type DocumentType = {
  id: string;
  nombre: string;
  fechaCreacion: string;
  status: string;
  key: string;
};

interface FetchParams {
  limit: number;
  offset: number;
}

export const useMaterialAttach = (initialParams?: FetchParams & { initialFetch?: boolean }) => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ totalSizeMB: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
    currentPage: number;
    totalPages: number;
  } | null>(null);

  const lastParamsRef = useRef<FetchParams | null>(null);

  const fetchFiles = useCallback(async (params: FetchParams) => {
    if (
      lastParamsRef.current &&
      lastParamsRef.current.offset === params.offset &&
      lastParamsRef.current.limit === params.limit
    ) {
      return;
    }

    lastParamsRef.current = params;

    setLoading(true);
    try {
      const res = await fetch("/api/attachment/getAll", {
        method: "POST",
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!data || data.error) {
        console.error("Error fetching documents:", data.error);
        return;
      }

      const mappedDocs: DocumentType[] = (data.files || []).map((file: any, index: number) => ({
        id: file.id ?? file.key ?? `doc-${index}`,
        nombre: file.name ?? "Archivo sin nombre",
        fechaCreacion: file.createdAt ?? file.uploadedAt ?? new Date().toISOString(),
        status: file.status ?? "Uploaded",
        key: file.key ?? "",
      }));

      setDocuments(mappedDocs);
      setStorageInfo({ totalSizeMB: data.totalSizeMB || 0 });

      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback((params: FetchParams) => {
    fetchFiles(params);
  }, [fetchFiles]);

  // useEffect para realizar la primera carga si initialFetch es true
  useEffect(() => {
    if (initialParams?.initialFetch) {
      fetchFiles({ offset: initialParams.offset, limit: initialParams.limit });
    }
  }, [initialParams, fetchFiles]);

  return {
    documents,
    loading,
    storageInfo,
    pagination,
    refetch,
  };
};
