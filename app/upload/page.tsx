"use client";

import { useState, useRef } from "react";
import { addCorpusChunks, addCorpusSource, getCorpusSources } from "@/lib/storage";

export default function UploadPage() {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sources, setSources] = useState(() => {
    if (typeof window === "undefined") return [];
    return getCorpusSources();
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setStatus("processing");
    setMessage("Processing your teaching...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", `${file.name.replace(/\.[^/.]+$/, "")}, ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.chunks) {
        addCorpusChunks(data.chunks);
        addCorpusSource({
          id: data.sourceId,
          label: data.label,
          uploadedAt: new Date().toISOString(),
          chunkCount: data.chunks.length,
        });
        setSources(getCorpusSources());
        setStatus("done");
        setMessage(`${data.chunks.length} teachings extracted and added to your corpus.`);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try a text or PDF file.");
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
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <div
          style={{
            fontSize: 11,
            color: "#3d3b52",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "1rem",
            fontFamily: "Georgia, serif",
          }}
        >
          Feed the satsang
        </div>

        <p
          style={{
            fontSize: 14,
            color: "#7a7890",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Your teacher&apos;s recording, class notes, or satsang transcript. They become part of your morning company of truth.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "0.5px dashed #3d3b52",
            borderRadius: 12,
            padding: "2.5rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: 13, color: "#534AB7", fontFamily: "Georgia, serif", marginBottom: 8 }}>
            {status === "processing" ? "processing..." : "drop or tap to upload"}
          </div>
          <div style={{ fontSize: 11, color: "#3d3b52", fontFamily: "Georgia, serif" }}>
            audio · video · pdf · text
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.mp4,.m4a,.wav,.ogg,.pdf,.txt,.md"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </div>

        {message && (
          <div
            style={{
              fontSize: 13,
              color: status === "done" ? "#AFA9EC" : status === "error" ? "#7a7890" : "#534AB7",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              marginBottom: "1.5rem",
            }}
          >
            {message}
          </div>
        )}

        {/* Existing sources */}
        {sources.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#3d3b52", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, fontFamily: "Georgia, serif" }}>
              In your satsang
            </div>
            {sources.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "0.5px solid #1a1a2e",
                }}
              >
                <div style={{ fontSize: 13, color: "#7a7890", fontFamily: "Georgia, serif" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#3d3b52", fontFamily: "Georgia, serif" }}>{s.chunkCount} teachings</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <a
        href="/"
        style={{
          fontSize: 11,
          color: "#3d3b52",
          fontFamily: "Georgia, serif",
          textDecoration: "none",
          letterSpacing: "0.1em",
          position: "fixed",
          bottom: "2rem",
        }}
      >
        bell
      </a>
    </main>
  );
}
