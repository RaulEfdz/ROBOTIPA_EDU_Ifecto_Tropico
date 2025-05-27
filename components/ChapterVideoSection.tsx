import React from "react";

interface ChapterVideoSectionProps {
  videoUrl?: string;
  playbackId?: string;
  courseImageUrl?: string;
  isLocked?: boolean;
}

const ChapterVideoSection: React.FC<ChapterVideoSectionProps> = ({
  videoUrl,
  playbackId,
  courseImageUrl,
  isLocked = false,
}) => {
  if (isLocked) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-200 dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-300">Contenido bloqueado</p>
      </div>
    );
  }

  if (videoUrl) {
    return (
      <video
        controls
        src={videoUrl}
        className="w-full max-h-96 rounded-md"
        poster={courseImageUrl}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (playbackId) {
    // Example for Mux playback embed, adjust as needed
    return (
      <div className="w-full max-h-96 rounded-md">
        <iframe
          src={`https://stream.mux.com/${playbackId}.m3u8`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-96 rounded-md"
          title="Video Playback"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-md">
      <p className="text-gray-400 dark:text-gray-500">
        No hay video disponible
      </p>
    </div>
  );
};

export default ChapterVideoSection;
