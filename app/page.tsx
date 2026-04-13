"use client";

import { useRouter } from "next/navigation";
import Bell from "@/components/Bell";
import { saveTodaysTeaching } from "@/lib/storage";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const timeOfDay = (): "morning" | "evening" => {
    const h = new Date().getHours();
    return h >= 17 || h < 4 ? "evening" : "morning";
  };

  const handleBellComplete = async () => {
    setLoading(true);
    try {
      // Get personal corpus chunks from localStorage
      const { getCorpusChunks } = await import("@/lib/storage");
      const chunks = getCorpusChunks();
      const personalChunks = chunks.map(
        (c) => `[personal:${c.id}] ${c.sourceLabel}: "${c.text}"`
      );

      const res = await fetch("/api/teaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeOfDay: timeOfDay(), personalChunks }),
      });

      const data = await res.json();
      if (data.teaching) {
        saveTodaysTeaching(data.teaching);
        router.push("/teaching");
      }
    } catch (err) {
      console.error(err);
      // Navigate anyway — teaching page handles fallback
      router.push("/teaching");
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      {/* App name */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11,
          color: "#3d3b52",
          letterSpacing: "0.25em",
          fontFamily: "Georgia, serif",
          textTransform: "uppercase",
        }}
      >
        Satsang
      </div>

      {loading ? (
        <div
          style={{
            fontSize: 13,
            color: "#534AB7",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          sitting with truth...
        </div>
      ) : (
        <>
          <Bell onRingComplete={handleBellComplete} size="large" />
          <div
            style={{
              fontSize: 12,
              color: "#3d3b52",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            enter the satsang
          </div>
        </>
      )}

      {/* Quiet bottom nav */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
        }}
      >
        <a
          href="/sit"
          style={{
            fontSize: 11,
            color: "#3d3b52",
            fontFamily: "Georgia, serif",
            textDecoration: "none",
            letterSpacing: "0.1em",
          }}
        >
          sit
        </a>
        <a
          href="/upload"
          style={{
            fontSize: 11,
            color: "#3d3b52",
            fontFamily: "Georgia, serif",
            textDecoration: "none",
            letterSpacing: "0.1em",
          }}
        >
          feed the satsang
        </a>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
