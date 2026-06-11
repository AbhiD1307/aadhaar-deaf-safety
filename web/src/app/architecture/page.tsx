"use client";

import { Shield, Lock, BrainCircuit, Radio, Network, Zap, Server, Smartphone, Globe, Eye, AlertTriangle, ShieldCheck, KeyRound, Fingerprint, Cpu } from "lucide-react";

const PIPELINE = [
  { step: "01", label: "IoT Sensor Event",    desc: "Physical sensor detects smoke/CO/motion/sound",                        color: "#10b981", icon: Cpu },
  { step: "02", label: "Edge Filtering",      desc: "Hardware threshold check before MQTT publish",                         color: "#10b981", icon: Eye },
  { step: "03", label: "HMAC-SHA256 Sign",    desc: "Device signs payload with shared secret + seq#",                       color: "#f59e0b", icon: KeyRound },
  { step: "04", label: "TLS 1.3 Publish",    desc: "Encrypted MQTT message to broker on port 1883",                       color: "#f59e0b", icon: Lock },
  { step: "05", label: "Broker Verify",       desc: "HMAC check + replay protection + client auth",                        color: "#8b5cf6", icon: ShieldCheck },
  { step: "06", label: "Gemini AI Classify",  desc: "LLM classifies event type + risk score + confidence",                 color: "#d946ef", icon: BrainCircuit },
  { step: "07", label: "Risk Threshold",      desc: "High/medium → fan-out. Low → log only.",                              color: "#8b5cf6", icon: AlertTriangle },
  { step: "08", label: "Multi-Channel Out",   desc: "Simultaneous: WebSocket + SMS + Push + Smart Home",                   color: "#06b6d4", icon: Zap },
];

const ZONES = [
  {
    id: "edge", label: "EDGE ZONE", sub: "Untrusted by default",
    color: "#10b981", bg: "rgba(16,185,129,.05)", border: "rgba(16,185,129,.2)",
    components: [
      { name: "Fire Sensor",   desc: "Smoke + heat detection", icon: "🔥" },
      { name: "CO Detector",   desc: "Gas level monitoring",   icon: "💨" },
      { name: "Mic Array",     desc: "Sound event capture",    icon: "🎙️" },
      { name: "Motion PIR",    desc: "Intruder detection",     icon: "🚶" },
      { name: "Doorbell",      desc: "Visitor detection",      icon: "🔔" },
    ],
  },
  {
    id: "backend", label: "SECURE BACKEND", sub: "Zero-trust enforced",
    color: "#8b5cf6", bg: "rgba(139,92,246,.05)", border: "rgba(139,92,246,.2)",
    components: [
      { name: "MQTT Broker",   desc: "Aedes + TLS + HMAC auth",       icon: "📡" },
      { name: "Gemini 1.5",    desc: "AI event classification",        icon: "🧠" },
      { name: "Event Router",  desc: "Fan-out logic + priority queue", icon: "🔀" },
      { name: "Auth0 / JWT",   desc: "Zero-trust identity layer",      icon: "🔐" },
      { name: "Data Store",    desc: "Encrypted at rest + audit log",  icon: "🗄️" },
    ],
  },
  {
    id: "output", label: "TRUSTED OUTPUT", sub: "Authenticated users only",
    color: "#06b6d4", bg: "rgba(6,182,212,.05)", border: "rgba(6,182,212,.2)",
    components: [
      { name: "Android App",   desc: "Full-screen alert + biometrics", icon: "📱" },
      { name: "Smartwatch",    desc: "Haptic SOS vibration pattern",   icon: "⌚" },
      { name: "Smart Bulbs",   desc: "Flash pattern + color code",     icon: "💡" },
      { name: "Contacts SMS",  desc: "Twilio + location sharing",      icon: "📞" },
      { name: "911 Dispatch",  desc: "GPS + medical info on SOS",      icon: "🚨" },
    ],
  },
];

