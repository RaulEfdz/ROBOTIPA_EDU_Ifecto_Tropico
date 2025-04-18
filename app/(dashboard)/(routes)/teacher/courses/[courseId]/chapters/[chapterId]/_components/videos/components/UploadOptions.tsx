import { useState } from "react";
import { Link, Upload, Video, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadOptionsProps {
  onSelectYouTube: () => void;
  onSelectFile: () => void;
  onSelectVimeo: () => void;
  chooseText: string;
  youtubeText: string;
  fileText: string;
  vimeoText: string;
}

export const UploadOptions = ({
  onSelectYouTube,
  onSelectFile,
  onSelectVimeo,
  chooseText,
  youtubeText,
  fileText,
  vimeoText
}: UploadOptionsProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelectYouTube = () => {
    setSelectedOption("youtube");
    onSelectYouTube();
  };

  const handleSelectFile = () => {
    setSelectedOption("file");
    onSelectFile();
  };

  const handleSelectVimeo = () => {
    setSelectedOption("vimeo");
    onSelectVimeo();
  };

  return (
    <div className="p-6 bg-TextCustom dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center mb-4">
        <Video className="w-5 h-5 mr-2 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{chooseText}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* YouTube Option */}
        <button
          onClick={handleSelectYouTube}
          className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
            selectedOption === "youtube"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <div className={`p-3 rounded-full mb-3 ${
            selectedOption === "youtube"
              ? "bg-blue-100 dark:bg-blue-800"
              : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <Link className={`w-6 h-6 ${
              selectedOption === "youtube"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`} />
          </div>
          <span className={`text-sm font-medium ${
            selectedOption === "youtube"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300"
          }`}>
            {youtubeText}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Agrega videos desde YouTube
          </p>
        </button>

        {/* Archivo local */}
        <button
          onClick={handleSelectFile}
          className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
            selectedOption === "file"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <div className={`p-3 rounded-full mb-3 ${
            selectedOption === "file"
              ? "bg-blue-100 dark:bg-blue-800"
              : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <Upload className={`w-6 h-6 ${
              selectedOption === "file"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`} />
          </div>
          <span className={`text-sm font-medium ${
            selectedOption === "file"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300"
          }`}>
            {fileText}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Sube archivos de video desde tu dispositivo
          </p>
        </button>

        {/* Vimeo Option */}
        <button
          onClick={handleSelectVimeo}
          className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
            selectedOption === "vimeo"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <div className={`p-3 rounded-full mb-3 ${
            selectedOption === "vimeo"
              ? "bg-blue-100 dark:bg-blue-800"
              : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <VideoIcon className={`w-6 h-6 ${
              selectedOption === "vimeo"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`} />
          </div>
          <span className={`text-sm font-medium ${
            selectedOption === "vimeo"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300"
          }`}>
            {vimeoText}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Agrega videos desde Vimeo
          </p>
        </button>
      </div>

      {selectedOption && (
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setSelectedOption(null)} variant="ghost" className="mr-2">
            Cancelar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-TextCustom">
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadOptions;
