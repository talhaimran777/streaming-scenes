import Link from "next/link";
import { SCENE_IDS, SCENE_META } from "@/lib/scenes";

export function AdminNav({ current }: { current?: string }) {
  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(9,9,12,0.95)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 10,
              height: 36,
              background: "linear-gradient(180deg,#E8192C,#8B5CF6)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "#E8192C",
              }}
            >
              TEYE / STREAM PACKAGE
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Overlays</div>
          </div>
        </Link>
        <nav
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
          }}
        >
          <NavLink href="/" active={current === "home"}>
            Dashboard
          </NavLink>
          <NavLink href="/settings/global" active={current === "global"}>
            Global
          </NavLink>
          <NavLink href="/control" active={current === "control"}>
            Control
          </NavLink>
          {SCENE_IDS.map((id) => (
            <NavLink
              key={id}
              href={`/settings/${id}`}
              active={current === id}
            >
              {SCENE_META[id].number}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 12px",
        border: `1px solid ${active ? "#E8192C" : "rgba(255,255,255,0.12)"}`,
        color: active ? "#fff" : "#B4B4BC",
        background: active ? "rgba(232,25,44,0.18)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}
