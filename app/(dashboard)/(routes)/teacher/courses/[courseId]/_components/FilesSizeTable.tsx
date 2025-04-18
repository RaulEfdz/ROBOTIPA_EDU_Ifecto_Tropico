"use client";

import React from "react";
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

const texts = {
  es: {
    caption: "Lista de tamaños máximos",
    typeHeader: "Tipo",
    maxSizeHeader: "Tamaño máximo",
    accordionTitle: "Tamaños permitidos",
  },
  en: {
    caption: "Maximum size list",
    typeHeader: "Type",
    maxSizeHeader: "Max size",
    accordionTitle: "Allowed sizes",
  },
};

type FileType = {
  maxFileSize: string;
  displayName: string;
};

const fileConfig: Record<string, FileType> = {
  text: { maxFileSize: "2MB", displayName: "Text" },
  image: { maxFileSize: "16MB", displayName: "Image" },
  "application/vnd.ms-powerpoint": {
    maxFileSize: "16MB",
    displayName: "PowerPoint",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    maxFileSize: "16MB",
    displayName: "PowerPoint (OpenXML)",
  },
  "application/vnd.ms-excel": {
    maxFileSize: "16MB",
    displayName: "Excel",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    maxFileSize: "16MB",
    displayName: "Excel (OpenXML)",
  },
  "application/msword": {
    maxFileSize: "16MB",
    displayName: "Word",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    maxFileSize: "16MB",
    displayName: "Word (OpenXML)",
  },
  audio: { maxFileSize: "16MB", displayName: "Audio" },
  pdf: { maxFileSize: "16MB", displayName: "PDF" },
  "application/json": {
    maxFileSize: "16MB",
    displayName: "JSON",
  },
};

interface FileSizeTableProps {
  lang?: "es" | "en";
}

const TableContent: React.FC<{ lang: "es" | "en" }> = ({ lang }) => {
  const t = texts[lang];

  return (
    <Card className="bg-TextCustom dark:bg-gray-850 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-gray-800 dark:text-TextCustom">
          {t.caption}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="text-xs text-muted-foreground">{t.caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left text-gray-700 dark:text-gray-300 font-medium">
                {t.typeHeader}
              </TableHead>
              <TableHead className="text-right text-gray-700 dark:text-gray-300 font-medium">
                {t.maxSizeHeader}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(fileConfig).map(([type, { maxFileSize, displayName }]) => (
              <TableRow key={type}>
                <TableCell className="text-sm">
                  <Badge
                    variant="outline"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-TextCustom rounded-md"
                  >
                    {displayName}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-right text-gray-600 dark:text-gray-300">
                  {maxFileSize}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const FileSizeTable: React.FC<FileSizeTableProps> = ({ lang = "es" }) => {
  const t = texts[lang];

  return (
    <div className="mt-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="file-sizes">
          <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:no-underline">
            {t.accordionTitle}
          </AccordionTrigger>
          <AccordionContent>
            <TableContent lang={lang} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FileSizeTable;
