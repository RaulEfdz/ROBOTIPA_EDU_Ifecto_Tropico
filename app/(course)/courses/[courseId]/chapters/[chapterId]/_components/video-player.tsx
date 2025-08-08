"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import MuxPlayer from "@mux/mux-player-react";
import { Video as VideoIcon, Lock, Maximize, Volume2 } from "lucide-react";
import { useState, useRef } from "react";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  completeOnEnd?: boolean;
  playbackId?: string;
  videoUrl?: string;
  isLocked?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  courseId,
  chapterId,
  nextChapterId,
  completeOnEnd = false,
  playbackId,
  videoUrl = "",
  isLocked = false,
}) => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detectores de origen
  const isYouTube = /youtu\.be\/|youtube\.com\/(watch|embed)/.test(videoUrl);
  const isVimeo   = /vimeo\.com\/(?:video\/)?\d+/.test(videoUrl);
  const isMux     = Boolean(playbackId);

  const extractVimeoId = (url: string): string | null => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  };

  const handleProgress = async () => {
    if (!completeOnEnd) return;
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: true }),
        }
      );
      if (!res.ok) throw new Error();

      toast.success("Progreso actualizado");
      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }
      router.refresh();
    } catch {
      toast.error("Ocurrió un error al guardar el progreso");
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Container principal responsive */}
      <div 
        ref={containerRef}
        className={`
          relative w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700
          ${isFullscreen ? 'aspect-auto h-screen' : 'aspect-video max-h-[80vh]'}
        `}
      >
        {/* Video container con mejor responsive */}
        <div className={`
          absolute inset-0 w-full h-full
          ${isLocked ? 'filter blur-sm pointer-events-none' : ''}
        `}>
          {isYouTube && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={
                `https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get('v')}?rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&color=white&theme=dark`
              }
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                objectFit: 'contain'
              }}
            />
          )}

          {isVimeo && (() => {
            const id = extractVimeoId(videoUrl);
            return id ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://player.vimeo.com/video/${id}?responsive=1&dnt=1&quality=auto&background=0`}
                title="Vimeo video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  objectFit: 'contain'
                }}
              />
            ) : null;
          })()}

          {isMux && playbackId && (
            <MuxPlayer
              playbackId={playbackId}
              className="absolute inset-0 w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              metadata={{ 
                video_id: playbackId, 
                viewer_user_id: 'anonymous' 
              }}
              streamType="on-demand"
              primaryColor="#FFFFFF"
              secondaryColor="#000000"
              onEnded={handleProgress}
            />
          )}

          {!isYouTube && !isVimeo && !isMux && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-900">
              <VideoIcon className="h-16 w-16 mb-4 text-gray-500" />
              <span className="text-lg font-medium mb-2">No se pudo cargar el video</span>
              <span className="text-sm text-gray-600">Verifica la URL del contenido</span>
            </div>
          )}
        </div>

        {/* Controls overlay */}
        {!isLocked && (isYouTube || isVimeo || isMux) && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 opacity-0 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/60 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-white animate-pulse" />
              <span className="text-white text-sm">Cargando video...</span>
            </div>
          </div>
        </div>

        {/* Overlay de bloqueo mejorado */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-gray-900/90 p-8 rounded-2xl border border-gray-600 max-w-md mx-4 text-center backdrop-blur-sm">
              <Lock className="h-12 w-12 text-yellow-500 mb-4 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Contenido Premium
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Este contenido está disponible solo para miembros premium. 
                Desbloquea acceso completo al curso.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105">
                Obtener Acceso Premium
              </button>
            </div>
          </div>
        )}

        {/* Gradient overlay para mejor contraste */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Video info bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {(isYouTube || isVimeo || isMux) && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Video disponible</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Resolución: Auto</span>
          {!isLocked && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Acceso completo
            </span>
          )}
        </div>
      </div>
    </div>
  );
};