const SECURITY_LAYERS = [
  {
    title: "Layer 1 — Physical Security",
    color: "#10b981",
    items: [
      "Hardware tamper detection on sensor nodes",
      "Sensor firmware signing and secure boot",
      "Physical access control to MQTT broker server",
      "Network segmentation: IoT VLAN isolated from main LAN",
    ],
  },
  {
    title: "Layer 2 — Transport Security",
    color: "#f59e0b",
    items: [
      "TLS 1.3 encryption on all MQTT connections",
      "Certificate pinning on IoT devices",
      "HMAC-SHA256 per-message integrity signatures",
      "Sequence numbers to prevent replay attacks",
    ],
  },
  {
    title: "Layer 3 — Application Security",
    color: "#8b5cf6",
    items: [
      "JWT authentication on all REST endpoints",
      "RBAC: user / caregiver / admin roles",
      "Rate limiting: 200 req/15min per IP",
      "Input validation and SQL injection protection",
    ],
  },
  {
    title: "Layer 4 — AI Security",
    color: "#d946ef",
    items: [
      "Adversarial input detection on sensor streams",
      "Confidence threshold gating (< 60% → manual review)",
      "Model output validation before alert dispatch",
      "Audit log of every AI classification decision",
    ],
  },
  {
    title: "Layer 5 — Data Security",
    color: "#06b6d4",
    items: [
      "AES-256 encryption at rest for all user data",
      "Medical info encrypted with user-derived key",
      "GDPR-compliant data handling and retention",
      "Zero-knowledge architecture for sensitive fields",
    ],
  },
  {
    title: "Layer 6 — Operational Security",
    color: "#ef4444",
    items: [
      "Auth0 for enterprise-grade identity management",
      "Multi-factor authentication for admin access",
      "Full audit trail for all emergency dispatches",
      "SOC 2 Type II compliance roadmap",
    ],
  },
];

const TECH = [
  { layer: "Mobile App",      tech: "React Native + Expo",    detail: "iOS & Android · Biometric auth",      c: "#3b82f6" },
  { layer: "Web Dashboard",   tech: "Next.js 16 + Tailwind",  detail: "App Router · Real-time WebSocket",    c: "#06b6d4" },
  { layer: "Backend API",     tech: "Node.js + Express",      detail: "REST · Rate-limited · JWT auth",      c: "#10b981" },
  { layer: "Real-time",       tech: "Socket.IO v4",           detail: "WebSocket · Fan-out · Auto-reconnect",c: "#8b5cf6" },
  { layer: "IoT Protocol",    tech: "MQTT (Aedes)",           detail: "TLS 1.3 · HMAC · Anti-replay",        c: "#f59e0b" },
  { layer: "AI Engine",       tech: "Google Gemini 1.5 Flash",detail: "Event classify · Risk scoring",       c: "#d946ef" },
  { layer: "SMS Gateway",     tech: "Twilio",                 detail: "Emergency contact notification",      c: "#ef4444" },
  { layer: "Push Notif",      tech: "Firebase FCM",           detail: "Android + iOS · High priority",       c: "#f97316" },
  { layer: "Identity",        tech: "JWT / Auth0-ready",      detail: "RBAC · OAuth 2.0 · Zero-trust",       c: "#06b6d4" },
  { layer: "Encryption",      tech: "AES-256 + TLS 1.3",     detail: "Data at rest + in transit",           c: "#8b5cf6" },
];

