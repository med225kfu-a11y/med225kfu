import React from 'react';

// URL regex pattern that matches common URL formats
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;

/**
 * Converts plain text containing URLs into React elements with clickable links
 */
export function linkifyText(text: string): React.ReactNode {
  if (!text) return null;
  
  const parts = text.split(URL_REGEX);
  
  if (parts.length === 1) {
    return text;
  }
  
  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex lastIndex since we're reusing it
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
