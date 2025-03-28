"use client";

import React from "react";
import { FilesIcon, CopyIcon, FileBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formmatedFile } from "@/tools/formmatedFile";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { removeUnderscores } from "@/tools/removeUnderscores";
import { Label } from "@/components/ui/label";
import { formatText } from "@/utils/formatTextMS";

const texts = {
  es: {
    resourcesForChapter: "Recursos para este capítulo",
    copiedMessage: "¡copiado!",
    openResources: "Abrir recursos",
  },
  en: {
    resourcesForChapter: "Resources for this chapter",
    copiedMessage: "copied!",
    openResources: "Open resources",
  },
};

interface HandlerChecksItem {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
}

interface ResourceSidebarProps {
  items: HandlerChecksItem[];
  onInsertReference: (reference: string) => void;
  lang: "es" | "en";
}

const ResourceSidebar: React.FC<ResourceSidebarProps> = ({
  items,
  onInsertReference,
  lang,
}) => {
  const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));

  const formatTitle = (id: string) => id.replace(/ /g, "_");

  return (
    <div className="p-4">
      <Sheet>
        <SheetTrigger>
          <Button
            className="bg-[#386329] flex items-center gap-2 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300 shadow-md transition duration-200"
            aria-label={texts[lang].openResources}
          >
            <FileBox className="w-5 h-5" />
            {texts[lang].openResources}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-x-2">
              <FilesIcon />
              {texts[lang].resourcesForChapter}
            </SheetTitle>
            <SheetDescription>
              <div className="mt-4">
                <ul className="space-y-2 max-h-[600px] overflow-y-auto w-full">
                  {sortedItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
                    >
                      <Label className="block truncate text-sm font-medium">
                        {removeUnderscores(formatText(item.name))}
                      </Label>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const formattedId = `@[Resource_${
                              formatText(item.name)
                            }_&!${formatTitle(formmatedFile(item.id))}]`;
                            const richText = `
                                <b style="color:blue; margin-block: 2vh; font-weight:bold;">
                                  <i>${formattedId}</i>
                                </b>
                              `;

                            // Copiar al portapapeles como HTML
                            navigator.clipboard.write([
                              new ClipboardItem({
                                "text/html": new Blob([richText], {
                                  type: "text/html",
                                }),
                              }),
                            ]);

                            toast.success(
                              `${texts[lang].copiedMessage}: ${formattedId}`
                            );
                          }}
                        >
                          <CopyIcon />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ResourceSidebar;