export default function ArchitecturePage() {
  return (
    <div className="p-7 space-y-7 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>
          System Architecture
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Three-zone zero-trust security model · AI-powered event pipeline · Defense-in-depth approach
        </p>
      </div>

      {/* Alert pipeline */}
      <div className="card-glow p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} color="var(--accent)" />
          <h2 className="font-bold" style={{ color: "var(--text)" }}>AI Alert Pipeline — 8-Step Flow</h2>
          <span className="badge ml-auto" style={{ background: "rgba(6,182,212,.1)", borderColor: "rgba(6,182,212,.3)", color: "var(--accent-light)" }}>
            ~780ms end-to-end
          </span>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {PIPELINE.map(({ step, label, desc, color, icon: Icon }, i) => (
            <div key={step} className="relative flex flex-col">
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border flex-1"
                style={{ background: color + "08", borderColor: color + "25" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: color + "22" }}>
                  <Icon size={15} color={color} />
                </div>
                <span className="text-xs font-black" style={{ color }}>{step}</span>
                <p className="text-xs font-bold text-center leading-tight" style={{ color: "var(--text)" }}>{label}</p>
                <p className="text-xs text-center leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 text-xs"
                  style={{ color: "var(--text-muted)" }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Three-zone diagram */}
      <div className="space-y-3">
        <h2 className="font-bold" style={{ color: "var(--text)" }}>Three-Zone Security Architecture</h2>
        {ZONES.map((zone) => (
          <div key={zone.id} className="rounded-2xl p-5 border"
            style={{ background: zone.bg, borderColor: zone.border }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-6 rounded-full" style={{ background: zone.color }} />
              <div>
                <p className="font-black text-sm" style={{ color: zone.color }}>{zone.label}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{zone.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {zone.components.map((c) => (
                <div key={c.name} className="card-glow p-3 hover:brightness-110 transition-all">
                  <div className="text-xl mb-2">{c.icon}</div>
                  <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{c.name}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Defense in depth */}
      <div>
        <h2 className="font-bold mb-4" style={{ color: "var(--text)" }}>
          Defense-in-Depth Security Model (6 Layers)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {SECURITY_LAYERS.map(({ title, color, items }) => (
            <div key={title} className="card-glow p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: color + "22" }}>
                  <Shield size={16} color={color} />
                </div>
                <h3 className="font-bold text-sm" style={{ color }}>{title}</h3>
              </div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="font-bold mb-4" style={{ color: "var(--text)" }}>Full Technology Stack</h2>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--card2)", borderBottom: "1px solid var(--card-border)" }}>
                {["Layer", "Technology", "Details"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TECH.map((row, i) => (
                <tr key={row.layer}
                  className="transition-colors hover:brightness-110"
                  style={{ background: i % 2 === 0 ? "var(--card)" : "var(--bg3)", borderBottom: "1px solid var(--card-border)" }}>
                  <td className="px-5 py-3.5">
                    <span className="badge" style={{ background: row.c + "18", borderColor: row.c + "33", color: row.c }}>
                      {row.layer}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "var(--text)" }}>{row.tech}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat model */}
      <div className="card-glow p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} color="var(--danger)" />
          <h2 className="font-bold" style={{ color: "var(--text)" }}>Threat Model & Mitigations</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              threat: "Replay Attacks", risk: "High",
              mitigation: "Sequence number tracking per device ID. Messages older than 30s or with duplicate seq# are dropped immediately.",
              c: "#ef4444",
            },
            {
              threat: "Message Tampering", risk: "High",
              mitigation: "HMAC-SHA256 signature on every payload. Server recomputes and compares before processing. Mismatch = drop + log.",
              c: "#ef4444",
            },
            {
              threat: "Rogue Device", risk: "High",
              mitigation: "Device registry whitelist. Unknown deviceIds rejected at broker. Auth0 machine-to-machine tokens in production.",
              c: "#ef4444",
            },
            {
              threat: "AI Poisoning", risk: "Medium",
              mitigation: "Gemini output validated against schema. Low-confidence results (<60%) flagged for review. Rule-based fallback.",
              c: "#f59e0b",
            },
            {
              threat: "API Abuse", risk: "Medium",
              mitigation: "Rate limiting 200 req/15min per IP. JWT expiry enforcement. Helmet.js security headers on all responses.",
              c: "#f59e0b",
            },
            {
              threat: "Data Breach", risk: "Medium",
              mitigation: "AES-256 at rest. Medical info uses user-derived key. No sensitive data in logs. GDPR-compliant retention.",
              c: "#f59e0b",
            },
          ].map(({ threat, risk, mitigation, c }) => (
            <div key={threat} className="p-4 rounded-xl border"
              style={{ background: c + "05", borderColor: c + "20" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm" style={{ color: c }}>{threat}</p>
                <span className="badge" style={{ background: c + "18", borderColor: c + "33", color: c }}>
                  {risk}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{mitigation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
