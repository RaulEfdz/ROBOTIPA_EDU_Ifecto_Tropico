import MuxPlayer from "@mux/mux-player-react";
import { Video } from "lucide-react";

interface VideoDisplayProps {
  videoUrl: string;
  videoId?: string | null;
  noVideoText: string;
  userId?: string;
}

export const VideoDisplay = ({
  videoUrl,
  videoId,
  noVideoText, 
  userId,
}: VideoDisplayProps) => {
  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);
  const isMux = /stream\.mux\.com/.test(videoUrl);
  const isFile = !isYouTube && !isMux && videoUrl !== "";

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.slice(1);
      }
      if (u.hostname.includes("youtube.com")) {
        return u.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  const muxPlaybackId = isMux
    ? videoUrl.match(/stream\.mux\.com\/([^.]+)\.m3u8/)?.[1] || ""
    : "";

  const finalVideoId = videoId || (isYouTube ? extractYouTubeId(videoUrl) : null);

  return (
    <div
      className="
        relative mb-4 w-full aspect-video 
        overflow-hidden rounded-md border 
        bg-slate-100 dark:bg-gray-800
      "
    >
      {isYouTube && finalVideoId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${finalVideoId}`}
          title="YouTube video preview"
          allowFullScreen
        />
      ) : isMux && muxPlaybackId ? (
        <MuxPlayer
          playbackId={muxPlaybackId}
          className="absolute inset-0 w-full h-full"
          metadata={{
            video_id: muxPlaybackId,
            video_title: "Video Mux",
            viewer_user_id: userId || "anonymous",
          }}
        />
      ) : isFile ? (
        <video controls className="absolute inset-0 w-full h-full object-cover">
          <source src={videoUrl} />
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
          <Video className="h-10 w-10 mb-2" />
          <span className="text-sm">{noVideoText}</span>
        </div>
      )}
    </div>
  );
};
