"use client";

import React from "react";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { validateURLVideo } from "./customs/validateURLVideo";
import { VideoPlayer } from "./video-player";

export interface ChapterVideoSectionProps {
  videoUrl: string;
  courseImageUrl: string;
  altText: string;
  isLocked: boolean;
  playbackId?: string;
  chapterId: string;
  courseId: string;
  nextChapterId?: string;
  completeOnEnd: boolean;
}

const ChapterVideoSection: React.FC<ChapterVideoSectionProps> = ({
  videoUrl,
  courseImageUrl,
  altText,
  isLocked,
  playbackId = "",
  chapterId,
  courseId,
  nextChapterId,
  completeOnEnd,
}) => {
  const hasValidVideo = validateURLVideo(videoUrl);

  return (
    <div className="bg-TextCustom rounded-xl shadow-lg overflow-hidden mb-6 border border-slate-200">
      {hasValidVideo ? (
        <VideoPlayer
          chapterId={chapterId}
          courseId={courseId}
          nextChapterId={nextChapterId}
          playbackId={playbackId}
          isLocked={isLocked}
          completeOnEnd={completeOnEnd}
          videoUrl={videoUrl}
        />
      ) : (
        <div className="w-full aspect-video relative bg-slate-100">
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-sm">
              <Lock className="h-14 w-14 mb-3 text-TextCustom opacity-80" />
              <h3 className="text-xl font-medium mb-2 text-TextCustom">
                Contenido bloqueado
              </h3>
              <p className="text-slate-200 max-w-xs text-center mb-4">
                Inscríbete en este curso para acceder a todo el contenido
              </p>
            </div>
          )}
          <Image
            src={courseImageUrl || "/placeholder.jpg"}
            alt={altText}
            fill
            className={`object-cover ${isLocked ? "opacity-40 blur-sm" : ""}`}
          />
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-TextCustom/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                <Play className="h-16 w-16 text-primary-600" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterVideoSection;
