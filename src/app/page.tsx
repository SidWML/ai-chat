"use client";

import { useRouter } from "next/navigation";

const versions = [
  {
    id: "default",
    label: "Default",
    version: "v1",
    route: "/chat",
    description: "Classic chat interface with clean, minimal design",
    gradient: "linear-gradient(135deg, #3C4C73 0%, #4E6089 100%)",
    features: ["Natural language queries", "Database insights", "Clean UI"],
  },
  {
    id: "v2",
    label: "Version 2",
    version: "v2",
    route: "/v2/chat",
    description: "Enhanced experience with canvas panels, charts & tables",
    gradient: "linear-gradient(135deg, #4F5D8A 0%, #6366F1 100%)",
    features: ["Interactive canvas", "Charts & graphs", "Data tables", "Code blocks"],
  },
  {
    id: "v3",
    label: "Version 3",
    version: "v3",
    route: "/v3/chat",
    description: "Modern dark-first design with advanced analytics",
    gradient: "linear-gradient(135deg, #1E2035 0%, #CF384D 100%)",
    features: ["Dark & light themes", "Canvas toggle", "Advanced charts", "Refined UX"],
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFBFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Logo + Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 48,
          animation: "ci-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #3C4C73 0%, #CF384D 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 8px 24px rgba(60, 76, 115, 0.2)",
          }}
        >
          <img src="/chat-logo.svg" alt="CInsights" style={{ width: 40, height: 40 }} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #3C4C73 0%, #4E6089 60%, #CF384D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CInsights
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#8A8880",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Select a version to explore
        </p>
      </div>

      {/* Version Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          maxWidth: 960,
          width: "100%",
        }}
      >
        {versions.map((v, i) => (
          <button
            key={v.id}
            onClick={() => router.push(v.route)}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E2DE",
              borderRadius: 16,
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              overflow: "hidden",
              transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: "0 1px 3px rgba(60, 76, 115, 0.06)",
              animation: `ci-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${150 + i * 100}ms both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(60, 76, 115, 0.12)";
              e.currentTarget.style.borderColor = "#D4D0CA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(60, 76, 115, 0.06)";
              e.currentTarget.style.borderColor = "#E5E2DE";
            }}
          >
            {/* Gradient header */}
            <div
              style={{
                height: 100,
                background: v.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {v.version}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ opacity: 0.6 }}
              >
                <path
                  d="M7 4l6 6-6 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Card body */}
            <div style={{ padding: "20px 24px 24px" }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 650,
                  color: "#1A1A1A",
                  margin: "0 0 6px",
                }}
              >
                {v.label}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#8A8880",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                }}
              >
                {v.description}
              </p>

              {/* Feature tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {v.features.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#4A4A4A",
                      background: "#F4F2EF",
                      padding: "3px 10px",
                      borderRadius: 100,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
