// components/exam/ExamItem.tsx - Individual exam item
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ExamItemProps {
  id: string;
  title: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ExamItem: React.FC<ExamItemProps> = ({
  id,
  title,
  isSelected,
  onToggle,
}) => {
  return (
    <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <Checkbox
        id={`exam-${id}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(id)}
        className="mr-3"
      />
      <label
        htmlFor={`exam-${id}`}
        className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300"
      >
        {title}
      </label>
    </div>
  );
};
