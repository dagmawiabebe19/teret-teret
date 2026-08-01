"use client";

import { Fragment, type ReactNode } from "react";
import { unescapeSceneText } from "@/lib/lives/sceneText";

/**
 * Tiny inline markdown: **bold**, *italic*, _italic_. No heavy libs.
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Bold first (**...**), then *...* or _..._
  const re = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(
        <Fragment key={`t${key++}`}>{text.slice(last, match.index)}</Fragment>
      );
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`b${key++}`} className="font-bold text-[#FFD700]/95">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={`i${key++}`} className="italic text-[#e8e0ff]">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      nodes.push(<Fragment key={`r${key++}`}>{token}</Fragment>);
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    nodes.push(<Fragment key={`t${key++}`}>{text.slice(last)}</Fragment>);
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderParagraphBody(para: string): ReactNode[] {
  // Preserve single newlines as soft breaks within a paragraph.
  const lines = para.split(/\n/);
  const out: ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) out.push(<br key={`br${i}`} />);
    out.push(<Fragment key={`l${i}`}>{renderInline(line)}</Fragment>);
  });
  return out;
}

interface SceneTextProps {
  text: string;
  className?: string;
  /** Limit how many paragraphs to show (e.g. faded preview while loading). */
  maxParagraphs?: number;
  faded?: boolean;
}

export function SceneText({
  text,
  className = "",
  maxParagraphs,
  faded = false,
}: SceneTextProps) {
  const cleaned = unescapeSceneText(text);
  let paragraphs = cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (typeof maxParagraphs === "number") {
    paragraphs = paragraphs.slice(0, maxParagraphs);
  }

  return (
    <div
      className={className}
      style={faded ? { opacity: 0.35 } : undefined}
      aria-hidden={faded || undefined}
    >
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="text-[#e8e0ff] text-[16px] sm:text-[17px] leading-[1.75] mb-4 last:mb-0"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {renderParagraphBody(para)}
        </p>
      ))}
    </div>
  );
}
