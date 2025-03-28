import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import NameFormats from "./nameFommats";
import FileSizeTable from "./FilesSizeTable";
import { AttachmentForm } from "./attachment-form";


interface ResourceSectionProps {
  course: any;
  lang: "es" | "en";
}

const texts = {
  es: {
    resourcesAndAttachments: "Recursos y archivos adjuntos",
  },
  en: {
    resourcesAndAttachments: "Resources and Attachments",
  },
};

const ResourceSection: React.FC<ResourceSectionProps> = ({ course, lang }) => {
  return (
    <Card className="shadow-lg border rounded-lg mt-4">
      <CardHeader className="flex items-center gap-x-2">
        <IconBadge icon={File} />
        <CardTitle className="text-xl">{texts[lang].resourcesAndAttachments}</CardTitle>
      </CardHeader>
      <CardContent>
        <AttachmentForm initialData={course} courseId={course.id} />
        <NameFormats />
        <FileSizeTable />
      </CardContent>
    </Card>
  );
};

export default ResourceSection;
