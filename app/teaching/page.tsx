"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeachingCard from "@/components/Teaching";
import { getTodaysTeaching, saveTeachingToHistory } from "@/lib/storage";
import { getRandomTeaching, type Teaching } from "@/lib/teachings";

export default function TeachingPage() {
  const router = useRouter();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [sat, setSat] = useState(false);
  const [entryDate] = useState(new Date().toISOString());

  useEffect(() => {
    const t = getTodaysTeaching() ?? getRandomTeaching();
    setTeaching(t);
    saveTeachingToHistory(t, false);
  }, []);

  const handleSat = () => {
    setSat(true);
    if (teaching) {
      saveTeachingToHistory(teaching, true);
    }
  };

  if (!teaching) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
        }}
      >
        <div style={{ fontSize: 13, color: "#534AB7", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          receiving...
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        padding: "3rem 0 5rem",
      }}
    >
      <TeachingCard
        teaching={teaching}
        onSat={handleSat}
        sat={sat}
      />

      {/* Bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
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
          bell
        </a>
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
      </div>
    </main>
  );
}
