export function LiveBadge({
  text = "LIVE",
  size = "md",
  clip = false,
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
  clip?: boolean;
}) {
  const pad = size === "sm" ? "6px 18px" : size === "lg" ? "0 40px" : "0 40px";
  const font = size === "sm" ? 22 : size === "lg" ? 26 : 26;
  const dot = size === "sm" ? 12 : 14;

  return (
    <div
      style={{
        flex: "0 0 auto",
        padding: pad,
        background: "#E8192C",
        display: "flex",
        alignItems: "center",
        gap: size === "sm" ? 12 : 16,
        height: size === "sm" ? undefined : "100%",
        clipPath: clip
          ? "polygon(0 0,100% 0,calc(100% - 28px) 100%,0 100%)"
          : undefined,
      }}
    >
      <div
        className="teye-pulse"
        style={{
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: "#fff",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: font,
          fontWeight: 700,
          letterSpacing: "0.26em",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  accentBar = false,
  compact = false,
}: {
  label: string;
  value: string;
  delta?: string;
  accentBar?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(14,14,18,0.9)",
        padding: compact ? "22px 24px" : "26px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accentBar && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "#E8192C",
          }}
        />
      )}
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: compact ? 16 : 18,
          letterSpacing: "0.28em",
          color: "#8A8A93",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: compact ? 46 : 62,
            fontWeight: 700,
            lineHeight: 1,
            color: "#fff",
          }}
        >
          {value}
        </div>
        {delta && (
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 26,
              fontWeight: 700,
              color: "#FF3B3B",
            }}
          >
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}

export function Ticker({
  items,
  badge,
  height = 96,
  fast = false,
  bottomOffset = 0,
}: {
  items: string[];
  badge: string;
  height?: number;
  fast?: boolean;
  bottomOffset?: number;
}) {
  const row = (
    <div
      style={{
        display: "inline-flex",
        gap: fast ? 56 : 64,
        paddingLeft: fast ? 56 : 64,
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: fast ? 26 : 24,
        letterSpacing: fast ? "0.16em" : "0.18em",
        color: "#B4B4BC",
      }}
    >
      {items.map((item, i) => (
        <span key={`${item}-${i}`} style={{ display: "inline-flex", gap: fast ? 56 : 64 }}>
          <span>{item}</span>
          <span style={{ color: "#E8192C" }}>◆</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        height,
        borderTop: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(9,9,12,0.92)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          height: "100%",
          padding: fast ? "0 34px" : "0 40px",
          background: "#E8192C",
          display: "flex",
          alignItems: "center",
          gap: fast ? 14 : 16,
        }}
      >
        <div
          className="teye-pulse"
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: fast ? "0.2em" : "0.24em",
          }}
        >
          {badge}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
        <div
          className={fast ? "teye-ticker-fast" : "teye-ticker"}
          style={{ display: "inline-flex" }}
        >
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

export function CornerFrame({
  children,
  label,
  size = 44,
  thick = 5,
  showLabel = true,
  fill = true,
}: {
  children?: React.ReactNode;
  label?: string;
  size?: number;
  thick?: number;
  showLabel?: boolean;
  fill?: boolean;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "1px solid rgba(255,255,255,0.14)",
          background: fill ? "rgba(12,12,16,0.55)" : "transparent",
        }}
      />
      {showLabel && label && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 22,
            letterSpacing: "0.28em",
            color: "#4E4E58",
          }}
        >
          {label}
        </div>
      )}
      {children}
      <div
        style={{
          position: "absolute",
          left: -3,
          top: -3,
          width: size,
          height: size,
          borderLeft: `${thick}px solid #E8192C`,
          borderTop: `${thick}px solid #E8192C`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -3,
          top: -3,
          width: size,
          height: size,
          borderRight: `${thick}px solid #E8192C`,
          borderTop: `${thick}px solid #E8192C`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -3,
          bottom: -3,
          width: size,
          height: size,
          borderLeft: `${thick}px solid #8B5CF6`,
          borderBottom: `${thick}px solid #8B5CF6`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -3,
          bottom: -3,
          width: size,
          height: size,
          borderRight: `${thick}px solid #8B5CF6`,
          borderBottom: `${thick}px solid #8B5CF6`,
        }}
      />
    </div>
  );
}

