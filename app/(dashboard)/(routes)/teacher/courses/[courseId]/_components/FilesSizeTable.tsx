import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Textos en español e inglés
const texts = {
  es: {
    caption: "Lista de tamaños máximos.",
    typeHeader: "Tipo",
    maxSizeHeader: "Tamaño Máximo",
    accordionTitle: "¿Tamaños permitidos?",
  },
  en: {
    caption: "Maximum size list.",
    typeHeader: "Type",
    maxSizeHeader: "Max Size",
    accordionTitle: "Allowed sizes?",
  },
};

// Tipos de archivo y configuraciones de tamaño
type FileType = {
  maxFileSize: string;
  displayName: string;
};

const fileConfig: Record<string, FileType> = {
  "text": { maxFileSize: "2MB", displayName: "Text" },
  "image": { maxFileSize: "16MB", displayName: "Image" },
  "application/vnd.ms-powerpoint": { maxFileSize: "16MB", displayName: "PowerPoint" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "16MB", displayName: "PowerPoint (OpenXML)" },
  "application/vnd.ms-excel": { maxFileSize: "16MB", displayName: "Excel" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB", displayName: "Excel (OpenXML)" },
  "application/msword": { maxFileSize: "16MB", displayName: "Word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", displayName: "Word (OpenXML)" },
  "audio": { maxFileSize: "16MB", displayName: "Audio" },
  "pdf": { maxFileSize: "16MB", displayName: "PDF" },
  "application/json": { maxFileSize: "16MB", displayName: "JSON" },
};

// Definición de las propiedades del componente con idioma opcional
interface FileSizeTableProps {
  lang?: "es" | "en";
}

// Componente para renderizar la tabla de contenido
const TableContent: React.FC<{ lang: "es" | "en" }> = ({ lang }) => (
  <Card className="shadow-lg border rounded-md">
    <CardHeader>
      <CardTitle>{texts[lang].caption}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableCaption>{texts[lang].caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left font-semibold">{texts[lang].typeHeader}</TableHead>
            <TableHead className="text-right dark:text-white font-semibold">{texts[lang].maxSizeHeader}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(fileConfig).map(([type, { maxFileSize, displayName }]) => (
            <TableRow key={type}>
              <TableCell className="font-medium">
                <Badge variant="outline" className="bg-gray-100 text-gray-900">
                  {displayName}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{maxFileSize}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const FileSizeTable: React.FC<FileSizeTableProps> = ({ lang = "es" }) => (
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger className="font-semibold text-sky-700">
        {texts[lang].accordionTitle}
      </AccordionTrigger>
      <AccordionContent>
        <div className="mt-4">
          <TableContent lang={lang} />
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default FileSizeTable;
