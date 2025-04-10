import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ModalViewer from "./ModalViewer";
import { Dot} from "lucide-react";

interface TextTransformerProps {
  text: string;
}

type ModalType = "quiz" | "resource";

const TextTransformer: React.FC<TextTransformerProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalData, setModalData] = useState<{ id: string; type: ModalType } | null>(null);

  const openModal = (id: string, type: ModalType) => {
    setModalData({ id, type });
  };

  const closeModal = () => {
    setModalData(null);
  };

  useEffect(() => {
    const container = containerRef.current;

    const handleClickEvent = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "BUTTON" &&
        target.dataset.id &&
        (target.dataset.type === "quiz" || target.dataset.type === "resource")
      ) {
        openModal(target.dataset.id, target.dataset.type as ModalType);
      }
    };

    container?.addEventListener("click", handleClickEvent);
    return () => {
      container?.removeEventListener("click", handleClickEvent);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="space-y-4 p-4 bg-gray-100 rounded-md">
        <RichTextRenderer text={text} />
      </div>
      {modalData && (
        <ModalViewer
          isOpen={!!modalData}
          onClose={closeModal}
          id={modalData.id}
          type={modalData.type}
        />
      )}
    </>
  );
};

const RichTextRenderer = ({ text }: { text: string }) => {
  const transformText = (inputText: string) => {
    if (!inputText) return "";
  
    return inputText
      .replace(/@\[(Quiz_[\w\s&;!-]+)\]/g, (match, quizId) => {
        const displayName = `Abrir Quiz: ${quizId.split("_")[1] || "Sin Nombre"}`;
        return `<button class="bg-green-500 text-white px-2 py-1 rounded hover:shadow-lg" data-id="${quizId}" data-type="quiz">${displayName}</button>`;
      })
      .replace(/@\[(Resource_[\w\s&;!-]+)\]/g, (match, resourceId) => {
        const displayName = `Abrir Recurso: ${resourceId.split("_")[1] || "Sin Nombre"}`;
        return `<button class="bg-[#386329] text-white px-2 py-1 rounded hover:shadow-lg" data-id="${resourceId}" data-type="resource">${displayName}</button>`;
      })
      .replace(/•\s(.*?)(?=\n|$)/g, (_, p1) => `- ${p1}`) // Convierte viñetas en listas Markdown
      .replace(/\n/g, "\n");
  };
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children }) => <p className="text-gray-700 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-bold  flex">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mt-5">{children}</ul>,
        li: ({ children }) => <li className="text-gray-700 mt-3 w-full flex"><Dot/>{children}</li>,
        h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-800">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-medium text-gray-700">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-medium text-gray-600">{children}</h4>,
        h5: ({ children }) => <h5 className="text-base font-medium text-gray-500">{children}</h5>,
        h6: ({ children }) => <h6 className="text-sm font-medium text-gray-400">{children}</h6>,
        text: ({ children }) => {
          if (typeof children === "string") {
            if (children.startsWith("QUIZ:")) {
              const id = children.replace("QUIZ:", "");
              return (
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:shadow-lg"
                  data-id={id}
                  data-type="quiz"
                >
                  Abrir Quiz: {id.split("_")[1] || "Sin Nombre"}
                </button>
              );
            } else if (children.startsWith("RESOURCE:")) {
              const id = children.replace("RESOURCE:", "");
              return (
                <button
                  className="bg-[#386329] text-white px-2 py-1 rounded hover:shadow-lg"
                  data-id={id}
                  data-type="resource"
                >
                  Abrir Recurso: {id.split("_")[1] || "Sin Nombre"}
                </button>
              );
            }
          }
          return children;
        },
      }}
    >
      {transformText(text)}
    </ReactMarkdown>
  );
};

interface PreviewProps {
  value: string;
}

export const Preview: React.FC<PreviewProps> = ({ value }) => {
  return (
    <div className="p-4 rounded-md bg-[#FFFCF8] shadow-md">
      <TextTransformer text={value} />
    </div>
  );
};

export default Preview;
