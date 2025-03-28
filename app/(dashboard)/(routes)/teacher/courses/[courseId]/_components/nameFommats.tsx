import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircleIcon, CheckCircle2 } from 'lucide-react';

// Textos en español e inglés
const texts = {
  es: {
    title: "¿Qué formatos de nombres están permitidos?",
    noteNoDots: "Nota: No se deben usar puntos en los nombres de archivo.",
    noteSpacesAllowed: "Nota: Los espacios están permitidos.",
    allowedExamplesTitle: "Ejemplos de nombres de archivo permitidos:",
    allowedExample1: "1 - documento_sin_puntos.txt",
    allowedExample2: "A - imagen_sin_puntos.jpg",
    notAllowedExamplesTitle: "Ejemplos de nombres de archivo con puntos (no permitidos):",
    notAllowedExample1: "1. archivo.con.puntos.pdf",
    notAllowedExample2: "A. imagen.con.puntos.png",
  },
  en: {
    title: "What name formats are allowed?",
    noteNoDots: "Note: Dots should not be used in file names.",
    noteSpacesAllowed: "Note: Spaces are allowed.",
    allowedExamplesTitle: "Examples of allowed file names:",
    allowedExample1: "1 - document_without_dots.txt",
    allowedExample2: "A - image_without_dots.jpg",
    notAllowedExamplesTitle: "Examples of file names with dots (not allowed):",
    notAllowedExample1: "1. file.with.dots.pdf",
    notAllowedExample2: "A. image.with.dots.png",
  },
};

type Lang = "es" | "en";

interface NameFormatsProps {
  lang?: Lang;
}

const NameFormats: React.FC<NameFormatsProps> = ({ lang = "es" }) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <span className="text-Sky801">{texts[lang].title}</span>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-red-500">
            <AlertCircleIcon className="inline-block h-5 w-5 mr-2" /> {texts[lang].noteNoDots}
          </p>
          <p className="text-success">
            <CheckCircle2 className="inline-block h-5 w-5 mr-2" /> {texts[lang].noteSpacesAllowed}
          </p>
          <h3 className="text-md font-semibold mt-4">{texts[lang].allowedExamplesTitle}</h3>
          <ul className="flex-col ml-6">
            <li className="flex items-center">
              <CheckCircle2 className='mx-1 text-success' />
              <p className='font-light'>{texts[lang].allowedExample1}</p>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className='mx-1 text-success' />
              <p className='font-light'>{texts[lang].allowedExample2}</p>
            </li>
          </ul>
          <h3 className="text-md font-semibold mt-4">{texts[lang].notAllowedExamplesTitle}</h3>
          <ul className="flex-col ml-6">
            <li className="flex items-center">
              <AlertCircleIcon className='mx-1 text-red-500' />
              <p className='font-light'>{texts[lang].notAllowedExample1}</p>
            </li>
            <li className="flex items-center">
              <AlertCircleIcon className='mx-1 text-red-500' />
              <p className='font-light'>{texts[lang].notAllowedExample2}</p>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default NameFormats;
