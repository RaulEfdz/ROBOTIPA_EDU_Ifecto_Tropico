"use client";

import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
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
  EyeOff 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
}: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setChapters(items || []);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const itemsCopy = Array.from(chapters);
    const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updatedChapters = itemsCopy.slice(startIndex, endIndex + 1);

    setChapters(itemsCopy);

    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: itemsCopy.findIndex((item) => item.id === chapter.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {chapters.map((chapter, index) => {
              if (!chapter || !chapter.id) return null;

              return (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className={cn(
                        "flex items-center gap-x-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow",
                        chapter.isPublished && "border-l-4 border-l-green-500"
                      )}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className={cn(
                          "px-2 py-3 hover:bg-gray-100 rounded-l-lg transition flex items-center justify-center",
                          chapter.isPublished && "rounded-l-none"
                        )}
                        {...provided.dragHandleProps}
                      >
                        <Grip className="h-5 w-5 text-gray-500" />
                      </div>
                      
                      <div className="flex-grow py-3 font-medium">
                        {chapter.title}
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
                          onClick={() => onEdit(chapter.id)}
                          className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
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
  );
};