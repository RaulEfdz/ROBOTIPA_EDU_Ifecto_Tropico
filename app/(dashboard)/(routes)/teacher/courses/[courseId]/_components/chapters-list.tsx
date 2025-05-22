"use client";

import { Chapter } from "@prisma/client";
import React, { useEffect, useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Grip,
  Pencil,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  ArrowRight, // Agregado
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
  isLoading?: boolean; // Nuevo prop para feedback visual
}

export const ChaptersList = React.memo(function ChaptersList({
  items,
  onReorder,
  onEdit,
  isLoading = false,
}: ChaptersListProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // Para edición inline (opcional)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items || []);
  }, [items]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const itemsCopy = Array.from(chapters);
      const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
      itemsCopy.splice(result.destination.index, 0, reorderedItem);
      const startIndex = Math.min(
        result.source.index,
        result.destination.index
      );
      const endIndex = Math.max(result.source.index, result.destination.index);
      const updatedChapters = itemsCopy.slice(startIndex, endIndex + 1);
      setChapters(itemsCopy);
      const bulkUpdateData = updatedChapters.map((chapter) => ({
        id: chapter.id,
        position: itemsCopy.findIndex((item) => item.id === chapter.id),
      }));
      onReorder(bulkUpdateData);
    },
    [chapters, onReorder]
  );

  // Edición inline (solo UI, lógica a implementar en el padre si se desea)
  const handleEditClick = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  };
  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };
  const handleEditSave = () => {
    // Aquí se podría llamar a una función de edición real
    setEditingId(null);
    setEditTitle("");
  };

  if (!isMounted) return null;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
              aria-label="Lista de capítulos"
            >
              {chapters.map((chapter, index) => {
                if (!chapter || !chapter.id) return null;
                const isEditing = editingId === chapter.id;
                return (
                  <Draggable
                    key={chapter.id}
                    draggableId={chapter.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className={cn(
                          "flex items-center gap-x-2 bg-TextCustom border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow relative",
                          chapter.isPublished &&
                            "border-l-4 border-l-green-500",
                          isEditing && "ring-2 ring-blue-400"
                        )}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        tabIndex={0}
                        aria-label={`Capítulo ${chapter.title}`}
                      >
                        <div
                          className={cn(
                            "px-2 py-3 hover:bg-gray-100 rounded-l-lg transition flex items-center justify-center cursor-move",
                            chapter.isPublished && "rounded-l-none"
                          )}
                          {...provided.dragHandleProps}
                          aria-label="Mover capítulo"
                        >
                          <Grip className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-grow py-3 font-medium">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-sm border-gray-300"
                                autoFocus
                              />
                              <button
                                onClick={handleEditSave}
                                className="p-1 rounded-full bg-green-100 hover:bg-green-200"
                                aria-label="Guardar título"
                              >
                                <Check className="w-4 h-4 text-green-700" />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                                aria-label="Cancelar edición"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            chapter.title
                          )}
                        </div>
                        <div className="pr-3 flex items-center gap-x-3">
                          {/* Status indicators */}
                          <div className="flex items-center">
                            {/* Free or Paid indicator */}
                            <div className="flex items-center mr-2">
                              {chapter.isFree ? (
                                <Badge className="bg-blue-100 text-green-700 hover:bg-green-200 flex items-center gap-1 px-2">
                                  <Unlock className="h-3 w-3" />
                                  <span>Gratis</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1 px-2">
                                  <Lock className="h-3 w-3" />
                                  <span>De pago</span>
                                </Badge>
                              )}
                            </div>
                            {/* Published or Hidden indicator */}
                            <div>
                              {chapter.isPublished ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1 px-2">
                                  <Eye className="h-3 w-3" />
                                  <span>Publicado</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1 px-2">
                                  <EyeOff className="h-3 w-3" />
                                  <span>Oculto</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                          {/* Edit button */}
                          <button
                            onClick={() => handleEditClick(chapter)}
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Editar título"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => onEdit(chapter.id)}
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 transition-colors"
                            aria-label="Editar detalles"
                          >
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});
