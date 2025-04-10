'use client'
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "./ui/badge";
import QuizModalResponse from "./modalViewer/QuizModalResponse";
import PdfViewer from "./PdfViewer";

interface ModalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  type: "quiz" | "resource";
}

const ModalViewer: React.FC<ModalViewerProps> = ({ isOpen, onClose, id, type }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4 sm:p-6 md:p-8 w-full max-w-screen-lg h-[90vh] sm:h-[95vh]">
      {type === "quiz" && <DialogHeader>
          <DialogTitle>
            <Badge className="bg-blue-300 text-white text-sm sm:text-base h-[5vh]">
              {type === "quiz" ? "Quiz" : "Recurso"}
            </Badge>
          </DialogTitle>
        </DialogHeader>}
        <div className="h-[100%]">
          {type === "quiz" ? <QuizModalResponse id={id} onClose={onClose} /> : <PdfViewer pdfNameId ={id}/>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewer;
