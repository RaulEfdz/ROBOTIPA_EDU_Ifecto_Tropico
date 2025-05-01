"use client";

import React from "react";
import useSWR from "swr";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExamAttemptsTab({ examId }: { examId: string }) {
  const { data, error, isLoading } = useSWR(
    examId ? `/api/exams/${examId}/attempts` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.attempts?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>No hay intentos registrados para este examen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.attempts.map((attempt: any) => (
        <div
          key={attempt.id}
          className="p-4 rounded border bg-white shadow-sm flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{attempt.user?.fullName || "Anónimo"}</p>
            <p className="text-sm text-gray-500">{attempt.user?.email}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-600">
              {attempt.score}% de acierto
            </p>
            <p className="text-sm text-gray-400">
              {new Date(attempt.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
