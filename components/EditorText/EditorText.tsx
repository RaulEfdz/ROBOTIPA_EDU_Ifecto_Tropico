"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";

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
          ["link", "image", "file"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: () => {},
          link: () => {},
          file: () => {},
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

  // Image handler (Cloudinary)
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
            quill.enable(true);
            quill.insertEmbed(cursorIndex, "image", imageUrl);
            quill.setSelection(cursorIndex + 1);
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

  // File handler (UploadThing)
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

      toast.loading(`Uploading ${file.name}...`, { id: uploadToastId });
      quill.enable(false);

      try {
        const response = await startUpload([file]);
        if (!response || response.length === 0) throw new Error("Upload failed");

        const fileUrl = response[0].url;
        const fileName = file.name;
        
        // Create a proper file link with icon
        quill.enable(true);
        
        // Insert the file icon and name
        const fileIcon = `[ 📘 ${fileName}] `;
        quill.insertText(cursorIndex, fileIcon, 'bold', true);
        
        // Format the text as a link
        quill.setSelection(cursorIndex, fileIcon.length);
        quill.format('link', fileUrl);
        
        // Move cursor to the end
        quill.setSelection(cursorIndex + fileIcon.length + 1);

        const html = quill.root.innerHTML;
        onChangeRef.current(html === "<p><br></p>" ? "" : html);
        toast.success(`File "${fileName}" uploaded`, { id: uploadToastId });
      } catch (err: any) {
        console.error("File upload error:", err);
        toast.error("Upload failed: " + (err.message || "Unknown error"), { id: uploadToastId });
        quill.enable(true);
      }
    };
  }, [quill, startUpload]);

  // Link handler
  const linkHandler = useCallback(() => {
    if (!quill) return;
    
    const range = quill.getSelection();
    if (!range) return;
    
    const value = prompt('Enter link URL:');
    if (!value) return;
    
    if (range.length > 0) {
      // If text is selected, format it as a link
      quill.format('link', value);
    } else {
      // If no text selected, insert the URL as a link
      quill.insertText(range.index, value, { 'link': value });
      quill.setSelection(range.index + value.length);
    }
    
    const html = quill.root.innerHTML;
    onChangeRef.current(html === "<p><br></p>" ? "" : html);
  }, [quill]);

  // Configure handlers and load initial content
  useEffect(() => {
    if (!quill || !QuillInstance) return;

    const toolbar = quill.getModule("toolbar") as any;
    if (toolbar?.addHandler) {
      toolbar.addHandler("image", imageHandler);
      toolbar.addHandler("file", fileHandler);
      toolbar.addHandler("link", linkHandler);
    }

    // Load initial content if exists
    if (!didLoadInitialContent.current && initialText) {
      try {
        quill.root.innerHTML = initialText;
        quill.history.clear();
        didLoadInitialContent.current = true;
      } catch (error) {
        console.error("Error setting initial content:", error);
      }
    }

    // Handle text changes
    const handleTextChange = () => {
      let html = quill.root.innerHTML;
      if (html === "<p><br></p>") html = "";
      onChangeRef.current(html);
    };
    
    quill.on("text-change", handleTextChange);
    
    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill, imageHandler, fileHandler, linkHandler, initialText, QuillInstance]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm quill-editor-container">
      <div ref={quillRef} style={{ minHeight }} className="prose dark:prose-invert max-w-none" />
    </div>
  );
};

export default EditorText;