import React from "react";

function parseHsl(value: string): { h: number; l: number; s: number } {
  const match = /([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/.exec(value);
  if (!match) {
    return { h: 260, l: 72, s: 78 };
  }
  return {
    h: Number.parseFloat(match[1] ?? "260"),
    s: Number.parseFloat(match[2] ?? "78"),
    l: Number.parseFloat(match[3] ?? "72"),
  };
}

function glowVars(color: string, intensity: number): React.CSSProperties {
  const { h, l, s } = parseHsl(color);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  return Object.fromEntries(
    opacities.map((opacity, index) => [
      `--agenthub-glow-color${suffixes[index]}`,
      `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`,
    ]),
  ) as React.CSSProperties;
}

export interface BorderGlowProps {
  readonly animated?: boolean | undefined;
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
  readonly glowColor?: string | undefined;
  readonly glowIntensity?: number | undefined;
}

export function BorderGlow({
  animated = true,
  children,
  className,
  glowColor = "260 78 72",
  glowIntensity = 0.78,
}: BorderGlowProps): React.ReactElement {
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    card.classList.add("agenthub-border-glow-sweep");
    const timeout = window.setTimeout(() => {
      card.classList.remove("agenthub-border-glow-sweep");
    }, 2600);
    return () => window.clearTimeout(timeout);
  }, [animated]);

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>): void => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const edgeX = centerX > 0 ? Math.abs(dx) / centerX : 0;
    const edgeY = centerY > 0 ? Math.abs(dy) / centerY : 0;
    const proximity = Math.min(Math.max(Math.max(edgeX, edgeY) * 100, 0), 100);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    card.style.setProperty("--agenthub-edge-proximity", proximity.toFixed(3));
    card.style.setProperty("--agenthub-cursor-angle", `${angle.toFixed(3)}deg`);
  }, []);

  const handlePointerLeave = React.useCallback((): void => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    card.style.setProperty("--agenthub-edge-proximity", "0");
  }, []);

  return (
    <div
      className={["agenthub-border-glow-card", className].filter(Boolean).join(" ")}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={cardRef}
      style={glowVars(glowColor, glowIntensity)}
    >
      <span className="agenthub-border-glow-edge" aria-hidden="true" />
      <div className="agenthub-border-glow-inner">{children}</div>
    </div>
  );
}
