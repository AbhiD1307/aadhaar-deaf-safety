"use client";

import { useAlerts, formatEventType } from "@/lib/AlertContext";
import { AlertTriangle, X, Send, Flame, Wind, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const ICONS: Record<string, React.ElementType> = {
  fire_alarm: Flame, co_alarm: Wind,
};

export default function EmergencyBanner() {
  const { activeEmergency, clearEmergency } = useAlerts();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!activeEmergency) return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      [0, 0.25, 0.5].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch {}
    return () => { audioCtxRef.current?.close(); };
  }, [activeEmergency?.id]);

  if (!activeEmergency) return null;

  const Icon = ICONS[activeEmergency.eventType] ?? ShieldAlert;

  return (
    <div className="animate-emergency flex items-center gap-4 px-6 py-3.5 z-50 relative border-b"
      style={{ borderColor: "#ef444433" }}
    >
      {/* Pulse icon */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#ef444422" }}>
          <Icon size={16} color="#ef4444" className="animate-pulse" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-black text-white text-sm">
          ⚠️ {formatEventType(activeEmergency.eventType).toUpperCase()}
        </span>
        <span className="text-red-300 text-sm ml-3">
          {activeEmergency.location} · {new Date(activeEmergency.timestamp).toLocaleTimeString()}
        </span>
        <span className="ml-3 text-xs text-red-400">{activeEmergency.summary}</span>
      </div>

      <Link
        href="/sos"
        className="flex items-center gap-2 text-sm font-black px-5 py-2 rounded-xl transition-all hover:scale-105"
        style={{ background: "#fff", color: "#7f1d1d" }}
      >
        <Send size={13} />
        SOS
      </Link>
      <button
        onClick={clearEmergency}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-300 hover:text-white hover:bg-red-900/40 transition-all"
        title="Dismiss (false alarm)"
      >
        <X size={16} />
      </button>
    </div>
  );
}
