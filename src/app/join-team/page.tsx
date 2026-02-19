"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JoinTeamPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user already has a team, redirect to dashboard
  if (session?.user?.teamId) {
    router.push("/dashboard");
    return null;
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: teamName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join team");
        setLoading(false);
        return;
      }

      // Update the session with team info
      await update();
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
      <div className="animate-fade-in-up w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              boxShadow: "0 8px 32px var(--accent-glow)",
            }}
          >
            🤝
          </div>
          <h1 className="mb-2 text-3xl font-bold">
            <span className="gradient-text">Join Your Team</span>
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Welcome, <strong>{session?.user?.name || "Detective"}</strong>!<br />
            Enter your team name to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="glass rounded-2xl p-8">
          <div className="mb-6">
            <label
              htmlFor="teamName"
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Alpha Detectives"
              className="input-field text-lg"
              required
              autoFocus
            />
          </div>

          {error && (
            <div
              className="mb-4 rounded-lg px-4 py-3 text-center text-sm"
              style={{
                background: "rgba(255, 82, 82, 0.1)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !teamName.trim()}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Joining...
              </span>
            ) : (
              "Join Team"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          If you are the team leader, your login email will be matched automatically.
          <br />
          Otherwise, enter the exact team name given by your organizer.
        </p>
      </div>
    </div>
  );
}
