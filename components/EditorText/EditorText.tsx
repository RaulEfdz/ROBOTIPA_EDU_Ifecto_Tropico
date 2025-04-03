"use client";

import React, { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

interface EditorTextProps {
  initialText?: string;
  onChange: (content: string) => void;
}

const EditorText: React.FC<EditorTextProps> = ({ initialText = "", onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
        ["clean"],
      ],
    },
    theme: "snow",
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (quill) {
      if (isFirstRender.current && initialText) {
        quill.clipboard.dangerouslyPasteHTML(initialText);
        isFirstRender.current = false;
      }

      const handleTextChange = () => {
        const html = quill.root.innerHTML || "";
        onChange(html);
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill, initialText, onChange]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div ref={quillRef} className="min-h-[160px] px-4 py-3 text-sm text-gray-800 dark:text-gray-100" />
    </div>
  );
};

export default EditorText;
