"use client";

import { AlertEvent, formatEventType, riskColor } from "@/lib/AlertContext";
import { Flame, Wind, Footprints, Home, ShieldAlert, Baby, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ICONS: Record<string, React.ElementType> = {
  fire_alarm: Flame, co_alarm: Wind, glass_break: ShieldAlert,
  intruder: ShieldAlert, motion: Footprints, doorbell: Home, baby_cry: Baby,
};

const RISK_LABEL: Record<string, string> = { high: "HIGH RISK", medium: "MEDIUM", low: "LOW" };
const RISK_BG: Record<string, string> = {
  high: "rgba(239,68,68,.1)", medium: "rgba(245,158,11,.1)", low: "rgba(59,130,246,.1)",
};

interface Props {
  alert: AlertEvent;
  onDismiss?: (id: string) => void;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  if (d.toDateString() === new Date(now.getTime() - 86400000).toDateString()) return "Yesterday";
  return d.toLocaleDateString();
}

export default function AlertRow({ alert, onDismiss }: Props) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICONS[alert.eventType] ?? ShieldAlert;
  const color = riskColor(alert.riskLevel);
  const isHigh = alert.riskLevel === "high" && !alert.dismissed;

  return (
    <div
      className="rounded-2xl border transition-all"
      style={{
        background: alert.dismissed ? "var(--bg2)" : RISK_BG[alert.riskLevel],
        borderColor: isHigh ? color + "44" : "var(--card-border)",
        opacity: alert.dismissed ? 0.5 : 1,
      }}
    >
      {/* High risk accent bar */}
      {isHigh && (
        <div className="h-0.5 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      )}

      <div className="flex items-center gap-4 px-4 py-3.5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: color + "22" }}>
          <Icon size={18} color={color} />
          {isHigh && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-live"
              style={{ background: color }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: "var(--text)" }}>
              {formatEventType(alert.eventType)}
            </p>
            <span className="badge text-xs font-black"
              style={{ background: color + "18", borderColor: color + "33", color }}>
              {RISK_LABEL[alert.riskLevel]}
            </span>
            {alert.dismissed && (
              <span className="badge text-xs" style={{ background: "rgba(16,185,129,.1)", borderColor: "rgba(16,185,129,.2)", color: "#10b981" }}>
                RESOLVED
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
            {alert.location} · {alert.summary}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Clock size={10} color="var(--text-dim)" />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatTimestamp(alert.timestamp)}
              </span>
            </div>
            {(alert as any).confidence && (
              <p className="text-xs mt-0.5" style={{ color: "var(--ai-light)" }}>
                {Math.round((alert as any).confidence * 100)}% AI confidence
              </p>
            )}
          </div>

          {!alert.dismissed && onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "#10b98120", border: "1px solid #10b98133" }}
              title="Mark resolved"
            >
              <Check size={13} color="#10b981" />
            </button>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {expanded
              ? <ChevronUp size={13} color="var(--text-muted)" />
              : <ChevronDown size={13} color="var(--text-muted)" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="rounded-xl p-3.5 space-y-2"
            style={{ background: "var(--bg3)", border: "1px solid var(--card-border)" }}>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p style={{ color: "var(--text-dim)" }}>Event ID</p>
                <p className="font-mono mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {alert.id.slice(0, 12)}…
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-dim)" }}>Device</p>
                <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {(alert as any).deviceId ?? "sensor-01"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-dim)" }}>Risk Level</p>
                <p className="font-bold mt-0.5" style={{ color }}>
                  {alert.riskLevel.toUpperCase()}
                </p>
              </div>
            </div>
            {(alert as any).actions?.length > 0 && (
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>Recommended Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {(alert as any).actions.map((a: string) => (
                    <span key={a} className="badge text-xs"
                      style={{ background: color + "12", borderColor: color + "25", color }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
