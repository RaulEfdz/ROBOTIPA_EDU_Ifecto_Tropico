/* File: hooks/useExamData.ts */
import useSWR from "swr";
import React from "react";
import { fetcher, examProcessor, Exam, AttemptsData } from "../utils/examApi";

export function useExam(examId: string) {
  const {
    data: rawExam,
    error,
    mutate,
  } = useSWR<Exam>(examId ? `/api/exams/${examId}` : null, fetcher);
  const exam = React.useMemo(
    () => (rawExam ? examProcessor(rawExam) : null),
    [rawExam]
  );
  return { exam, rawExam, error, mutate };
}

export function useAttempts(examId: string) {
  const { data: attemptsData } = useSWR<AttemptsData>(
    examId ? `/api/exams/${examId}/attempts` : null,
    fetcher
  );
  return { attemptsData };
}
