export default function NotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "4rem", margin: "0 0 1rem 0" }}>404</h1>
            <h2 style={{ fontSize: "1.5rem", margin: "0 0 1rem 0" }}>Page Not Found</h2>
            <p style={{ margin: "0 0 2rem 0", color: "#666" }}>The page you are looking for does not exist.</p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
