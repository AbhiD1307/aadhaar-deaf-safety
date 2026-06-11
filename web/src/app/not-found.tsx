"use client";

import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-10 text-center" style={{ minHeight: "60vh" }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)" }}>
        <AlertTriangle size={36} color="#ef4444" />
      </div>
      <p className="text-6xl font-black mb-2" style={{ color: "var(--text)" }}>404</p>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Page Not Found</h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--text-secondary)" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80"
        style={{ background: "var(--primary)", color: "#fff" }}>
        <Home size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
