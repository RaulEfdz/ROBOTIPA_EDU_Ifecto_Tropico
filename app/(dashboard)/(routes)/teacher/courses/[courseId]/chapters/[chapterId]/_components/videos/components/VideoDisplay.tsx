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
  const isVimeo = /vimeo\.com/.test(videoUrl);
  const isFile = !isYouTube && !isMux && !isVimeo && videoUrl !== "";

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      return null;
    } catch {
      return null;
    }
  };

  const extractVimeoData = (
    url: string
  ): { id: string | null; hash: string | null } => {
    try {
      const u = new URL(url);
      const segments = u.pathname.split("/").filter(Boolean);
      const id = segments[0] || null;
      // hash can be path segment or searchParam 'h'
      const hash = segments[1] || u.searchParams.get("h");
      return { id, hash };
    } catch {
      return { id: null, hash: null };
    }
  };

  const muxPlaybackId = isMux
    ? videoUrl.match(/stream\.mux\.com\/([^.]+)\.m3u8/)?.[1] || ""
    : "";

  const finalYouTubeId = videoId || (isYouTube ? extractYouTubeId(videoUrl) || undefined : undefined);
  const { id: vimeoId, hash: vimeoHash } = extractVimeoData(videoUrl);

  return (
    <div
      className="
        relative mb-4 w-full aspect-video 
        overflow-hidden rounded-md border 
        bg-slate-100 dark:bg-gray-800
      "
    >
      {isYouTube && finalYouTubeId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${finalYouTubeId}`}
          title="YouTube video preview"
          allowFullScreen
        />
      ) : isVimeo && vimeoId ? (
        <div className="absolute inset-0 w-full h-full">
          <div className="relative w-full h-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}${
                vimeoHash ? `?h=${vimeoHash}` : ""
              }`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
            />
          </div>
        </div>
      ) : isMux && muxPlaybackId ? (
        <MuxPlayer
          playbackId={muxPlaybackId}
          className="absolute inset-0 w-full h-full"
          metadata={{
            video_id: muxPlaybackId,
            video_title: "Mux Video",
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
