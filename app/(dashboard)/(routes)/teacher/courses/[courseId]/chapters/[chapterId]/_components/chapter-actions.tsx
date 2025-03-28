"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { fetchData } from "../../../../custom/fetchData";
import { getColors } from "@/tools/handlerColors";
import { FcLinux, FcNext, FcOk } from "react-icons/fc";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
};

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        // await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/unpublish`);
        const path = `/api/courses/${courseId}/chapters/${chapterId}/unpublish`
        const callback = () => {
          toast.success("Capitulo creado, no publicado");
          router.refresh();
        }
        fetchData({ path, callback, method: 'PUT' })
      } else {
        // await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/publish`);
        const path = `/api/courses/${courseId}/chapters/${chapterId}/publish`
        const callback = () => {
          toast.success("Capitulo publicado")
          router.refresh();
        }
        fetchData({ path, callback, method: 'PUT' })
      }

      router.refresh();
    } catch {
      toast.error("Ocurrio un error");
    } finally {
      setIsLoading(false);
    }
  }

  const onDelete = async () => {
    try {
      setIsLoading(true);

      // await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
      const path = `/api/courses/${courseId}/chapters/${chapterId}`
      const callback = () => {
        toast.success("Capitulo eliminado");
        router.refresh();
        router.push(`/teacher/courses/${courseId}`);
      }
      fetchData({path, callback, method: 'DELETE'})

     
    } catch {
      toast.error("Ocurrrio un error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant =  {isPublished ?   'default':'ghost'}
        size="sm"
        
      >
        {isPublished ? "Publicado" : "Sin Publicar"}
        {isPublished?  <FcOk/>: <FcNext/> }
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  )
}