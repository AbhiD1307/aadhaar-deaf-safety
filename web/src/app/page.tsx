"use client";

import { useAlerts, formatEventType, riskColor } from "@/lib/AlertContext";
import AlertRow from "@/components/AlertRow";
import {
  Shield, Bell, Cpu, Activity, Flame, Wind, Footprints,
  Home as HomeIcon, Zap, Radio, Clock, BrainCircuit,
  TrendingUp, CheckCircle2, Eye, Lock, Wifi, Globe,
  ShieldCheck, AlertTriangle, Siren, BarChart2,
} from "lucide-react";
import { useState, useEffect } from "react";

const SIM = [
  { type: "fire_alarm",  label: "Fire Alarm",  icon: Flame,      color: "#ef4444", desc: "Smoke & heat sensor" },
  { type: "co_alarm",    label: "CO Alert",    icon: Wind,       color: "#f59e0b", desc: "Carbon monoxide" },
  { type: "glass_break", label: "Glass Break", icon: Zap,        color: "#8b5cf6", desc: "Acoustic detection" },
  { type: "motion",      label: "Intruder",    icon: Footprints, color: "#06b6d4", desc: "Motion + PIR" },
];

const AI_EVENTS = [
  { time: "just now",  event: "Fire Alarm classified", conf: 96, risk: "high",   color: "#ef4444" },
  { time: "2 min ago", event: "Motion detected",       conf: 89, risk: "medium", color: "#f59e0b" },
  { time: "5 min ago", event: "CO reading analyzed",   conf: 94, risk: "high",   color: "#ef4444" },
  { time: "9 min ago", event: "Doorbell recognized",   conf: 91, risk: "medium", color: "#f59e0b" },
  { time: "14 min ago",event: "Ambient noise filtered",conf: 78, risk: "low",    color: "#3b82f6" },
];

const SENSORS = [
  { name: "Fire Alarm",    loc: "Living Room", status: "Normal",    ok: true,  signal: 98, last: "0s" },
  { name: "CO Detector",   loc: "Kitchen",     status: "Normal",    ok: true,  signal: 95, last: "1s" },
  { name: "Motion Sensor", loc: "Front Door",  status: "Standby",   ok: true,  signal: 87, last: "3s" },
  { name: "Microphone",    loc: "Bedroom",     status: "Listening", ok: true,  signal: 92, last: "0s" },
  { name: "Doorbell",      loc: "Entrance",    status: "Ready",     ok: true,  signal: 99, last: "2s" },
  { name: "Smart Bulbs",   loc: "All Rooms",   status: "Connected", ok: true,  signal: 88, last: "1s" },
];

function ThreatGauge({ level }: { level: number }) {
  const color = level > 70 ? "#ef4444" : level > 40 ? "#f59e0b" : "#10b981";
  const label = level > 70 ? "HIGH" : level > 40 ? "MODERATE" : "SAFE";
  const r = 52, circ = 2 * Math.PI * r;
  const dash = circ * (level / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--card-border)" strokeWidth="8" />
          <circle cx="64" cy="64" r={r} fill="none" stroke={color}
            strokeWidth="8" strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{level}</span>
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-center" style={{ color }}>THREAT LEVEL: {label}</p>
      </div>
    </div>
  );
}

function AIConfidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { alerts, connected, dismissAlert, simulateAlert } = useAlerts();
  const [simLoading, setSimLoading] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [threatLevel, setThreatLevel] = useState(12);

  const highCount = alerts.filter((a) => a.riskLevel === "high" && !a.dismissed).length;
  const todayAlerts = alerts.filter((a) => new Date(a.timestamp).toDateString() === new Date().toDateString());
  const recentAlerts = alerts.filter((a) => !a.logOnly).slice(0, 6);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setThreatLevel(highCount > 0 ? Math.min(95, 60 + highCount * 20) : 12);
  }, [highCount]);

  async function handleSim(type: string) {
    setSimLoading(type);
    try { await simulateAlert(type, "Living Room"); } catch {}
    setSimLoading(null);
  }

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="p-7 space-y-5 max-w-[1400px] mx-auto w-full">

      {/* ── Top header bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={14} color="var(--accent)" />
            <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>aadhaar.deaf.com</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "var(--primary-glow)", color: "var(--primary-light)" }}>
              AI-POWERED
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            AI Security Command Center
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Real-time emergency awareness for deaf & hard-of-hearing users · Gemini 1.5 Flash engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-lg font-black" style={{ color: "var(--accent-light)" }}>{time}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${connected ? "animate-glow" : ""}`}
            style={{
              background: connected ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
              borderColor: connected ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)",
            }}>
            <div className="ripple-dot w-2.5 h-2.5 rounded-full"
              style={{ color: connected ? "var(--success)" : "var(--danger)",
                       background: connected ? "var(--success)" : "var(--danger)" }} />
            <div>
              <p className="text-sm font-black" style={{ color: connected ? "var(--success)" : "var(--danger)" }}>
                {connected ? "All Systems Live" : "Reconnecting…"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>WebSocket · MQTT · AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Threat Level",    value: highCount > 0 ? "ACTIVE" : "ALL CLEAR", sub: `${highCount} active threat${highCount !== 1 ? "s" : ""}`,  icon: Shield,      c: highCount > 0 ? "#ef4444" : "#10b981" },
          { label: "Today's Events",  value: todayAlerts.length,  sub: `${todayAlerts.filter(a=>a.riskLevel==="high").length} high-risk`,               icon: Bell,        c: "#f59e0b" },
          { label: "Sensors Online",  value: "6 / 6",             sub: "100% uptime",                                                                   icon: Cpu,         c: "#10b981" },
          { label: "AI Accuracy",     value: "94.7%",             sub: "Gemini 1.5 Flash",                                                              icon: BrainCircuit,c: "#d946ef" },
          { label: "Avg Latency",     value: "<780ms",            sub: "Sensor → alert",                                                                icon: Activity,    c: "#06b6d4" },
        ].map(({ label, value, sub, icon: Icon, c }, i) => (
          <div key={label} className="card-glow p-4 relative overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 blur-2xl opacity-30"
              style={{ background: c }} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c + "22" }}>
                <Icon size={14} color={c} />
              </div>
            </div>
            <p className="text-xl font-black relative z-10" style={{ color: c }}>{value}</p>
            <p className="text-xs mt-0.5 relative z-10" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Threat gauge */}
        <div className="col-span-3 card-glow p-5 flex flex-col items-center justify-between gap-4 scan-container animate-fade-up">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <Siren size={14} color="var(--danger)" />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                AI THREAT SCORE
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Real-time risk composite from all active sensors
            </p>
          </div>
          <ThreatGauge level={threatLevel} />
          <div className="w-full space-y-2">
            <AIConfidenceBar label="Fire detection" value={96} color="#ef4444" />
            <AIConfidenceBar label="CO detection"   value={94} color="#f59e0b" />
            <AIConfidenceBar label="Motion AI"      value={89} color="#3b82f6" />
            <AIConfidenceBar label="Sound AI"       value={91} color="#8b5cf6" />
          </div>
        </div>

        {/* Sensor grid */}
        <div className="col-span-4 card-glow p-5 flex flex-col animate-fade-up delay-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye size={14} color="var(--accent)" />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                LIVE SENSOR NETWORK
              </span>
            </div>
            <span className="badge" style={{ background: "rgba(16,185,129,.1)", borderColor: "rgba(16,185,129,.3)", color: "var(--success)" }}>
              6 ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {SENSORS.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:brightness-110"
                style={{ background: "var(--bg3)", border: "1px solid var(--card-border)" }}>
                <div className="relative flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.ok ? "var(--success)" : "var(--danger)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{s.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.loc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: s.ok ? "var(--success)" : "var(--danger)" }}>
                    {s.status}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {s.signal}% · {s.last} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI event feed */}
        <div className="col-span-5 card-glow p-5 flex flex-col animate-fade-up delay-2">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={14} color="var(--ai-light)" />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              AI CLASSIFICATION FEED
            </span>
            <span className="ml-auto badge animate-live"
              style={{ background: "var(--ai-glow)", borderColor: "rgba(217,70,239,.3)", color: "var(--ai-light)" }}>
              LIVE
            </span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {AI_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--bg3)", border: `1px solid ${ev.color}22` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: ev.color + "18" }}>
                  <BrainCircuit size={14} color={ev.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{ev.event}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="progress-bar flex-1" style={{ height: "3px" }}>
                      <div className="progress-fill" style={{ width: `${ev.conf}%`, background: ev.color }} />
                    </div>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: ev.color }}>{ev.conf}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="badge" style={{ background: ev.color + "18", borderColor: ev.color + "33", color: ev.color }}>
                    {ev.risk}
                  </span>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator */}
        <div className="col-span-4 card-glow p-5 flex flex-col animate-fade-up delay-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} color="#f59e0b" />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              DEMO SIMULATOR
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Fire a real event through the full AI pipeline: MQTT → Gemini → fan-out.
          </p>
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {SIM.map(({ type, label, icon: Icon, color, desc }) => (
              <button key={type} onClick={() => handleSim(type)}
                disabled={!!simLoading}
                className="flex flex-col items-start gap-2.5 p-4 rounded-xl border transition-all hover:scale-[1.03] hover:brightness-110 disabled:opacity-50"
                style={{ background: color + "0c", borderColor: color + "25" }}>
                <Icon size={20} color={color} />
                <div>
                  <p className="text-xs font-black" style={{ color }}>
                    {simLoading === type ? "Firing…" : label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="col-span-8 card-glow p-5 animate-fade-up delay-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} color="var(--primary-light)" />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                RECENT EVENTS
              </span>
            </div>
            <a href="/alerts" className="text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary-light)" }}>
              View all →
            </a>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(16,185,129,.1)" }}>
                <ShieldCheck size={24} color="var(--success)" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No events detected</p>
              <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
                System is actively monitoring. Use the Demo Simulator to test the AI pipeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {recentAlerts.map((a) => <AlertRow key={a.id} alert={a} onDismiss={dismissAlert} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
