import React from 'react';
import { File } from 'lucide-react';

interface FileChipProps {
  fileUrl: string;
  fileName: string;
  onDelete?: () => void;
}

const FileChip: React.FC<FileChipProps> = ({ fileUrl, fileName, onDelete }) => {
  // Extract file extension for conditional styling
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  // Determine icon color based on file type
  const getIconColor = () => {
    switch (fileExtension) {
      case 'pdf': return 'text-red-600';
      case 'doc':
      case 'docx': return 'text-blue-600';
      case 'xls':
      case 'xlsx': return 'text-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'text-purple-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 my-1 gap-2 text-sm shadow-sm hover:bg-slate-100 transition-colors duration-200 group max-w-full">
      <div className={`${getIconColor()} flex-shrink-0`}>
        <File size={18} />
      </div>
      
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-medium text-slate-800 hover:text-blue-600 hover:underline truncate max-w-xs"
        title={fileName}
      >
        {fileName}
      </a>
      
      {onDelete && (
        <button 
          onClick={onDelete} 
          className="ml-1 text-slate-400 hover:text-red-500 focus:outline-none flex-shrink-0"
          aria-label="Eliminar archivo"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FileChip;