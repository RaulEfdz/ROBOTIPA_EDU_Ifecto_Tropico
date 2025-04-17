import { useState, useCallback } from "react";

export function useStorageAnalysis() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attachment/analyzeAll", {
        method: "POST",
        body: JSON.stringify({ fullScan: true }),
      });
      const data = await res.json();
      if (res.ok) setReport(data);
      else throw new Error(data.error || "Error desconocido");
    } catch (err) {
      console.error("Error analizando almacenamiento:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, analyze, loading };
}
