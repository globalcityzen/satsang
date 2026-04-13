import Timer from "@/components/Timer";

export default function SitPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        padding: "2rem",
      }}
    >
      <Timer />

      {/* Quiet back link */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: 11,
            color: "#3d3b52",
            fontFamily: "Georgia, serif",
            textDecoration: "none",
            letterSpacing: "0.1em",
          }}
        >
          satsang
        </a>
      </div>
    </main>
  );
}
