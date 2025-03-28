import React, { useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

interface EditorTextProps {
  initialText?: string;
  onChange: (content: string) => void;
}

const EditorText: React.FC<EditorTextProps> = ({ initialText = '', onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'], // Formatting options
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // Subscript/Superscript
        [{ align: [] }],
        ['clean'], // Clear formatting
      ],
    },
    theme: 'snow', // Ensure the Snow theme is applied
  });
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (quill) {
      if (isFirstRender.current && initialText) {
        quill.clipboard.dangerouslyPasteHTML(initialText);
        isFirstRender.current = false;
      }

      const handleTextChange = () => {
        const html = quill.root.innerHTML || '';
        onChange(html);
      };

      quill.on('text-change', handleTextChange);

      return () => {
        quill.off('text-change', handleTextChange);
      };
    }
  }, [quill, initialText, onChange]);

  return <div ref={quillRef} />;
};

export default EditorText;
