"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "announcement" | "success" | "error";
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    // Initialize lastChecked to now so we only show NEW announcements
    setLastChecked(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!lastChecked) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/announcements/latest?since=${encodeURIComponent(lastChecked)}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.announcements && data.announcements.length > 0) {
          const newToasts: Toast[] = data.announcements.map(
            (a: { _id: string; message: string }) => ({
              id: a._id,
              message: a.message,
              type: "announcement" as const,
            })
          );

          setToasts((prev) => [...newToasts, ...prev]);
          setLastChecked(new Date().toISOString());

          // Auto-dismiss each toast after 8 seconds
          newToasts.forEach((toast) => {
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 8000);
          });
        }
      } catch {
        // Silently fail on polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastChecked]);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      style={{ maxWidth: "380px" }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-fade-in-up rounded-2xl p-4 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(18, 18, 30, 0.98))",
            border: "1px solid var(--accent-primary)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(233, 69, 96, 0.25), 0 0 60px rgba(233, 69, 96, 0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                style={{
                  background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                }}
              >
                📢
              </div>
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: "var(--accent-primary)" }}
              >
                Announcement
              </span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>

          {/* Message */}
          <p
            className="text-sm leading-relaxed font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {toast.message}
          </p>

          {/* Progress bar (auto-dismiss indicator) */}
          <div className="mt-3 h-0.5 overflow-hidden rounded-full" style={{ background: "var(--bg-secondary)" }}>
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                animation: "shrinkWidth 8s linear forwards",
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
