"use client";

import { useState } from "react";
import { useAlerts, RiskLevel } from "@/lib/AlertContext";
import AlertRow from "@/components/AlertRow";
import { Bell, BrainCircuit, CheckCircle, Filter, TrendingUp } from "lucide-react";

type Filter = "all" | RiskLevel | "dismissed";

export default function AlertsPage() {
  const { alerts, dismissAlert } = useAlerts();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: alerts.length,
    high: alerts.filter((a) => a.riskLevel === "high").length,
    medium: alerts.filter((a) => a.riskLevel === "medium").length,
    low: alerts.filter((a) => a.riskLevel === "low").length,
    dismissed: alerts.filter((a) => a.dismissed).length,
  };
  const unresolved = alerts.filter((a) => !a.dismissed).length;

  const filtered =
    filter === "all" ? alerts :
    filter === "dismissed" ? alerts.filter((a) => a.dismissed) :
    alerts.filter((a) => a.riskLevel === filter);

  const TABS: { key: Filter; label: string; color: string; count: number }[] = [
    { key: "all",       label: "All Events",   color: "var(--primary)",  count: counts.all },
    { key: "high",      label: "High Risk",    color: "#ef4444",         count: counts.high },
    { key: "medium",    label: "Medium",       color: "#f59e0b",         count: counts.medium },
    { key: "low",       label: "Low",          color: "#3b82f6",         count: counts.low },
    { key: "dismissed", label: "Resolved",     color: "#10b981",         count: counts.dismissed },
  ];

  return (
    <div className="p-7 space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            Alert History
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Real-time emergency feed · AI-classified · {unresolved} unresolved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card-glow px-4 py-2.5 flex items-center gap-2">
            <BrainCircuit size={14} color="var(--ai-light)" />
            <span className="text-xs font-bold" style={{ color: "var(--ai-light)" }}>
              Gemini AI Active
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Events",   value: counts.all,       color: "var(--primary-light)", icon: Bell },
          { label: "High Risk",      value: counts.high,      color: "#ef4444",              icon: TrendingUp },
          { label: "Unresolved",     value: unresolved,       color: "#f59e0b",              icon: Filter },
          { label: "Resolved",       value: counts.dismissed, color: "#10b981",              icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card-glow p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: color + "1a" }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ key, label, color, count }) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={
                active
                  ? { background: color + "22", color, borderColor: color + "55" }
                  : { background: "var(--card)", color: "var(--text-secondary)", borderColor: "var(--card-border)" }
              }>
              {label}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
                style={{
                  background: active ? color + "33" : "var(--bg3)",
                  color: active ? color : "var(--text-muted)",
                }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="card-glow text-center py-20 space-y-3">
            <Bell size={36} color="var(--text-dim)" className="mx-auto" />
            <p className="font-bold" style={{ color: "var(--text-secondary)" }}>No alerts in this category</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Use the simulator on the Dashboard to trigger test events
            </p>
          </div>
        ) : (
          filtered.map((a) => <AlertRow key={a.id} alert={a} onDismiss={dismissAlert} />)
        )}
      </div>
    </div>
  );
}
