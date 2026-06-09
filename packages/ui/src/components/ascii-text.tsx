import React from "react";

const ASCII_CHARS = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const HORIZONTAL_STRETCH = 1.18;
const TEXT_WIDTH_FRACTION = 0.82;

export interface ASCIITextProps {
  readonly className?: string | undefined;
  readonly enableWaves?: boolean | undefined;
  readonly text: string;
}

export function ASCIIText({
  className,
  enableWaves = true,
  text,
}: ASCIITextProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const preRef = React.useRef<HTMLPreElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) {
      return undefined;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return undefined;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cell = 8;

    const resize = (): void => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      cell = width < 560 ? 7 : 8;
      cols = Math.max(1, Math.floor(width / cell));
      rows = Math.max(1, Math.floor(height / cell));
      canvas.width = cols;
      canvas.height = rows;
      pre.style.fontSize = `${cell}px`;
      if (reducedMotion) {
        draw(0);
      }
    };

    const draw = (time: number): void => {
      context.clearRect(0, 0, cols, rows);
      const maxFontSize = Math.max(18, Math.floor(rows * 1.04));
      context.font = `800 ${maxFontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
      const measuredWidth = context.measureText(text).width || 1;
      const fitFontSize = Math.floor(
        maxFontSize * ((cols * TEXT_WIDTH_FRACTION) / (measuredWidth * HORIZONTAL_STRETCH)),
      );
      const fontSize = Math.max(18, Math.min(maxFontSize, fitFontSize));
      context.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "white";
      const wave =
        enableWaves && !reducedMotion ? Math.sin(time / 900) * Math.max(1, cols * 0.012) : 0;
      context.save();
      context.translate(cols / 2 + wave, rows / 2);
      context.scale(HORIZONTAL_STRETCH, 1);
      context.fillText(text, 0, 0);
      context.restore();

      const data = context.getImageData(0, 0, cols, rows).data;
      let output = "";
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = (y * cols + x) * 4;
          const alpha = data[i + 3] ?? 0;
          if (alpha < 16) {
            output += " ";
            continue;
          }
          const ripple =
            enableWaves && !reducedMotion ? Math.sin(time / 260 + x * 0.16 + y * 0.24) : 0;
          const normalized = Math.min(1, Math.max(0, alpha / 255 + ripple * 0.16));
          output += ASCII_CHARS[Math.floor(normalized * (ASCII_CHARS.length - 1))] ?? "@";
        }
        output += "\n";
      }
      pre.textContent = output;
      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [enableWaves, text]);

  return (
    <div
      aria-hidden="true"
      className={["agenthub-ascii-text", className].filter(Boolean).join(" ")}
      ref={containerRef}
    >
      <span>{text}</span>
      <pre ref={preRef} />
    </div>
  );
}
