// ✅ components/dev/DevPaymentControls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Bug, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  courseId: string;
  onEnrollSuccess: () => void;
  onUnenrollSuccess: () => void;
}

export default function DevPaymentControls({
  courseId,
  onEnrollSuccess,
  onUnenrollSuccess,
}: Props) {
  const handleDevEnroll = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Inscripción simulada completada.");
        onEnrollSuccess();
      } else {
        toast.error(data.error || "No se pudo simular la inscripción.");
      }
    } catch (err) {
      toast.error("Error al simular la inscripción.");
    }
  };

  const handleDevUnenroll = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/unenroll`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Desinscripción simulada completada.");
        onUnenrollSuccess();
      } else {
        toast.error(data.error || "No se pudo desinscribir.");
      }
    } catch (err) {
      toast.error("Error al desinscribir.");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        onClick={handleDevEnroll}
        variant="ghost"
        size="icon"
        title="Simular inscripción (solo dev)"
      >
        <Bug className="w-4 h-4 text-orange-500" />
      </Button>
      <Button
        onClick={handleDevUnenroll}
        variant="ghost"
        size="icon"
        title="Simular desinscripción (solo dev)"
      >
        <XCircle className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
