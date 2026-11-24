import React from 'react';

interface FormattedTextProps {
  text: string;
}

/**
 * Safely renders inline `*italic*` emphasis spans as semantic `<em>` elements
 * without raw HTML injection.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
