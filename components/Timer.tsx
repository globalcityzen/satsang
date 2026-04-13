"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ringBell, ringClosingBell } from "@/lib/bell-audio";

const PRESETS = [5, 10, 15, 20, 30, 45];

export default function Timer() {
  const [duration, setDuration] = useState(20); // minutes
  const [remaining, setRemaining] = useState<number | null>(null); // seconds
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(async () => {
    await ringBell();
    setRemaining(duration * 60);
    setRunning(true);
    setFinished(false);
  }, [duration]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(null);
  }, []);

  useEffect(() => {
    if (!running || remaining === null) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          ringClosingBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress =
    remaining !== null ? 1 - remaining / (duration * 60) : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Duration presets — only show when not running */}
      {!running && !finished && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {PRESETS.map((mins) => (
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              style={{
                background: "transparent",
                border: `0.5px solid ${duration === mins ? "#534AB7" : "#3d3b52"}`,
                borderRadius: 20,
                padding: "5px 14px",
                color: duration === mins ? "#AFA9EC" : "#3d3b52",
                fontSize: 13,
                fontFamily: "Georgia, serif",
                cursor: "pointer",
              }}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* Timer ring */}
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          {/* Background track */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="1.5"
          />
          {/* Progress arc */}
          {running && (
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke="#534AB7"
              strokeWidth="1"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          )}
          {/* Outer ring */}
          <circle
            cx="70" cy="70" r="64"
            fill="none"
            stroke="#3d3b52"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </svg>

        {/* Time display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {finished ? (
            <div style={{ fontSize: 13, color: "#534AB7", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              ✦
            </div>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 400, color: "#AFA9EC", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>
                {remaining !== null ? formatTime(remaining) : `${duration}:00`}
              </div>
              {!running && (
                <div style={{ fontSize: 10, color: "#3d3b52", marginTop: 4, letterSpacing: "0.1em" }}>
                  MINUTES
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      {finished ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "#534AB7", fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 16 }}>
            the satsang rests in silence
          </div>
          <button
            onClick={() => { setFinished(false); setRemaining(null); }}
            style={{
              background: "transparent",
              border: "0.5px solid #3d3b52",
              borderRadius: 8,
              padding: "10px 20px",
              color: "#7a7890",
              fontSize: 13,
              fontFamily: "Georgia, serif",
              cursor: "pointer",
            }}
          >
            sit again
          </button>
        </div>
      ) : running ? (
        <button
          onClick={stopTimer}
          style={{
            background: "transparent",
            border: "0.5px solid #3d3b52",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#3d3b52",
            fontSize: 12,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          end early
        </button>
      ) : (
        <button
          onClick={startTimer}
          style={{
            background: "transparent",
            border: "0.5px solid #534AB7",
            borderRadius: 8,
            padding: "14px 32px",
            color: "#AFA9EC",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
          }}
        >
          ring the bell to enter
        </button>
      )}

      {!running && !finished && (
        <div style={{ fontSize: 12, color: "#3d3b52", fontFamily: "Georgia, serif", fontStyle: "italic", textAlign: "center", maxWidth: 260 }}>
          the bell opens and closes the satsang
        </div>
      )}
    </div>
  );
}
