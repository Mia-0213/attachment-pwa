import React from "react";

interface ActionTextProps {
  content: string;
}

export const ActionText: React.FC<ActionTextProps> = ({ content }) => {
  if (!content) return null;

  // 切分段落
  const paragraphs = content.split(/\n+/);

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;

        // 處理粗體 Markdown (**「對話」**)
        const parts = para.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={pIdx} className="text-slate-200">
            {parts.map((part, idx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                const boldText = part.slice(2, -2);
                return (
                  <strong key={idx} className="font-bold text-white text-base block my-1">
                    {boldText}
                  </strong>
                );
              }

              // 處理括號以相容舊資料或使用者動作
              if (part.startsWith("(") && part.endsWith(")")) {
                return (
                  <span key={idx} className="text-slate-400 italic">
                    {part}
                  </span>
                );
              }

              return <span key={idx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};
