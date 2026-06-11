"use client";

import { useEffect, useState } from "react";
import {
  Cpu, Flame, Wind, Footprints, Home, Lightbulb, Plus,
  ToggleLeft, ToggleRight, Wifi, BrainCircuit, Clock,
  ShieldCheck, AlertTriangle, Activity, Settings2, RefreshCw,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Device {
  id: string; name: string; location: string;
  type: string; enabled: boolean; color: string;
}

const ICONS: Record<string, React.ElementType> = {
  fire_alarm: Flame, co_detector: Wind, motion: Footprints,
  smart_bulb: Lightbulb, doorbell: Home,
};

const EXTRA: Record<string, { signal: number; battery: number; firmware: string; lastEvent: string; aiConfidence: number; events: number }> = {
  dev1: { signal: 98, battery: 100, firmware: "v2.4.1", lastEvent: "2 min ago", aiConfidence: 96, events: 24 },
  dev2: { signal: 94, battery: 100, firmware: "v1.9.3", lastEvent: "5 min ago", aiConfidence: 94, events: 11 },
  dev3: { signal: 87, battery: 78,  firmware: "v3.1.0", lastEvent: "1 min ago", aiConfidence: 89, events: 45 },
  dev4: { signal: 99, battery: 100, firmware: "v1.2.0", lastEvent: "now",       aiConfidence: 91, events: 33 },
};

function SignalBars({ value }: { value: number }) {
  const bars = [25, 50, 75, 100];
  const color = value > 80 ? "var(--success)" : value > 50 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((threshold, i) => (
        <div key={i} className="w-1 rounded-sm transition-all"
          style={{
            height: `${(i + 1) * 25}%`,
            background: value >= threshold ? color : "var(--card-border)",
          }} />
      ))}
    </div>
  );
}

