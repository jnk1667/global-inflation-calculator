export default function NotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>Page not found</p>
          <a
            href="/"
            style={{
              color: "#0070f3",
              textDecoration: "none",
              marginTop: "1rem",
            }}
          >
            ← Back to calculator
          </a>
        </div>
      </body>
    </html>
  )
}
