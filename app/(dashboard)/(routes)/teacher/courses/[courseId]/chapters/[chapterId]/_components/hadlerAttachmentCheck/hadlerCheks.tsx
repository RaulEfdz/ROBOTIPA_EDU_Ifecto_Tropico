// "use client";

import React, { useState } from "react";
import { formmatedFile } from "@/tools/formmatedFile";
import { HandlerChecksItem } from "../../page";

// Textos en español e inglés
const texts = {
  es: {
    copyTooltip: "Copia y pega el nombre del archivo en la descripción para incluirlo como recurso en este capítulo",
    copiedMessage: "¡Nombre copiado!",
  },
  en: {
    copyTooltip: "Copy and paste the file name in the description to include it as a resource in this chapter",
    copiedMessage: "Name copied!",
  },
};

export type HandlerChecksListProps = {
  items: HandlerChecksItem[];
  lang?: "es" | "en";
};

const HandlerChecks: React.FC<HandlerChecksListProps> = ({ items, lang = "es" }) => {
  return (
    <ul className="max-w-md space-y-2 text-gray-500 list-disc list-inside dark:text-gray-400">
      {items.map((item, index) => {
        const name = formmatedFile(item.name);
        return <ListItem key={index} index={index + 1} name={name} lang={lang} />;
      })}
    </ul>
  );
};

export default HandlerChecks;

interface ListItemProps {
  index: number;
  name: string;
  lang: "es" | "en";
}

const ListItem: React.FC<ListItemProps> = ({ index, name, lang }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(name).then(() => {
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000); // Mensaje se oculta después de 2 segundos
    });
  };

  return (
    <li
      className="flex items-center p-2 rounded-md shadow hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={copyToClipboard}
    >
      <p className="text-md font-light text-gray-900 dark:text-white mr-2">{index}.</p>
      <p className="text-md font-semibold text-gray-900 dark:text-white">{name}</p>

      {showTooltip && (
        <div className="fixed z-10 p-2 w-72 text-sm text-white bg-[green] rounded shadow-md transform -translate-y-10">
          {texts[lang].copyTooltip}
        </div>
      )}
      {showCopiedMessage && (
        <div className="fixed bottom-10 right-10 z-20 p-2 text-sm text-white bg-green-500 rounded shadow-md">
          {texts[lang].copiedMessage}
        </div>
      )}
    </li>
  );
};
