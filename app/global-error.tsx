"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
          textAlign: "center",
          background: "#f9fafb",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "2.5rem",
            maxWidth: "480px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "#111" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              We encountered an unexpected error. Please try again.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.625rem 1.5rem",
                  background: "#FFB70F",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "0.625rem 1.5rem",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
