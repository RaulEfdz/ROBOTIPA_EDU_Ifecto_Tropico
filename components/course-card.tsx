import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";
import { Badge } from "./ui/badge";
import { useState } from "react";
import LoaderWait from "./ui/Loader";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  isPublished?: boolean;
  setLoading(value: boolean): void;
};

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  isPublished,
  setLoading
}: CourseCardProps) => {

  return isPublished ? (
    <Link href={`/courses/${id}`} onClick={() => setLoading(true)}>
      <div className="group hover:shadow-sm transition overflow-hidden hover  h-full bg-[#FFFCF8]">
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            fill
            className="object-cover"
            alt={title}
            src={imageUrl}
          />
        </div>
        <div className="flex flex-col pt-3 p-3">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">
            {category}
          </p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Capitulo" : "Capitulos"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <p className="text-md md:text-sm font-medium text-slate-700">
              {/* {formatPrice(price)} */}

            </p>
          )}
        </div>
      </div>
    </Link>
  ) : (
    <div className="group transition overflow-hidden   bg-[#FFFCF8]">
      <div className="relative w-full aspect-video overflow-hidden">
        <Image fill className="object-cover opacity-25" alt={title} src={imageUrl} />
      </div>

      <div className="flex flex-col pt-3 p-3 opacity-25">
        <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
          {title}
        </div>
        <p className="text-xs text-muted-foreground">
          {category}
        </p>
      </div>

      <Badge className="mt-3 bg-[#FFFCF8]-2 text-black">Deshabilitado</Badge>
    </div>
  )


}