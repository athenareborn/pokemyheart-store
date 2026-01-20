"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            padding: "1rem",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1
              style={{
                fontSize: "6rem",
                fontWeight: "bold",
                color: "#ef444433",
                margin: 0,
                lineHeight: 1,
              }}
            >
              500
            </h1>
            <h2
              style={{
                marginTop: "1rem",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#0a0a0a",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                marginTop: "0.5rem",
                color: "#737373",
                lineHeight: 1.5,
              }}
            >
              A critical error occurred. Please try again, and if the problem
              persists, contact our support team.
            </p>
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: "#0a0a0a",
                  color: "#fafafa",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#262626")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0a0a0a")
                }
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  color: "#0a0a0a",
                  fontSize: "0.875rem",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                Go back home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
