// File: components/ExamTabs.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileQuestion, Settings, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ExamQuestionsTab from "../tabs/ExamQuestionsTab";
import AttemptsTab from "./AttemptsTab";
import { AttemptsData, Exam } from "../utils/examApi";
import ExamDetailsForm from "../tabs/ExamDetailsForm";

export type ExamFormData = {
  title: string;
  description?: string;
  duration: number;
  isPublished: boolean;
  passingScore?: number;
};

interface Props {
  exam: Exam;
  attemptsData: AttemptsData;
  onAddQuestion: () => void;
  onPublishChange: (checked: boolean) => void;
  isSubmitting: boolean;
  isDirty: boolean;
  onSubmit: () => void;
}

export default function ExamTabs({
  exam,
  attemptsData,
  onAddQuestion,
  onPublishChange,
  isSubmitting,
  isDirty,
  onSubmit,
}: Props) {
  return (
    <>
      <Separator />

      <Tabs defaultValue="preguntas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preguntas">
            <FileQuestion className="w-4 h-4 mr-1" />
            Preguntas
          </TabsTrigger>
          <TabsTrigger value="detalles">
            <Settings className="w-4 h-4 mr-1" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="intentos">
            <Users className="w-4 h-4 mr-1" />
            Intentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preguntas">
          <ExamQuestionsTab
            questions={exam.questions}
            examId={exam.id}
            onQuestionsChange={() => {}}
            onOpenAddModal={onAddQuestion}
          />
        </TabsContent>

        <TabsContent value="detalles">
          <ExamDetailsForm
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            onSubmit={onSubmit}
            isPublished={!!exam.isPublished}
            handlePublishChange={onPublishChange}
          />
        </TabsContent>

        <TabsContent value="intentos">
          <AttemptsTab exam={exam} attemptsData={attemptsData} />
        </TabsContent>
      </Tabs>
    </>
  );
}
