import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0D0D0D",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #7C3AED, #a855f7)",
              borderRadius: "16px",
              width: "72px",
              height: "72px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            Q
          </div>
          <span
            style={{
              color: "#F9FAFB",
              fontSize: "56px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #7C3AED, #a855f7)",
              backgroundClip: "text",
            }}
          >
            QuorumForge
          </span>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "24px", textAlign: "center", maxWidth: "700px" }}>
          Trustless N-of-M maintainer boards on Stellar Soroban
        </p>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #7C3AED, #a855f7, #10B981)",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
