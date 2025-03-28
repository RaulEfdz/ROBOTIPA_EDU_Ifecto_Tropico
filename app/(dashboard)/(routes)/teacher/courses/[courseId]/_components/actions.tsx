"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { fetchData } from "../../custom/fetchData";
import { FcNext, FcOk } from "react-icons/fc";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
};

export const Actions = ({
  disabled,
  courseId,
  isPublished
}: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        // await axios.patch(`/api/courses/${courseId}/unpublish`);
        const path = `/api/courses/${courseId}/unpublish`
        const callback = () => {
          toast.success("Course unpublished");
          router.refresh();
        }
        fetchData({ values:{courseId} ,path, callback, method: 'POST' })
      } else {
        // await axios.patch(`/api/courses/${courseId}/publish`);
        const path = `/api/courses/${courseId}/publish`
        const callback = () => {
          toast.success("Curso publicado");
          confetti.onOpen();
          router.refresh();

        }
        fetchData({ values:{courseId} ,path, callback, method: 'POST' })


      }

      // router.refresh();
    } catch {
      toast.error("Ocurrio un error");
    } finally {
      setIsLoading(false);
    }
  }

  const onDelete = async () => {
    try {
      setIsLoading(true);

      // await axios.delete(`/api/courses/${courseId}`);

      const path = (`/api/courses/${courseId}/delete`)
      const callback = () => {
        toast.success("Curso eliminado");
        router.refresh();
        router.push(`/teacher/courses`);
      }
      fetchData({values:{chapterId:courseId}, path, callback, method: 'POST' })

    } catch {
      toast.error("Ocurrio un error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        // disabled={disabled || isLoading}
        variant =  {isPublished ?   'default':'ghost'}
        size="sm"
      >
        {isPublished ? "Ocultar?" : "Publicar?"}
        {/* {isPublished?  <FcOk/>: <FcNext/> } */}
      </Button>

      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  )
}