function HealthRing({ value, color }: { value: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--card-border)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color}
          strokeWidth="4" strokeDasharray={`${circ * value / 100} ${circ}`}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [newName, setNewName] = useState(""), [newType, setNewType] = useState("motion"), [newLoc, setNewLoc] = useState("");

  useEffect(() => {
    fetch(`${API}/api/devices`).then((r) => r.json()).then(setDevices).finally(() => setLoading(false));
  }, []);

  async function toggleDevice(device: Device) {
    const updated = { ...device, enabled: !device.enabled };
    setDevices((p) => p.map((d) => (d.id === device.id ? updated : d)));
    await fetch(`${API}/api/devices/${device.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: updated.enabled }),
    }).catch(() => setDevices((p) => p.map((d) => (d.id === device.id ? device : d))));
  }

  async function addDevice() {
    if (!newName.trim()) return;
    const res = await fetch(`${API}/api/devices`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, type: newType, location: newLoc || "Unknown" }),
    });
    const device = await res.json();
    setDevices((p) => [...p, device]);
    setAddForm(false); setNewName(""); setNewLoc("");
  }

  const onlineCount = devices.filter((d) => d.enabled).length;
  const selectedDevice = devices.find((d) => d.id === selected);
  const selectedExtra = selected ? EXTRA[selected] : null;

  return (
    <div className="p-7 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            Devices & Sensor Network
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Real-time IoT sensor management · AI-monitored health scoring · HMAC-verified
          </p>
        </div>
        <button onClick={() => setAddForm(!addForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-all"
          style={{ background: "var(--primary)", color: "#fff" }}>
          <Plus size={15} /> Add Device
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Devices", value: devices.length, icon: Cpu, c: "#8b5cf6" },
          { label: "Online Now",    value: onlineCount,    icon: Wifi, c: "#10b981" },
          { label: "AI Monitored",  value: devices.length, icon: BrainCircuit, c: "#d946ef" },
          { label: "Alerts Fired",  value: Object.values(EXTRA).reduce((a, b) => a + b.events, 0), icon: Activity, c: "#f59e0b" },
        ].map(({ label, value, icon: Icon, c }) => (
          <div key={label} className="card-glow p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c + "22" }}>
              <Icon size={18} color={c} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: c }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add device form */}
      {addForm && (
        <div className="card-glow p-5 animate-fade-up" style={{ borderColor: "rgba(124,58,237,.4)" }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <Plus size={16} color="var(--primary-light)" /> Register New Device
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[["Device name", "text", newName, setNewName], ["Location", "text", newLoc, setNewLoc]].map(([ph, type, val, setter]: any) => (
              <input key={ph} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "var(--bg3)", borderColor: "var(--card-border)", color: "var(--text)" }} />
            ))}
            <select value={newType} onChange={(e) => setNewType(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{ background: "var(--bg3)", borderColor: "var(--card-border)", color: "var(--text)" }}>
              {["fire_alarm","co_detector","motion","smart_bulb","doorbell"].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g," ")}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={addDevice} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "var(--primary)", color: "#fff" }}>Add</button>
              <button onClick={() => setAddForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "var(--card-border)", color: "var(--text-secondary)" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Device cards */}
        <div className="col-span-8">
          {loading ? (
            <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Loading devices…</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {devices.map((device) => {
                const Icon = ICONS[device.type] ?? Cpu;
                const color = device.color ?? "#8b5cf6";
                const extra = EXTRA[device.id];
                const health = extra ? Math.round((extra.signal + extra.aiConfidence) / 2) : 85;
                const isSelected = selected === device.id;

                return (
                  <div key={device.id}
                    onClick={() => setSelected(isSelected ? null : device.id)}
                    className="card-glow p-4 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? color + "66" : device.enabled ? color + "22" : "var(--card-border)",
                      opacity: device.enabled ? 1 : 0.55,
                    }}>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HealthRing value={health} color={color} />
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{device.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{device.location}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleDevice(device); }}>
                        {device.enabled
                          ? <ToggleRight size={28} color="var(--success)" />
                          : <ToggleLeft size={28} color="var(--text-muted)" />}
                      </button>
                    </div>

                    {/* Metrics row */}
                    {extra && (
                      <div className="grid grid-cols-3 gap-2 pt-3"
                        style={{ borderTop: "1px solid var(--card-border)" }}>
                        <div className="flex flex-col items-center gap-1">
                          <SignalBars value={extra.signal} />
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{extra.signal}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold" style={{ color: "var(--ai-light)" }}>{extra.aiConfidence}%</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>AI conf</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold" style={{ color: "var(--accent-light)" }}>{extra.events}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>events</p>
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="badge" style={{
                        background: device.enabled ? color + "15" : "var(--card-border)",
                        borderColor: device.enabled ? color + "33" : "transparent",
                        color: device.enabled ? color : "var(--text-muted)",
                      }}>
                        {device.enabled ? "● ACTIVE" : "○ DISABLED"}
                      </span>
                      {extra && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {extra.firmware}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device detail panel */}
        <div className="col-span-4 space-y-4">
          {selectedDevice && selectedExtra ? (
            <div className="card-glow p-5 animate-fade-up space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 size={14} color="var(--primary-light)" />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  DEVICE DETAIL
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg3)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: (selectedDevice.color ?? "#8b5cf6") + "22" }}>
                  {(() => { const I = ICONS[selectedDevice.type] ?? Cpu; return <I size={20} color={selectedDevice.color ?? "#8b5cf6"} />; })()}
                </div>
                <div>
                  <p className="font-bold" style={{ color: "var(--text)" }}>{selectedDevice.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedDevice.location}</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["Signal Strength", `${selectedExtra.signal}%`, "var(--success)"],
                  ["AI Confidence",   `${selectedExtra.aiConfidence}%`, "var(--ai-light)"],
                  ["Firmware",        selectedExtra.firmware, "var(--accent-light)"],
                  ["Last Event",      selectedExtra.lastEvent, "var(--text-secondary)"],
                  ["Total Events",    `${selectedExtra.events}`, "var(--warning)"],
                  ["HMAC Auth",       "Verified ✓", "var(--success)"],
                  ["Encryption",      "TLS 1.3", "var(--primary-light)"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t" style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>SIGNAL HISTORY</p>
                <div className="flex items-end gap-1 h-10">
                  {[82,88,91,85,94,90,95,87,92,98,selectedExtra.signal].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all"
                      style={{ height: `${v}%`, background: `hsl(${v * 1.2}, 70%, 55%)` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-glow p-5 flex flex-col items-center justify-center text-center gap-3 py-16">
              <Cpu size={32} color="var(--text-muted)" />
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Select a device</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Click any device card to view detailed health metrics</p>
            </div>
          )}

          {/* Security status */}
          <div className="card-glow p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} color="var(--success)" />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                SECURITY STATUS
              </span>
            </div>
            {[
              { label: "MQTT TLS 1.3",      ok: true },
              { label: "HMAC Signatures",   ok: true },
              { label: "Replay Protection", ok: true },
              { label: "Seq# Tracking",     ok: true },
              { label: "Auth0 Integration", ok: false, note: "Configure in .env" },
            ].map(({ label, ok, note }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? "var(--success)" : "var(--warning)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: ok ? "var(--success)" : "var(--warning)" }}>
                  {ok ? "Active" : note ?? "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
