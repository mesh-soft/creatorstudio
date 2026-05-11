"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTenantPage() {
  const router = useRouter();
  const [type, setType] = useState<"doctor" | "hospital">("doctor");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (input: string) => {
    return input
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create tenant");
      }

      // Navigate to the new tenant's creator studio
      router.push(`/creator/${type}/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "Inter, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#1e293b",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <a
            href="/creator/doctor/dr-amit-sharma"
            style={{ color: "#60a5fa", textDecoration: "none", fontSize: "14px" }}
          >
            ← Back to Creator Studio
          </a>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px" }}>
          Create New Tenant
        </h1>

        {error && (
          <div
            style={{
              background: "#ef4444",
              color: "white",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#94a3b8",
              }}
            >
              Tenant Type
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setType("doctor")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: type === "doctor" ? "#2296F3" : "#334155",
                  background: type === "doctor" ? "#2296F3" : "transparent",
                  color: type === "doctor" ? "white" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setType("hospital")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: type === "hospital" ? "#2296F3" : "#334155",
                  background: type === "hospital" ? "#2296F3" : "transparent",
                  color: type === "hospital" ? "white" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Hospital
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="name"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#94a3b8",
              }}
            >
              {type === "doctor" ? "Doctor Name" : "Hospital Name"} *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={type === "doctor" ? "Dr. John Smith" : "City Care Hospital"}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="slug"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#94a3b8",
              }}
            >
              URL Slug *
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dr-john-smith"
              required
              pattern="[a-z0-9-_]+"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
              This will be the URL: /site/{slug}/home
            </p>
          </div>

          <div
            style={{
              background: "#334155",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            <strong style={{ color: "#e2e8f0" }}>What will be created:</strong>
            <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
              <li>Folder: content/{type}s/{slug}/</li>
              <li>site/index.json (Site Settings template)</li>
              <li>pages/home.json (Page template)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !slug}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#334155" : "#2296F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Tenant"}
          </button>
        </form>
      </div>
    </div>
  );
}
