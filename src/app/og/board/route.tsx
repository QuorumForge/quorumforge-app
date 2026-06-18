import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const boardName = searchParams.get("name") ?? "QuorumForge Board";
  const threshold = searchParams.get("threshold") ?? "?";
  const members = searchParams.get("members") ?? "?";
  const network = searchParams.get("network") ?? "testnet";
  const executed = searchParams.get("executed") ?? "0";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0D0D0D",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #7C3AED, #a855f7)",
              borderRadius: "8px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Q
          </div>
          <span style={{ color: "#9CA3AF", fontSize: "18px" }}>QuorumForge</span>
          <div
            style={{
              marginLeft: "auto",
              background: network === "mainnet" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
              color: network === "mainnet" ? "#10B981" : "#F59E0B",
              borderRadius: "999px",
              padding: "4px 14px",
              fontSize: "14px",
            }}
          >
            {network}
          </div>
        </div>

        {/* Board name */}
        <h1
          style={{
            color: "#F9FAFB",
            fontSize: "52px",
            fontWeight: "bold",
            lineHeight: 1.1,
            margin: "0 0 24px",
          }}
        >
          {boardName}
        </h1>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "40px", marginTop: "auto" }}>
          <div>
            <div style={{ color: "#7C3AED", fontSize: "32px", fontWeight: "bold" }}>
              {threshold}-of-{members}
            </div>
            <div style={{ color: "#6B7280", fontSize: "16px", marginTop: "4px" }}>
              Signature Threshold
            </div>
          </div>
          <div>
            <div style={{ color: "#10B981", fontSize: "32px", fontWeight: "bold" }}>
              {executed}
            </div>
            <div style={{ color: "#6B7280", fontSize: "16px", marginTop: "4px" }}>
              Proposals Executed
            </div>
          </div>
        </div>

        {/* Bottom progress bar decoration */}
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
