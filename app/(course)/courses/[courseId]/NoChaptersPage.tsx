"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const NoChaptersPage = () => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Alert className="max-w-md mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Curso sin contenido</AlertTitle>
        <AlertDescription>
          Este curso aún no tiene capítulos publicados. Por favor, vuelve más tarde.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NoChaptersPage;
