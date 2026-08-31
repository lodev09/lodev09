import { ImageResponse } from "next/og"
import profile from "@/data/profile.json"

export const alt = `${profile.name} — ${profile.role}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#f5f5f7",
        }}
      >
        <div
          style={{
            width: 72,
            height: 10,
            borderRadius: 5,
            background: "#3a3a3c",
            marginBottom: 56,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar}
          alt=""
          width={144}
          height={144}
          style={{ borderRadius: 72, marginBottom: 40 }}
        />
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2 }}>{profile.name}</div>
        <div style={{ fontSize: 32, color: "#98989d", marginTop: 16 }}>
          {`${profile.role} at ${profile.company.name}`}
        </div>
      </div>
    ),
    size
  )
}
