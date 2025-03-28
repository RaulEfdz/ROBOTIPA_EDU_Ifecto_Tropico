"use client";

import React from "react";
import ResourceSidebar from "./ResourceSidebar";
import QuizSidebar from "./QuizSidebar";

// Modelo de recurso
interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url?: string;
}

interface NavBarProps {
  items: any;
  insertReference: (reference: string) => void;
  lang: "es" | "en";
}

const NavBarSliderBar: React.FC<NavBarProps> = ({ items, insertReference, lang }) => {
  return (
    <nav className="flex items-center justify-center">
      <div className="flex gap-4">
        {/* Botón de Recursos */}
        <div className="text-sm">
          <ResourceSidebar
            items={items}
            onInsertReference={insertReference}
            lang={lang}
          />
        </div>

        {/* Botón de Quizzes */}
        <div className="text-sm">
          <QuizSidebar
            onInsertQuizReference={insertReference}
            lang={lang}
          />
        </div>
      </div>
    </nav>
  );
};

export default NavBarSliderBar;
