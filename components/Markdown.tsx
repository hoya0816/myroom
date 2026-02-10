
import React from 'react';
import { marked } from 'marked';

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, className = "" }) => {
  // Simple check for marked availability (from importmap)
  const html = React.useMemo(() => {
    try {
      return marked.parse(content);
    } catch (e) {
      return content;
    }
  }, [content]);

  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html as string }}
    />
  );
};

export default Markdown;
