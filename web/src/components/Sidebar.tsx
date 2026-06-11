"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bell, Cpu, AlertOctagon, User,
  BarChart3, Info, Network, Shield, BrainCircuit,
} from "lucide-react";
import { useAlerts } from "@/lib/AlertContext";

const NAV_MAIN = [
  { href: "/",             icon: LayoutDashboard, label: "Dashboard",    tag: null },
  { href: "/alerts",       icon: Bell,            label: "Alerts",       tag: "unread" },
  { href: "/devices",      icon: Cpu,             label: "Devices",      tag: null },
  { href: "/analytics",    icon: BarChart3,        label: "Analytics",    tag: null },
  { href: "/sos",          icon: AlertOctagon,    label: "SOS Center",   tag: null },
];

const NAV_SYSTEM = [
  { href: "/architecture", icon: Network,       label: "Architecture" },
  { href: "/about",        icon: Info,          label: "About" },
  { href: "/profile",      icon: User,          label: "Profile" },
];

export default function Sidebar() {
  const path = usePathname();
  const { connected, alerts } = useAlerts();
  const unread = alerts.filter((a) => !a.dismissed && a.riskLevel === "high").length;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full relative"
      style={{ background: "var(--bg2)", borderRight: "1px solid var(--card-border)" }}>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--primary-mid), var(--accent), transparent)" }} />

      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid var(--card-border)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black glow-primary animate-glow"
            style={{ background: "var(--grad-brand)" }}>
            <span className="relative z-10">A</span>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-gradient-brand">aadhaar</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Deaf Safety · AI Platform</p>
          </div>
        </div>

        {/* Domain badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-live flex-shrink-0"
            style={{ background: connected ? "var(--success)" : "var(--danger)" }} />
          <span className="text-xs font-mono truncate"
            style={{ color: connected ? "var(--accent-light)" : "var(--danger)" }}>
            aadhaar.deaf.com
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-px overflow-y-auto">
        <p className="text-xs font-bold px-2 py-1.5 tracking-widest" style={{ color: "var(--text-dim)" }}>MONITORING</p>
        {NAV_MAIN.map(({ href, icon: Icon, label, tag }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href}
              className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
              style={{
                background: active ? "var(--primary-glow)" : "transparent",
                color: active ? "var(--primary-light)" : "var(--text-secondary)",
              }}>
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "var(--primary-light)" }} />
              )}
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {tag === "unread" && unread > 0 && (
                <span className="text-xs font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: "var(--danger)", color: "#fff" }}>
                  {unread}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-2 mx-2 border-t" style={{ borderColor: "var(--card-border)" }} />
        <p className="text-xs font-bold px-2 py-1.5 tracking-widest" style={{ color: "var(--text-dim)" }}>SYSTEM</p>
        {NAV_SYSTEM.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "var(--primary-glow)" : "transparent",
                color: active ? "var(--primary-light)" : "var(--text-muted)",
              }}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Engine status */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--card-border)" }}>
        <div className="rounded-xl p-3 mb-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={13} color="var(--ai-light)" />
            <span className="text-xs font-bold" style={{ color: "var(--ai-light)" }}>Gemini AI Engine</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--success-glow)", color: "var(--success)" }}>
              Active
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "87%", background: "var(--grad-ai)" }} />
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>87% avg confidence</p>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: "var(--grad-brand)" }}>
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>Abhishek Deshmukh</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>🏆 UW Hackathon</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
