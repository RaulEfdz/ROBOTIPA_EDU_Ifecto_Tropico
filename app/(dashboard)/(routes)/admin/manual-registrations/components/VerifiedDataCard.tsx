/*
File: app/components/VerifiedDataCard.tsx
Description: Shows parsed user and course data with action to confirm.
*/
"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  User,
  BookOpen,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

// Assuming ParsedData is defined in the parent page or a shared types file
interface ParsedData {
  courseId: string;
  userId: string;
  date: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

interface VerifiedDataCardProps {
  data: ParsedData;
  onProceed: () => void;
}

export function VerifiedDataCard({ data, onProceed }: VerifiedDataCardProps) {
  return (
    <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle className="h-5 w-5" /> Datos Verificados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
          <strong>Usuario:</strong> {data.userName || data.userId}{" "}
          {data.userEmail && `(${data.userEmail})`}
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
          <strong>Curso:</strong> {data.courseTitle || data.courseId}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
          <strong>Fecha de Suscripción (Manual):</strong> {data.date}
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          onClick={onProceed}
        >
          Proceder con el Registro <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
