"use client";

import React from "react";

interface ChapterVideoSectionProps {
  videoUrl?: string;
  playbackId?: string;
  courseImageUrl?: string;
  isLocked: boolean;
}

const ChapterVideoSection: React.FC<ChapterVideoSectionProps> = ({
  videoUrl,
  playbackId,
  courseImageUrl,
  isLocked,
}) => {
  if (isLocked) {
    return <div className="p-4 text-center text-gray-500">Video bloqueado</div>;
  }

  if (playbackId) {
    // Render Mux player or similar here
    return (
      <video
        controls
        className="w-full max-h-96 rounded-md bg-black"
        src={`https://stream.mux.com/${playbackId}.m3u8`}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (videoUrl) {
    return (
      <video
        controls
        className="w-full max-h-96 rounded-md bg-black"
        src={videoUrl}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (courseImageUrl) {
    return (
      <img
        src={courseImageUrl}
        alt="Course fallback"
        className="w-full max-h-96 object-contain rounded-md"
      />
    );
  }

  return (
    <div className="p-4 text-center text-gray-500">No hay video disponible</div>
  );
};

export default ChapterVideoSection;
