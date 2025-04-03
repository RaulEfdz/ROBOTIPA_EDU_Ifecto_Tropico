"use client";

import {
  Type,
  Undo2,
  AlignVerticalSpaceAround,
  Text,
  ArrowDownAZ,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

type Tool = {
  icon: JSX.Element;
  action: () => void;
  description: string;
  key: string;
};

const TOOL_CONFIG: Record<string, boolean> = {
  uppercase: true,
  lowercase: true,
  capitalize: true,
  trimSpaces: true,
  reset: true,
};

export const TitleToolsNav = () => {
  const form = useFormContext();
  const [original, setOriginal] = useState("");
  const hasStoredOriginal = useRef(false);

  // Guarda el valor original solo una vez
  useEffect(() => {
    if (!hasStoredOriginal.current) {
      const current = form.getValues("title");
      setOriginal(current);
      hasStoredOriginal.current = true;
    }
  }, [form]);

  const tools: Tool[] = [
    {
      key: "uppercase",
      icon: <Type className="h-4 w-4" />,
      action: () => {
        const value = form.getValues("title");
        form.setValue("title", value.toUpperCase(), { shouldDirty: true });
      },
      description: "Transformar a MAYÚSCULAS",
    },
    {
      key: "lowercase",
      icon: <ArrowDownAZ className="h-4 w-4" />,
      action: () => {
        const value = form.getValues("title");
        form.setValue("title", value.toLowerCase(), { shouldDirty: true });
      },
      description: "Transformar a minúsculas",
    },
    {
      key: "capitalize",
      icon: <Text className="h-4 w-4" />,
      action: () => {
        const value = form.getValues("title");
        const capitalized = value
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase());
        form.setValue("title", capitalized, { shouldDirty: true });
      },
      description: "Capitalizar cada palabra",
    },
    {
      key: "trimSpaces",
      icon: <AlignVerticalSpaceAround className="h-4 w-4" />,
      action: () => {
        const value = form.getValues("title");
        const trimmed = value.trim().replace(/\s+/g, " ");
        form.setValue("title", trimmed, { shouldDirty: true });
      },
      description: "Eliminar espacios extra",
    },
    {
      key: "reset",
      icon: <Undo2 className="h-4 w-4" />,
      action: () => {
        form.setValue("title", original, { shouldDirty: true });
      },
      description: "Restaurar original",
    },
  ];

  const activeTools = tools.filter((tool) => TOOL_CONFIG[tool.key]);

  return (
    <div className="flex justify-end gap-2 mb-3">
      <TooltipProvider>
        {activeTools.map((tool) => (
          <Tooltip key={tool.key}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={tool.action}
                className="text-gray-600 dark:text-gray-300"
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tool.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};
