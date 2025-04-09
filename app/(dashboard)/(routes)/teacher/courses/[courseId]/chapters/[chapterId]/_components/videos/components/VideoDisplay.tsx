import MuxPlayer from '@mux/mux-player-react';
import { Video } from 'lucide-react';

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
  const isFile = !isYouTube && !isMux && videoUrl !== '';

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v');
      }
      return null;
    } catch {
      return null;
    }
  };

  const muxPlaybackId = isMux
    ? videoUrl.match(/stream\.mux\.com\/([^.]+)\.m3u8/)?.[1] || ''
    : '';

  const finalVideoId = videoId || (isYouTube ? extractYouTubeId(videoUrl) : null);

  return (
    <div className="relative mb-4 h-[280px] rounded-md overflow-hidden border bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
      {isYouTube && finalVideoId ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${finalVideoId}`}
          title="YouTube video preview"
          className="rounded-md"
          allowFullScreen
        />
      ) : isMux && muxPlaybackId ? (
        <MuxPlayer
          playbackId={muxPlaybackId}
          className="w-full h-full rounded-md"
          metadata={{
            video_id: muxPlaybackId,
            video_title: 'Video Mux',
            viewer_user_id: userId || 'anonymous',
          }}
        />
      ) : isFile ? (
        <video controls className="w-full h-full object-cover rounded-md">
          <source src={videoUrl} />
        </video>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500">
          <Video className="h-10 w-10 mb-2" />
          <span className="text-sm">{noVideoText}</span>
        </div>
      )}
    </div>
  );
};
