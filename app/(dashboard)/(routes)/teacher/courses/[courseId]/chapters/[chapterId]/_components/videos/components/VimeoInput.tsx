import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VimeoInputProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  validateUrl: (url: string) => boolean;
  onBack: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  placeholder: string;
  invalidFormatText: string;
  errorText: string | null;
  backText: string;
  saveText: string;
}

export const VimeoInput = ({
  videoUrl,
  setVideoUrl,
  validateUrl,
  onBack,
  onSubmit,
  isSaving,
  placeholder,
  invalidFormatText,
  errorText,
  backText,
  saveText
}: VimeoInputProps) => {
  const [touched, setTouched] = useState(false);
  const isInvalid = touched && !validateUrl(videoUrl);

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={isSaving}
      />
      {isInvalid && (
        <p className="text-red-500 text-sm">{invalidFormatText}</p>
      )}
      {errorText && (
        <p className="text-red-500 text-sm">{errorText}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={onBack} variant="ghost">
          {backText}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!validateUrl(videoUrl) || isSaving}
        >
          {saveText}
        </Button>
      </div>
    </div>
  );
};
