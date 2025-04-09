import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader2, ArrowLeft, Youtube, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface YouTubeInputProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  validateUrl: (url: string) => boolean;
  onBack: () => void;
  onSubmit: (url: string) => void;
  isSaving: boolean;
  invalidFormatText: string;
  backText: string;
  saveText: string;
  placeholder?: string;
  errorText?: string | null;
}

export const YouTubeInput = ({
  videoUrl,
  setVideoUrl,
  validateUrl,
  onBack,
  onSubmit,
  isSaving,
  invalidFormatText,
  backText,
  saveText,
  placeholder = "Ej: https://www.youtube.com/watch?v=...",
  errorText = null,
}: YouTubeInputProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const debouncedUrl = useDebounce(videoUrl, 300);

  // Extraer el ID del video de YouTube de la URL
  const extractVideoId = (url: string): string | null => {
    // Patrones para URLs de YouTube
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  useEffect(() => {
    if (!debouncedUrl.trim()) {
      setIsValid(null);
      setVideoId(null);
      return;
    }
    
    const valid = validateUrl(debouncedUrl);
    setIsValid(valid);
    
    if (valid) {
      const id = extractVideoId(debouncedUrl);
      setVideoId(id);
    } else {
      setVideoId(null);
    }
  }, [debouncedUrl, validateUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleClearInput = () => {
    setVideoUrl('');
    setIsValid(null);
    setVideoId(null);
  };

  const handleSubmit = () => {
    if (isValid === true && !isSaving) {
      onSubmit(videoUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid === true && !isSaving) {
      handleSubmit();
    }
  };

  const togglePreviewSize = () => {
    setShowFullPreview(!showFullPreview);
  };

  const hasFormatError = videoUrl.trim() && isValid === false;
  const displayError = errorText || (hasFormatError ? invalidFormatText : null);

  // Determinamos el estado del input para estilizar
  const getInputStateClasses = () => {
    if (displayError) {
      return "border-red-500 focus:ring-red-500 focus:border-red-500";
    }
    if (isValid === true) {
      return "border-green-500 focus:ring-green-500 focus:border-green-500";
    }
    if (isFocused) {
      return "border-blue-500 focus:ring-blue-500 focus:border-blue-500";
    }
    return "border-gray-300 dark:border-gray-700";
  };

  // Crear una vista previa con iframe de YouTube
  const renderVideoPreview = () => {
    if (!videoId) return null;
    
    // URL para el iframe de YouTube (con autoplay desactivado, controles habilitados)
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1`;
    
    return (
      <div className={`mt-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 ${showFullPreview ? '' : 'max-h-60'}`}>
        <div className="relative group">
          {/* Contenedor del iframe con relación de aspecto 16:9 */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Información del video */}
          <div className="p-3 bg-white dark:bg-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <Youtube className="w-4 h-4 mr-2 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  YouTube Video - {videoId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={togglePreviewSize}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title={showFullPreview ? "Reducir vista previa" : "Ampliar vista previa"}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-colors"
                title="Abrir en YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
      {/* Encabezado */}
      <div className="flex items-center">
        <Youtube className="w-5 h-5 mr-2 text-red-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          YouTube Video
        </h3>
      </div>

      {/* Grupos de entrada */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL del video
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Youtube className="h-4 w-4" />
            </div>
            <Input
              id="youtube-url"
              placeholder={placeholder}
              value={videoUrl}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`h-11 text-sm pl-10 pr-10 ${getInputStateClasses()} transition-all duration-200`}
              aria-invalid={!!displayError}
              aria-describedby={displayError ? "youtube-url-error" : undefined}
              disabled={isSaving}
            />
            {/* Estado e iconos */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {videoUrl && !isSaving && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Limpiar campo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isValid === true && (
                <span className="text-green-500">
                  <Check className="h-5 w-5" />
                </span>
              )}
              {isValid === false && videoUrl.trim() && (
                <span className="text-red-500">
                  <AlertCircle className="h-5 w-5" />
                </span>
              )}
            </div>
          </div>

          {/* Mensaje de Error */}
          {displayError && (
            <div id="youtube-url-error" className="flex items-center text-red-500 text-xs mt-1.5">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Vista previa del video con iframe */}
          {isValid === true && renderVideoPreview()}
        </div>

        {/* Ayuda para usuarios */}
        {!isValid && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="mb-1 font-medium">Formatos aceptados:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>https://youtube.com/shorts/VIDEO_ID</li>
              <li>https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-x-3 justify-between">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          size="sm"
          className="h-10 flex items-center"
          disabled={isSaving}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backText}
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || isValid !== true || isSaving}
          size="sm"
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors" 
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {saveText}
        </Button>
      </div>
    </div>
  );
};