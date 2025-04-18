"use client";

import React, { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface EditorTextPreviewProps {
  htmlContent: string;
  minHeight?: string;
}

const EditorTextPreview: React.FC<EditorTextPreviewProps> = ({
  htmlContent,
  minHeight = "200px",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  return (
    <div className="bg-TextCustom dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div
        ref={containerRef}
        style={{ minHeight }}
        className="ql-editor text-slate-800 max-w-none
          [&_h1]:text-6xl
          [&_h2]:text-5xl
          [&_h3]:text-4xl
          [&_h4]:text-3xl
          [&_h5]:text-2xl
          [&_h6]:text-xl
          [&_p]:leading-relaxed
        "
      />
    </div>
  );
};

export default EditorTextPreview;
