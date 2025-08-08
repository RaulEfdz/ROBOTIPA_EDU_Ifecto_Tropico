"use client";

import React from "react";
import Image from "next/image";
import { Lock, Play, Video, Star } from "lucide-react";
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
    <div className="w-full">
      {/* Header con información del video */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contenido del capítulo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasValidVideo ? "Video interactivo" : "Contenido multimedia"}
            </p>
          </div>
        </div>
        {!isLocked && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Premium
            </span>
          </div>
        )}
      </div>

      {/* Container principal del video */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {hasValidVideo ? (
          /* Video Player Mejorado */
          <div className="p-2">
            <VideoPlayer
              chapterId={chapterId}
              courseId={courseId}
              nextChapterId={nextChapterId}
              playbackId={playbackId}
              isLocked={isLocked}
              completeOnEnd={completeOnEnd}
              videoUrl={videoUrl}
            />
          </div>
        ) : (
          /* Placeholder mejorado cuando no hay video */
          <div className="relative">
            {/* Container con aspect ratio dinámico */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {/* Imagen de fondo */}
              <Image
                src={courseImageUrl || "/placeholder.jpg"}
                alt={altText}
                fill
                className={`object-cover transition-all duration-300 ${
                  isLocked ? "opacity-30 blur-sm scale-105" : "opacity-80"
                }`}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              {/* Contenido central */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLocked ? (
                  /* Estado bloqueado */
                  <div className="text-center max-w-sm mx-4">
                    <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-gray-600">
                      <Lock className="h-16 w-16 mb-4 text-yellow-500 mx-auto animate-bounce" />
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Contenido Bloqueado
                      </h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        Adquiere acceso premium para desbloquear este contenido exclusivo
                      </p>
                      <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Desbloquear Ahora
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Estado desbloqueado */
                  <div className="text-center">
                    <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-gray-600 shadow-2xl">
                      <Play className="h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Contenido Listo
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Material de aprendizaje disponible
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">
                      {isLocked ? "Premium" : "Disponible"}
                    </span>
                  </div>
                  {!isLocked && (
                    <div className="bg-green-500/20 backdrop-blur-sm p-2 rounded-full">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              hasValidVideo && !isLocked ? 'bg-green-500' : 
              isLocked ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <span>
              {hasValidVideo && !isLocked ? 'Video cargado' :
               isLocked ? 'Contenido premium' : 'Contenido disponible'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Calidad: HD</span>
          <span>Formato: Responsive</span>
        </div>
      </div>
    </div>
  );
};

export default ChapterVideoSection;