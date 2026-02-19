"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

/**
 * SessionGuard - Polls the server every 10 seconds to check if this session
 * is still the active one. If another device has logged in for this team,
 * shows a modal and forces sign-out.
 */
export default function SessionGuard() {
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await fetch("/api/auth/validate-session");
        if (!res.ok) return;

        const data = await res.json();

        if (!data.valid && data.reason === "session-replaced") {
          setKicked(true);
          // Auto sign-out after 5 seconds
          setTimeout(() => {
            signOut({ callbackUrl: "/" });
          }, 5000);
        }
      } catch {
        // Silently fail on network errors
      }
    }

    // Check immediately on mount
    validateSession();

    // Then poll every 10 seconds
    const interval = setInterval(validateSession, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!kicked) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center animate-fade-in-up"
        style={{
          background: "linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(18, 18, 30, 0.99))",
          border: "1px solid var(--danger)",
          boxShadow: "0 8px 48px rgba(255, 82, 82, 0.3)",
        }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{
            background: "rgba(255, 82, 82, 0.15)",
            border: "2px solid var(--danger)",
          }}
        >
          🚫
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--danger)" }}>
          Session Expired
        </h2>

        {/* Message */}
        <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Another device has logged in with your team account.
          <br />
          <strong style={{ color: "var(--text-primary)" }}>
            Only one device can be active at a time.
          </strong>
        </p>

        {/* Auto-redirect notice */}
        <p className="mb-6 text-xs" style={{ color: "var(--text-muted)" }}>
          You will be redirected to the login page in 5 seconds...
        </p>

        {/* Manual button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
          style={{
            background: "var(--danger)",
            color: "#fff",
          }}
        >
          Sign Out Now
        </button>
      </div>
    </div>
  );
}