export function AudioBars() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 20,
      }}
    >
      {[0, 0.15, 0.3, 0.45].map((delay) => (
        <div
          key={delay}
          className="teye-bar"
          style={{
            width: 3,
            height: "100%",
            background: "#fff",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ScanlineOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="teye-scan"
      style={{
        position: "absolute",
        inset: -10,
        background:
          "repeating-linear-gradient(180deg,rgba(255,255,255,.055) 0 1px,transparent 1px 4px)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}

export function GlowOverlay({
  show,
  horizontal = true,
}: {
  show: boolean;
  horizontal?: boolean;
}) {
  if (!show) return null;
  return (
    <div
      className="teye-glow"
      style={{
        position: "absolute",
        inset: 0,
        background: horizontal
          ? "radial-gradient(900px 620px at 88% 12%,rgba(232,25,44,.30),transparent 70%),radial-gradient(760px 560px at 6% 96%,rgba(139,92,246,.20),transparent 72%)"
          : "radial-gradient(700px 700px at 80% 14%,rgba(232,25,44,.30),transparent 70%),radial-gradient(620px 620px at 10% 92%,rgba(139,92,246,.20),transparent 72%)",
        pointerEvents: "none",
      }}
    />
  );
}

export function GridOverlay({
  show,
  size = 96,
}: {
  show: boolean;
  size?: number;
}) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        pointerEvents: "none",
      }}
    />
  );
}

type ChatLine = { author: string; message: string; id?: string };

export function ChatFeed({
  messages,
  fallback,
}: {
  messages: ChatLine[];
  fallback?: ChatLine[];
}) {
  const list: ChatLine[] =
    messages.length > 0
      ? messages
      : (fallback ?? [
          { author: "smokecriminal", message: "that clutch was insane" },
          { author: "nadeking", message: "rank up when" },
          { author: "mirage_enjoyer", message: "drop the crosshair code" },
          {
            author: "teyefan01",
            message: "first stream I caught live, this is fun",
          },
        ]);

  return (
    <div
      style={{
        flex: 1,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        fontSize: 26,
        overflow: "hidden",
      }}
    >
      {list.map((m, i) => (
        <div key={m.id ?? `${m.author}-${i}`}>
          <span
            style={{
              color: i % 2 === 0 ? "#FF3B3B" : "#8B5CF6",
              fontWeight: 600,
            }}
          >
            {m.author}
          </span>
          <span style={{ color: "#8A8A93" }}> · </span>
          <span style={{ color: "#DDDDE2" }}>{m.message}</span>
        </div>
      ))}
    </div>
  );
}

export const SOCIALS = {
  fontSize: 24,
  fontSizeCompact: 20,
  labelColor: "#E8192C",
  valueColor: "#B4B4BC",
  letterSpacing: "0.18em",
} as const;

type SocialItem = { label: string; value: string };

function SocialItemRow({
  label,
  value,
  innerGap = 12,
}: {
  label: string;
  value: string;
  innerGap?: number;
}) {
  return (
    <span style={{ display: "inline-flex", gap: innerGap }}>
      <span style={{ color: SOCIALS.labelColor }}>{label}</span>
      <span style={{ color: SOCIALS.valueColor }}>{value}</span>
    </span>
  );
}

export function SocialBlock({
  items,
  layout = "grid",
  columns = 2,
  fontSize = SOCIALS.fontSize,
  align = "start",
  maxWidth,
  rowGap = 14,
  columnGap = 40,
  gap = 30,
}: {
  items: SocialItem[];
  layout?: "grid" | "inline";
  columns?: number;
  fontSize?: number;
  align?: "start" | "end" | "center";
  maxWidth?: number;
  rowGap?: number;
  columnGap?: number;
  gap?: number;
}) {
  if (layout === "inline") {
    const est =
      items.reduce(
        (sum, s) =>
          sum + (s.label.length + s.value.length) * fontSize * 0.78 + 12,
        0,
      ) + gap * Math.max(0, items.length - 1);
    const scale =
      maxWidth && est > maxWidth ? Math.max(maxWidth / est, 0.62) : 1;
    const sizedFont = Math.round(fontSize * scale);
    const sizedGap = Math.round(gap * scale);
    const innerGap = Math.max(6, Math.round(12 * scale));

    return (
      <div
        style={{
          display: "flex",
          gap: sizedGap,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: sizedFont,
          letterSpacing: SOCIALS.letterSpacing,
          alignItems: "center",
          justifyContent:
            align === "end"
              ? "flex-end"
              : align === "center"
                ? "center"
                : "flex-start",
        }}
      >
        {items.map((s) => (
          <SocialItemRow
            key={`${s.label}-${s.value}`}
            label={s.label}
            value={s.value}
            innerGap={innerGap}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${rowGap}px ${columnGap}px`,
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize,
        letterSpacing: SOCIALS.letterSpacing,
        justifyItems:
          align === "end"
            ? "end"
            : align === "center"
              ? "center"
              : "start",
        width: maxWidth ? "100%" : undefined,
        maxWidth,
      }}
    >
      {items.map((s) => (
        <SocialItemRow
          key={`${s.label}-${s.value}`}
          label={s.label}
          value={s.value}
        />
      ))}
    </div>
  );
}

export function BrandMark({
  brand,
  handle,
  brandSize = 44,
  handleSize = 22,
  row = true,
}: {
  brand: string;
  handle: string;
  brandSize?: number;
  handleSize?: number;
  row?: boolean;
}) {
  if (!row) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: brandSize,
            fontWeight: 700,
            letterSpacing: "0.16em",
          }}
        >
          {brand}
        </div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: handleSize,
            letterSpacing: "0.24em",
            color: "#8A8A93",
          }}
        >
          {handle}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div
        style={{
          fontSize: brandSize,
          fontWeight: 700,
          letterSpacing: "0.16em",
        }}
      >
        {brand}
      </div>
      <div
        style={{
          width: 2,
          height: Math.round(brandSize * 0.75),
          background: "rgba(255,255,255,0.18)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: handleSize,
          letterSpacing: "0.22em",
          color: "#8A8A93",
        }}
      >
        {handle}
      </div>
    </div>
  );
}

export function CountdownCard({
  value,
  infoRows,
  showInfoRows,
  countdownLabel = "STARTING IN",
}: {
  value: string;
  infoRows: Array<{ label: string; value: string; accent?: boolean }>;
  showInfoRows: boolean;
  countdownLabel?: string;
}) {
  return (
    <div
      style={{
        width: 520,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(14,14,18,0.85)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          height: 6,
          background: "linear-gradient(90deg,#E8192C,#8B5CF6)",
        }}
      />
      <div
        style={{
          padding: "44px 48px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 20,
            letterSpacing: "0.3em",
            color: "#8A8A93",
          }}
        >
          {countdownLabel}
        </div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 132,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "#fff",
          }}
        >
          {value}
        </div>
        {showInfoRows && (
          <>
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.12)",
                margin: "12px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 22,
              }}
            >
              {infoRows.map((row) => (
                <div
                  key={`${row.label}-${row.value}`}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#8A8A93" }}>{row.label}</span>
                  <span style={{ color: row.accent ? "#FF3B3B" : undefined }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
