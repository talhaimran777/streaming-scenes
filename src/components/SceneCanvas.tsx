"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Orientation = "horizontal" | "vertical";

const SIZES = {
  horizontal: { w: 1920, h: 1080 },
  vertical: { w: 1080, h: 1920 },
} as const;

function detectOrientation(
  forced: Orientation | null,
  width: number,
  height: number,
): Orientation {
  if (forced) return forced;
  return height > width ? "vertical" : "horizontal";
}

export function useOrientation(force?: string | null): Orientation {
  const forced =
    force === "h" || force === "horizontal"
      ? "horizontal"
      : force === "v" || force === "vertical"
        ? "vertical"
        : null;

  const [orientation, setOrientation] = useState<Orientation>(
    forced ?? "horizontal",
  );

  useEffect(() => {
    const update = () => {
      setOrientation(
        detectOrientation(forced, window.innerWidth, window.innerHeight),
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [forced]);

  return orientation;
}

type SceneCanvasProps = {
  orientation: Orientation;
  transparent?: boolean;
  children: ReactNode;
  className?: string;
  /** When true, scale to the parent container instead of the window (settings preview). */
  fitContainer?: boolean;
};

export function SceneCanvas({
  orientation,
  transparent = false,
  children,
  className = "",
  fitContainer = false,
}: SceneCanvasProps) {
  const { w, h } = SIZES[orientation];
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const recompute = useCallback(() => {
    const el = rootRef.current;
    const vw = fitContainer && el ? el.clientWidth : window.innerWidth;
    const vh = fitContainer && el ? el.clientHeight : window.innerHeight;
    const s = Math.min(vw / w, vh / h);
    setScale(s);
    setOffset({
      x: (vw - w * s) / 2,
      y: (vh - h * s) / 2,
    });
  }, [w, h, fitContainer]);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    let ro: ResizeObserver | null = null;
    if (fitContainer && rootRef.current) {
      ro = new ResizeObserver(() => recompute());
      ro.observe(rootRef.current);
    }
    return () => {
      window.removeEventListener("resize", recompute);
      ro?.disconnect();
    };
  }, [recompute, fitContainer]);

  const style = useMemo(
    () => ({
      width: w,
      height: h,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "top left" as const,
    }),
    [w, h, offset.x, offset.y, scale],
  );

  return (
    <div
      ref={rootRef}
      className={`scene-root ${transparent ? "" : "opaque"} ${className}`}
      style={{
        position: "relative",
        width: fitContainer ? "100%" : undefined,
        height: fitContainer ? "100%" : undefined,
      }}
    >
      <div
        style={{
          ...style,
          position: "absolute",
          overflow: "hidden",
          fontFamily: "var(--font-chakra), sans-serif",
          color: "var(--teye-text)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
