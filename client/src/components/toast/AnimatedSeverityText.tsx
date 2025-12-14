import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

type Severity = "info" | "success" | "warning" | "error";

const severityColors: Record<Severity, string> = {
  error: "#ef4444", // red-500
  success: "#22c55e", // green-500
  warning: "#facc15", // yellow-400
  info: "#0ea5e9", // sky-500
};

type AnimatedSeverityTextProps = {
  message: string;
  severity: Severity;
  autoHideDuration: number; // in ms
};

export const AnimatedSeverityText = ({
  message,
  severity,
  autoHideDuration,
}: AnimatedSeverityTextProps) => {
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const [lines, setLines] = useState<string[] | null>(null);

  // Measure physical lines after first render
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const textNode = el.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      setLines([message]);
      return;
    }

    const range = document.createRange();
    const text = (textNode as Text).textContent ?? "";
    const result: string[] = [];

    let currentLine = "";
    let lastBottom: number | null = null;

    for (let i = 0; i < text.length; i++) {
      range.setStart(textNode, 0);
      range.setEnd(textNode, i + 1);
      const rects = range.getClientRects();
      if (!rects.length) continue;

      const rect = rects[rects.length - 1];

      if (lastBottom === null) {
        lastBottom = rect.bottom;
        currentLine = text[i];
      } else if (Math.abs(rect.bottom - lastBottom) > 0.5) {
        // new line
        result.push(currentLine);
        currentLine = text[i];
        lastBottom = rect.bottom;
      } else {
        currentLine += text[i];
      }
    }

    if (currentLine) {
      result.push(currentLine);
    }

    setLines(result);
  }, [message]);

  // While we don't know the lines yet, render the hidden measurer only
  if (!lines) {
    return (
      <p
        ref={measureRef}
        className="
          text-base font-sans font-normal text-left 
          whitespace-pre-wrap 
          invisible absolute top-0 left-0 
          pointer-events-none
        "
      >
        {message}
      </p>
    );
  }

  const totalLines = lines.length;
  const totalDurationSec = autoHideDuration / 1000;
  const perLineDuration =
    totalLines > 0 ? totalDurationSec / totalLines : totalDurationSec;

  const severityColor = severityColors[severity];

  return (
    <p className="text-base font-semibold font-sans [--base-text:theme(colors.gray.800)] dark:[--base-text:theme(colors.gray.50)] text-left leading-snug whitespace-pre-wrap">
      {lines.map((line, index) => {
        const delay = perLineDuration * index;

        return (
          <motion.span
            key={index}
            style={{
              // Single text layer:
              // baseColor- severityColor wipe from left to right
              backgroundImage: `linear-gradient(
                to left,
                var(--base-text) 0%,
               var(--base-text) var(--p, 100%),
                ${severityColor} var(--p, 100%),
                ${severityColor} 100%
              )`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              // initial value (fully base color)
              ["--p" as any]: "100%",
            }}
            animate={{
              // move split point to 0% → fully severity color
              ["--p" as any]: "0%",
            }}
            transition={{
              duration: perLineDuration,
              delay,
              ease: "linear",
            }}
          >
            {line}
          </motion.span>
        );
      })}
    </p>
  );
};
