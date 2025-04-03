"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import NameFormats from "./nameFommats";
import FileSizeTable from "./FilesSizeTable";
import { AttachmentForm } from "./inputs/attachment-form";

interface ResourceSectionProps {
  course: any;
  lang: "es" | "en";
}

const ResourceSection: React.FC<ResourceSectionProps> = ({ course, lang }) => {
  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-x-3 mb-4">
        <IconBadge icon={File} />
      
      </div>
      <div className="space-y-6">
        <AttachmentForm initialData={course} courseId={course.id} lang={lang} />
        <NameFormats lang={lang} />
        <FileSizeTable lang={lang} />
      </div>
    </div>
  );
};

export default ResourceSection;
