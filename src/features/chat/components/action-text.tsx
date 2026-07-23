import React from "react";

interface ActionTextProps {
  content: string;
}

interface Segment {
  type: "action" | "dialogue";
  text: string;
}

export const ActionText: React.FC<ActionTextProps> = ({ content }) => {
  const parseContent = (input: string): Segment[] => {
    const segments: Segment[] = [];
    const regex = /\((.*?)\)|（(.*?)）/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      // 匹配前的一般文字
      if (match.index > lastIndex) {
        const textBefore = input.substring(lastIndex, match.index);
        if (textBefore) {
          segments.push({ type: "dialogue", text: textBefore });
        }
      }

      // 括號內的行動/心理描述
      const actionContent = match[1] || match[2];
      if (actionContent) {
        segments.push({ type: "action", text: actionContent });
      }

      lastIndex = regex.lastIndex;
    }

    // 剩餘的一般文字
    if (lastIndex < input.length) {
      segments.push({ type: "dialogue", text: input.substring(lastIndex) });
    }

    return segments;
  };

  const segments = parseContent(content);

  return (
    <div className="whitespace-pre-wrap leading-relaxed">
      {segments.map((seg, idx) => {
        if (seg.type === "action") {
          return (
            <span key={idx} className="text-slate-400 italic block my-1">
              ({seg.text})
            </span>
          );
        }
        return <span key={idx}>{seg.text}</span>;
      })}
    </div>
  );
};
