import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

/**
 * Generated Open Graph image.
 * Latin-only text is passed in by `buildMetadata` (Arabic shaping is not
 * reliable in this renderer), and the brand mark is drawn with primitives.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("t") || "BAC DZ").slice(0, 90);
  const locale = (searchParams.get("l") || "ar").toLowerCase();
  const isAr = locale === "ar";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0A1411 0%, #123328 55%, #0E5A3C 100%)",
          color: "#F6F4EC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#60CF9C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
              color: "#08140F",
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>BAC DZ</div>
            <div style={{ fontSize: 17, opacity: 0.65, marginTop: 4 }}>
              Algerian baccalaureate platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: title.length > 48 ? 52 : 64,
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: -1.2,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 20, opacity: 0.75 }}>
            <span>Verified coefficients</span>
            <span>·</span>
            <span>Calculator</span>
            <span>·</span>
            <span>Orientation</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(246,244,236,0.18)",
            paddingTop: 24,
            fontSize: 18,
            opacity: 0.7,
          }}
        >
          <span>{isAr ? "bac-dz.vercel.app" : "bac-dz.vercel.app"}</span>
          <span>Session 2027</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
