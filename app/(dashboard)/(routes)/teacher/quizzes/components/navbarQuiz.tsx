"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useQuizContext } from "../context/QuizContext";
import { PlusCircle } from "lucide-react";

const NavbarQuiz: React.FC = () => {
  const { openModal } = useQuizContext();

  return (
    <div className="bg-gradient-to-r from-emerald-400 to-emerald-400 shadow-md p-5 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-TextCustom hover:text-gray-200 transition-colors duration-300 cursor-pointer">
          Quizes
        </h2>
        <Button
          onClick={openModal}
          className="flex items-center gap-2 bg-[#FFFCF8] text-emerald-600 hover:bg-emerald-100"
        >
          <PlusCircle className="w-5 h-5" />
          Crear Quiz
        </Button>
      </div>
    </div>
  );
};

export default NavbarQuiz;
