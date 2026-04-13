"use client";

import { useState, useCallback } from "react";
import { ringBell } from "@/lib/bell-audio";

interface BellProps {
  onRingComplete?: () => void;
  size?: "large" | "small";
}

export default function Bell({ onRingComplete, size = "large" }: BellProps) {
  const [ringing, setRinging] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);

  const handleRing = useCallback(async () => {
    if (ringing) return;
    setRinging(true);

    // Add ripple rings
    const id = Date.now();
    setRipples((r) => [...r, id, id + 1, id + 2]);
    setTimeout(() => {
      setRipples((r) => r.filter((rid) => rid !== id && rid !== id + 1 && rid !== id + 2));
    }, 3000);

    await ringBell();
    setRinging(false);
    onRingComplete?.();
  }, [ringing, onRingComplete]);

  const isLarge = size === "large";
  const circleSize = isLarge ? 120 : 64;
  const iconSize = isLarge ? 48 : 24;

  return (
    <div
      style={{
        position: "relative",
        width: circleSize + 80,
        height: circleSize + 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: ringing ? "default" : "pointer",
        userSelect: "none",
      }}
      onClick={handleRing}
      role="button"
      aria-label="Ring the bell"
    >
      {/* Ripple rings */}
      {ripples.map((id, index) => (
        <div
          key={id}
          style={{
            position: "absolute",
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            border: "1px solid rgba(127, 119, 221, 0.4)",
            animation: `ripple ${1.5 + index * 0.4}s ease-out ${index * 0.3}s both`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Bell circle */}
      <div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          border: `1.5px solid ${ringing ? "#7F77DD" : "#3d3b52"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ringing ? "rgba(127, 119, 221, 0.08)" : "transparent",
          transition: "all 0.3s ease",
          zIndex: 1,
        }}
      >
        <BellIcon
          size={iconSize}
          color={ringing ? "#AFA9EC" : "#534AB7"}
        />
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function BellIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}
