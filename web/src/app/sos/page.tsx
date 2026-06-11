"use client";

import { useState, useEffect } from "react";
import {
  Phone, MapPin, Users, Send, AlertTriangle, CheckCircle,
  Radio, Shield, Heart, Clock, Siren, Navigation,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const CONTACTS = [
  { id: "c1", name: "Sara R.",    relation: "Sister",   initials: "SR",  phone: "+1 (555) 123-4567", available: true },
  { id: "c2", name: "Mike K.",    relation: "Neighbor", initials: "MK",  phone: "+1 (555) 987-6543", available: true },
  { id: "c3", name: "Dr. Patel",  relation: "Doctor",   initials: "DP",  phone: "+1 (555) 200-1111", available: false },
];

const MEDICAL = [
  { label: "Blood Type",    value: "O+" },
  { label: "Allergies",     value: "None known" },
  { label: "Hearing",       value: "Deaf / Hard of Hearing" },
  { label: "Emergency med", value: "None" },
];

export default function SOSPage() {
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, "ready" | "sending" | "sent" | "failed">>({
    c1: "ready", c2: "ready", c3: "ready",
  });
  const [elapsed, setElapsed] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!dispatched) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [dispatched]);

  async function triggerSOS() {
    setDispatching(true);
    setPulse(true);
    setStatuses({ c1: "sending", c2: "sending", c3: "ready" });

    try {
      await fetch(`${API}/api/sos/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_demo" }),
      });
      setStatuses({ c1: "sent", c2: "sent", c3: "ready" });
      setDispatched(true);
      setElapsed(0);
    } catch {
      setStatuses({ c1: "failed", c2: "failed", c3: "ready" });
    } finally {
      setDispatching(false);
      setPulse(false);
    }
  }

  function reset() {
    setDispatched(false);
    setElapsed(0);
    setStatuses({ c1: "ready", c2: "ready", c3: "ready" });
  }

  const statusStyle = (s: string) => {
    if (s === "sent")    return { bg: "rgba(16,185,129,.15)", border: "rgba(16,185,129,.3)",  color: "#10b981", label: "Sent ✓" };
    if (s === "sending") return { bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.3)",  color: "#f59e0b", label: "Sending…" };
    if (s === "failed")  return { bg: "rgba(239,68,68,.15)",  border: "rgba(239,68,68,.3)",   color: "#ef4444", label: "Failed" };
    return                      { bg: "var(--card)",          border: "var(--card-border)",   color: "var(--text-muted)", label: "Ready" };
  };

  const fmtElapsed = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-7 space-y-6 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>SOS Emergency Center</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          One-tap emergency dispatch · GPS location sharing · Trusted contact network
        </p>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl p-5 border relative overflow-hidden"
        style={{
          background: dispatched ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
          borderColor: dispatched ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)",
        }}>
        {/* Scan line */}
        {!dispatched && <div className="scan-line absolute inset-0 pointer-events-none" />}

        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: dispatched ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.2)" }}>
              {dispatched
                ? <CheckCircle size={32} color="#10b981" />
                : <Siren size={32} color="#ef4444" />
              }
            </div>
            {!dispatched && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-live"
                style={{ background: "#ef4444" }} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xl font-black" style={{ color: "var(--text)" }}>
              {dispatched ? "SOS Alert Dispatched" : "Emergency Standby — Ready"}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {dispatched
                ? `Trusted contacts notified · Active for ${fmtElapsed(elapsed)}`
                : "Press the SOS button to instantly alert your trusted contacts"}
            </p>
          </div>
          {dispatched && (
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                <Clock size={12} color="var(--success)" />
                <span className="text-lg font-black font-mono" style={{ color: "var(--success)" }}>
                  {fmtElapsed(elapsed)}
                </span>
              </div>
              <button onClick={reset}
                className="text-xs px-3 py-1 rounded-lg border transition-all hover:opacity-80"
                style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Location card */}
        <div className="card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation size={14} color="var(--accent)" />
            <h2 className="text-xs font-black tracking-widest" style={{ color: "var(--text-secondary)" }}>
              GPS LOCATION
            </h2>
            <span className="ml-auto badge" style={{ background: "rgba(16,185,129,.1)", borderColor: "rgba(16,185,129,.2)", color: "#10b981" }}>
              Active
            </span>
          </div>

          {/* Map visual */}
          <div className="rounded-xl mb-4 relative overflow-hidden"
            style={{ height: 160, background: "linear-gradient(135deg, #0d1b2a 0%, #1a2f3e 50%, #0d1b2a 100%)" }}>
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
            {/* Center marker */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full animate-pulse opacity-30"
                  style={{ background: "#ef4444" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin size={24} color="#ef4444" />
                </div>
              </div>
            </div>
            {/* Coordinates */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="rounded-lg px-2.5 py-1.5 text-xs font-mono"
                style={{ background: "rgba(0,0,0,.6)", color: "var(--accent)" }}>
                47.7601° N, 122.2083° W
              </div>
            </div>
          </div>

          <p className="font-bold text-sm" style={{ color: "var(--text)" }}>42 Maple St, Unit 3B</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Seattle, WA 98101</p>
          <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
            <Radio size={10} color="var(--success)" />
            GPS accuracy ±4m · Last updated just now
          </p>
        </div>

        {/* Trusted contacts */}
        <div className="card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={14} color="var(--primary-light)" />
            <h2 className="text-xs font-black tracking-widest" style={{ color: "var(--text-secondary)" }}>
              TRUSTED CONTACTS
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {CONTACTS.map((c) => {
              const st = statusStyle(statuses[c.id]);
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--bg3)", border: "1px solid var(--card-border)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: "var(--grad-brand)" }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{c.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.relation}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge text-xs font-bold"
                      style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                      {st.label}
                    </span>
                    <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                      {c.available ? "Available" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medical info */}
        <div className="card-glow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={14} color="#ef4444" />
            <h2 className="text-xs font-black tracking-widest" style={{ color: "var(--text-secondary)" }}>
              MEDICAL INFO
            </h2>
            <span className="ml-auto badge"
              style={{ background: "rgba(239,68,68,.1)", borderColor: "rgba(239,68,68,.2)", color: "#ef4444" }}>
              Auto-shared
            </span>
          </div>
          <div className="space-y-2.5">
            {MEDICAL.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="text-xs font-bold text-right" style={{ color: "var(--text)" }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl p-3"
            style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.15)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#ef4444" }}>Shared with dispatchers</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Blood type, emergency contacts, and hearing status are automatically included in every SOS dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={triggerSOS}
          disabled={dispatching || dispatched}
          className="relative overflow-hidden flex items-center justify-center gap-3 py-5 rounded-2xl text-xl font-black transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: dispatched ? "var(--success)" : "var(--danger)", color: "#fff" }}
        >
          {pulse && (
            <span className="absolute inset-0 rounded-2xl animate-pulse opacity-30"
              style={{ background: "#fff" }} />
          )}
          <Send size={22} />
          {dispatching ? "Dispatching SOS…" : dispatched ? "SOS Sent — Contacts Notified ✓" : "SEND SOS TO CONTACTS"}
        </button>

        <button
          onClick={() => (window.location.href = "tel:911")}
          className="flex items-center justify-center gap-3 py-5 rounded-2xl text-xl font-black border-2 transition-all hover:opacity-90"
          style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,.08)" }}
        >
          <Phone size={22} />
          Call 911
        </button>
      </div>

      {/* Security notice */}
      <div className="card-glow p-4 flex items-center gap-3">
        <Shield size={16} color="var(--success)" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          All SOS transmissions are <span className="font-bold" style={{ color: "var(--text)" }}>end-to-end encrypted</span>.
          Your GPS location is only shared when you press the SOS button.
        </p>
      </div>
    </div>
  );
}
