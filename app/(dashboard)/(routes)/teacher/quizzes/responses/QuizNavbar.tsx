"use client";

import React, { useState } from "react";
import { UserCircle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizNavbarProps {
  setCurrentView: (view: "QuizForResponses" | "QuizForUser") => void;
}

function QuizNavbar({ setCurrentView }: QuizNavbarProps) {
  const [activeView, setActiveView] = useState<"QuizForResponses" | "QuizForUser">("QuizForResponses");

  const handleViewChange = (value: "QuizForResponses" | "QuizForUser") => {
    setActiveView(value);
    setCurrentView(value);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-[#FFFCF8]/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <span className="hidden font-bold text-xl md:inline-block text-gray-800">
            Quiz Dashboard
          </span>
        </div>

        <div className="flex items-center">
          <div className="bg-green-50 rounded-lg p-1 w-[400px]">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleViewChange("QuizForResponses")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                  activeView === "QuizForResponses"
                    ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                    : "bg-green-200 text-green-900 hover:bg-green-200"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span className="font-medium">Por Respuestas</span>
              </button>

              <button
                onClick={() => handleViewChange("QuizForUser")}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                  activeView === "QuizForUser"
                    ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                    : "bg-green-200 text-green-900 hover:bg-green-200"
                )}
              >
                <UserCircle className="h-4 w-4" />
                <span className="font-medium">Por Usuarios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizNavbar;
