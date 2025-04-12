"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";

// Interface para la respuesta esperada de Cloudinary
interface CloudinaryUploadResponse {
  success: boolean;
  result?: { secure_url: string };
  error?: string;
}

// Props del componente
interface EditorTextProps {
  initialText?: string;
  onChange: (content: string) => void;
  cloudinaryFolderName?: string;
  minHeight?: string;
  placeholder?: string;
}

const EditorText: React.FC<EditorTextProps> = ({
  initialText = "",
  onChange,
  cloudinaryFolderName = "editor-uploads",
  minHeight = "200px",
  placeholder = "Write something...",
}) => {
  const { quill, quillRef, Quill: QuillInstance } = useQuill({
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ script: "sub" }, { script: "super" }],
          [{ align: [] }],
          ["link", "image"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: () => {}, // Se sobrescribirá luego
        },
      },
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true,
      },
    },
    theme: "snow",
    placeholder,
  });

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const didLoadInitialContent = useRef(false);

  const imageHandler = useCallback(() => {
    if (!quill) return;
  
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();
  
    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;
  
      const range = quill.getSelection(true);
      const cursorIndex = range ? range.index : quill.getLength();
      const uploadToastId = "upload-toast-" + Date.now();
  
      toast.loading("Uploading image...", { id: uploadToastId });
      quill.enable(false);
  
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
  
        reader.onloadend = async () => {
          try {
            const base64Image = reader.result as string;
  
            const response = await fetch("/api/cloudinary/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Image, folder: cloudinaryFolderName }),
            });
  
            const data: CloudinaryUploadResponse = await response.json();
  
            if (!response.ok || !data.success || !data.result?.secure_url) {
              throw new Error(data.error || "Upload failed");
            }
  
            const imageUrl = data.result.secure_url;
  
            // Inserta la imagen correctamente en el editor
            quill.enable(true);
            quill.insertEmbed(cursorIndex, "image", imageUrl);
            quill.setSelection(cursorIndex + 1);
  
            // Actualiza el contenido HTML inmediatamente después de insertar la imagen
            const html = quill.root.innerHTML;
            onChangeRef.current(html === "<p><br></p>" ? "" : html);
  
            toast.success("Image uploaded", { id: uploadToastId });
          } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`, { id: uploadToastId });
            quill.enable(true);
          }
        };
  
        reader.onerror = (error) => {
          console.error("Read error:", error);
          toast.error("Error reading file", { id: uploadToastId });
          quill.enable(true);
        };
      } catch (err: any) {
        console.error("Upload init error:", err);
        toast.error(`Error: ${err.message}`, { id: uploadToastId });
        quill.enable(true);
      }
    };
  }, [quill, cloudinaryFolderName]);
  
  useEffect(() => {
    if (!quill || !QuillInstance) return;

    const toolbar = quill.getModule("toolbar") as any;
    if (toolbar?.addHandler) {
      toolbar.addHandler("image", imageHandler);
    }

    if (!didLoadInitialContent.current && initialText) {
      try {
        quill.root.innerHTML = initialText;
        quill.history.clear();
        didLoadInitialContent.current = true;
      } catch (error) {
        console.error("Error setting initial content:", error);
      }
    }

    const handleTextChange = () => {
      let html = quill.root.innerHTML;
      if (html === "<p><br></p>") html = "";
      onChangeRef.current(html);
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill, imageHandler, initialText, QuillInstance]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm quill-editor-container">
      <div
        ref={quillRef}
        style={{ minHeight }}
        className="prose dark:prose-invert max-w-none"
      />
    </div>
  );
};

export default EditorText;