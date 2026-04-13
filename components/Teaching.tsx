"use client";

import type { Teaching } from "@/lib/teachings";

interface TeachingCardProps {
  teaching: Teaching;
  isPersonal?: boolean;
  onSat: () => void;
  sat?: boolean;
}

export default function TeachingCard({
  teaching,
  isPersonal = false,
  onSat,
  sat = false,
}: TeachingCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 480,
        width: "100%",
        padding: "0 1.5rem",
      }}
    >
      {/* Source */}
      <div
        style={{
          fontSize: 12,
          color: isPersonal ? "#AFA9EC" : "#534AB7",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "Georgia, serif",
        }}
      >
        {isPersonal && "✦ "}{teaching.source}
      </div>

      {/* The teaching text */}
      <blockquote
        style={{
          fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
          lineHeight: 1.8,
          color: "#e8e6f0",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          borderLeft: "2px solid #3d3b52",
          paddingLeft: "1.25rem",
          margin: 0,
        }}
      >
        {teaching.text}
      </blockquote>

      {/* Carry line */}
      <div
        style={{
          fontSize: 14,
          color: "#7a7890",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}
      >
        sit with: &ldquo;{teaching.carryLine}&rdquo;
      </div>

      {/* I've sat with this */}
      {!sat ? (
        <button
          onClick={onSat}
          style={{
            background: "transparent",
            border: "0.5px solid #3d3b52",
            borderRadius: 8,
            padding: "14px 24px",
            color: "#7a7890",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            transition: "all 0.3s ease",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#534AB7";
            (e.target as HTMLButtonElement).style.color = "#AFA9EC";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#3d3b52";
            (e.target as HTMLButtonElement).style.color = "#7a7890";
          }}
        >
          I&apos;ve sat with this
        </button>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: "#534AB7",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}
        >
          ✦ the satsang continues in the day
        </div>
      )}
    </div>
  );
}
