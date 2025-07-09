"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import { getQuillSafeFileBlockHtml } from "./htmlBlocks";

interface CloudinaryUploadResponse {
  success: boolean;
  result?: { secure_url: string };
  error?: string;
}

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
  const {
    quill,
    quillRef,
    Quill: QuillInstance,
  } = useQuill({
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          [{ script: "sub" }, { script: "super" }],
          [{ align: [] }],
          ["link", "image", "file"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: () => {},
          link: () => {},
          file: () => {},
        },
        clipboard: {
          allowed: {
            tags: ["a"],
            attributes: ["href", "target", "rel", "style", "class"],
          },
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

  const { startUpload } = useUploadThing("editorFileUpload");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const didLoadInitialContent = useRef(false);
  const [saveAsHtml, setSaveAsHtml] = useState(true);

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
              body: JSON.stringify({
                image: base64Image,
                folder: cloudinaryFolderName,
              }),
            });
            const data: CloudinaryUploadResponse = await response.json();
            if (!response.ok || !data.success || !data.result?.secure_url) {
              throw new Error(data.error || "Upload failed");
            }
            const imageUrl = data.result.secure_url;
            quill.enable(true);
            quill.insertEmbed(cursorIndex, "image", imageUrl);
            quill.setSelection(cursorIndex + 1);
            const html = quill.root.innerHTML;
            onChangeRef.current(html === "<p><br></p>" ? "" : html);
            toast.success("Image uploaded", { id: uploadToastId });
          } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`, {
              id: uploadToastId,
            });
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

  const fileHandler = useCallback(() => {
    if (!quill) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";
    input.style.display = "none";
    document.body.appendChild(input);
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;

      const cursorIndex = quill.getSelection()?.index ?? quill.getLength();
      const uploadToastId = "upload-file-toast-" + Date.now();

      toast.loading(`Subiendo ${file.name}...`, { id: uploadToastId });
      quill.enable(false);

      try {
        const response = await startUpload([file]);
        if (!response || response.length === 0)
          throw new Error("Error al subir archivo");

        const fileUrl = response[0].url;
        const fileName = file.name;

        quill.enable(true);

        // Aquí defines cómo se verá el bloque insertado
        const fileBlockHtml = getQuillSafeFileBlockHtml(fileUrl, fileName);

        quill.clipboard.dangerouslyPasteHTML(cursorIndex, fileBlockHtml);

        quill.setSelection(cursorIndex + 1);

        const html = quill.root.innerHTML;
        onChangeRef.current(html === "<p><br></p>" ? "" : html);
        toast.success(`Archivo "${fileName}" subido`, { id: uploadToastId });
      } catch (err: any) {
        console.error("Error en subida de archivo:", err);
        toast.error("Fallo al subir: " + (err.message || "Error desconocido"), {
          id: uploadToastId,
        });
        quill.enable(true);
      }
    };
  }, [quill, startUpload]);

  const linkHandler = useCallback(() => {
    if (!quill) return;

    const range = quill.getSelection();
    if (!range) return;

    const value = prompt("Enter link URL:");
    if (!value) return;

    if (range.length > 0) {
      quill.format("link", value);
    } else {
      quill.insertText(range.index, value, { link: value });
      quill.setSelection(range.index + value.length);
    }

    const html = quill.root.innerHTML;
    onChangeRef.current(html === "<p><br></p>" ? "" : html);
  }, [quill]);

  // useEffect(() => {
  //   if (!quill || !QuillInstance) return;

  //   const toolbar = quill.getModule("toolbar") as any;
  //   if (toolbar?.addHandler) {
  //     toolbar.addHandler("image", imageHandler);
  //     toolbar.addHandler("file", fileHandler);
  //     toolbar.addHandler("link", linkHandler);
  //   }

  //   if (!didLoadInitialContent.current && initialText) {
  //     try {
  //       quill.root.innerHTML = initialText;
  //       quill.history.clear();
  //       didLoadInitialContent.current = true;
  //     } catch (error) {
  //       console.error("Error setting initial content:", error);
  //     }
  //   }

  //   const handleTextChange = () => {
  //     const content = saveAsHtml ? quill.root.innerHTML : quill.root.innerText;
  //     onChangeRef.current(
  //       content === "<p><br></p>" || content.trim() === "" ? "" : content
  //     );
  //   };

  //   quill.on("text-change", handleTextChange);
  //   return () => {
  //     quill.off("text-change", handleTextChange);
  //   };
  // }, [quill, imageHandler, fileHandler, linkHandler, initialText, QuillInstance, saveAsHtml]);

  useEffect(() => {
    if (!quill || !QuillInstance) return;

    const toolbar = quill.getModule("toolbar") as any;
    if (toolbar?.addHandler) {
      toolbar.addHandler("image", imageHandler);
      toolbar.addHandler("file", fileHandler);
      toolbar.addHandler("link", linkHandler);
    }

    // ✅ Agregar ícono manual al botón ql-file
    const fileButton = document.querySelector(".ql-file");
    if (fileButton && fileButton.innerHTML.trim() === "") {
      fileButton.innerHTML = `
        <svg viewBox="0 0 18 18">
          <path class="ql-stroke" d="M6 2H12V6H16V16H2V2H6Z" />
          <line class="ql-stroke" x1="6" x2="12" y1="12" y2="12" />
        </svg>
      `;
    }

    // ✅ Set initial content si aplica
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
      const content = saveAsHtml ? quill.root.innerHTML : quill.root.innerText;
      onChangeRef.current(
        content === "<p><br></p>" || content.trim() === "" ? "" : content
      );
    };

    quill.on("text-change", handleTextChange);
    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [
    quill,
    imageHandler,
    fileHandler,
    linkHandler,
    initialText,
    QuillInstance,
    saveAsHtml,
  ]);

  // Importar quill-paste-smart solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("quill-paste-smart");
    }
  }, []);

  return (
    <div className="bg-TextCustom dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm quill-editor-container">
      {/* <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-muted-foreground">
          Modo de guardado:{" "}
          <strong>{saveAsHtml ? "HTML enriquecido" : "Texto plano"}</strong>
        </span>
        <button
          onClick={() => setSaveAsHtml((prev) => !prev)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Cambiar a {saveAsHtml ? "texto plano" : "HTML"}
        </button>
      </div> */}
      <div className="quill-editor-container">
        <div
          ref={quillRef}
          style={{ minHeight }}
          className="prose dark:prose-invert max-w-none"
        />
      </div>
    </div>
  );
};

export default EditorText;

// el toolbar de la herrmaienta , en actulizacion debe estar fltante
