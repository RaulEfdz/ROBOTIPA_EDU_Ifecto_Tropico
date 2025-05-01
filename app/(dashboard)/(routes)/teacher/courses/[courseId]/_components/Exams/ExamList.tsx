// components/exam/ExamList.tsx - List of exams
import React from "react";
import { ExamItem } from "./ExamItem";

interface ExamListProps {
  exams: Array<{ id: string; title: string }>;
  selectedSet: Set<string>;
  isLoading: boolean;
  error: string | null;
  toggleExam: (id: string) => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  selectedSet,
  isLoading,
  error,
  toggleExam,
}) => {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-500">{error}</p>
        <button className="mt-2 text-blue-500 underline text-sm">
          Reintentar
        </button>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 italic">No hay exámenes disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto px-1 py-2">
      {exams.map((exam) => (
        <ExamItem
          key={exam.id}
          id={exam.id}
          title={exam.title}
          isSelected={selectedSet.has(exam.id)}
          onToggle={toggleExam}
        />
      ))}
    </div>
  );
};
