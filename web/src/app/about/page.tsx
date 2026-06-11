"use client";

import { Mail, Heart, Zap, Shield, Users } from "lucide-react";

const FEATURES = [
  { icon: "🔥", title: "AI-Powered Detection", desc: "Google Gemini 1.5 Flash classifies 8+ emergency event types including fire alarms, CO leaks, glass breaks, and intruders with confidence scoring and risk levels." },
  { icon: "📡", title: "MQTT IoT Gateway", desc: "Secure MQTT broker with TLS 1.3, HMAC-SHA256 message signing, and sequence-number replay protection. Zero-trust at the edge layer." },
  { icon: "⚡", title: "Multi-Channel Alerting", desc: "Simultaneous delivery to Android app, smartwatch haptics, smart bulb flash patterns, SMS to trusted contacts — all within under 1 second." },
  { icon: "🚨", title: "One-Tap SOS Dispatch", desc: "Sends GPS location, emergency details, and medical information to trusted contacts via SMS. One more tap calls 911 directly." },
  { icon: "👁️", title: "Accessibility-First Design", desc: "Every screen built for deaf and hard-of-hearing users: high contrast, large text, clear visual hierarchy, no reliance on sound at any step." },
  { icon: "🔐", title: "Zero-Trust Security", desc: "Three-zone security model: untrusted edge, secure backend, trusted output. JWT auth, RBAC, and Auth0-ready identity layer." },
];

const IMPACT_STATS = [
  { value: "430M", label: "People with disabling hearing loss worldwide", color: "#8b5cf6" },
  { value: "1 in 6", label: "People affected by hearing loss globally", color: "#06b6d4" },
  { value: "<1s", label: "Sensor to full-screen alert latency", color: "#10b981" },
  { value: "8+", label: "Emergency event types detected by AI", color: "#f59e0b" },
];

const TIMELINE = [
  { time: "Hour 1", title: "Problem definition", desc: "Identified the gap: no unified system for deaf emergency awareness" },
  { time: "Hour 2", title: "Architecture design", desc: "Designed 3-zone security model and alert pipeline" },
  { time: "Hour 3-5", title: "Backend + MQTT", desc: "Built IoT gateway with HMAC signing and Gemini AI classifier" },
  { time: "Hour 6-9", title: "Mobile app", desc: "React Native app with all 8 screens and real-time WebSocket" },
  { time: "Hour 10-12", title: "Web dashboard", desc: "Next.js dashboard with analytics, SOS dispatch, live monitoring" },
  { time: "Demo", title: "Won 🏆", desc: "Presented to judges and won UW Hackathon" },
];

export default function AboutPage() {
  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <div
        className="rounded-3xl p-10 relative overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--accent)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{ background: "#f59e0b11", borderColor: "#f59e0b33", color: "#f59e0b" }}>
              🏆 UW Hackathon Winner
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span className="text-gradient">aadhar</span>
          </h1>
          <p className="text-xl font-light mb-2" style={{ color: "var(--text-secondary)" }}>
            Making every emergency visible.
          </p>
          <p className="text-sm max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Disabling hearing loss affects <strong style={{ color: "var(--text)" }}>430 million people</strong> globally.
            In an emergency, a fire alarm, carbon monoxide leak, or intruder can be completely inaccessible to them.
            Aadhar turns any emergency into instant visual and tactile alerts — unifying detection, alerting,
            smart-home control, and emergency dispatch into one accessible platform.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              The Hindi word <em>Aadhār</em> means <strong style={{ color: "var(--text)" }}>"foundation"</strong> —
              a dependable safety foundation for the deaf community.
            </p>
          </div>
        </div>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-4 gap-4">
        {IMPACT_STATS.map(({ value, label, color }) => (
          <div key={value} className="rounded-2xl p-5 border text-center"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-3xl font-black mb-2" style={{ color }}>{value}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-black mb-5" style={{ color: "var(--text)" }}>What Aadhar Does</h2>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-5 border"
              style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Build timeline */}
      <div>
        <h2 className="text-2xl font-black mb-5" style={{ color: "var(--text)" }}>Built in 12 Hours</h2>
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "var(--card-border)" }} />
          {TIMELINE.map((item, i) => (
            <div key={item.time} className={`relative pb-6 ${i === TIMELINE.length - 1 ? "pb-0" : ""}`}>
              <div
                className="absolute -left-6 top-0 w-3 h-3 rounded-full border-2 transform -translate-x-1/2"
                style={{
                  background: i === TIMELINE.length - 1 ? "#f59e0b" : "var(--primary)",
                  borderColor: i === TIMELINE.length - 1 ? "#f59e0b" : "var(--primary-light)",
                }}
              />
              <div className="ml-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--primary-glow)", color: "var(--primary-light)" }}>
                    {item.time}
                  </span>
                  <span className="font-bold text-sm" style={{ color: "var(--text)" }}>{item.title}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creator card */}
      <div
        className="rounded-3xl p-8 border relative overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--primary)" }} />

        <h2 className="text-2xl font-black mb-6 relative z-10" style={{ color: "var(--text)" }}>
          About the Creator
        </h2>

        <div className="flex items-start gap-6 relative z-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
            style={{ background: "var(--gradient-hero)" }}
          >
            AD
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black" style={{ color: "var(--text)" }}>Abhishek Deshmukh</h3>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-secondary)" }}>
              Software Engineer · UW Bothell · UW Hackathon Winner 🏆
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
              Built Aadhar to address a real accessibility gap — one that affects over 430 million people globally.
              The project combines IoT security, real-time AI classification, and accessible UX design
              to create a unified safety platform that can genuinely improve lives for deaf and hard-of-hearing users
              in homes, workplaces, schools, and public spaces.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:deshmukh.abhishek152@gmail.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                <Mail size={15} />
                deshmukh.abhishek152@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgements */}
      <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <h2 className="font-bold mb-3" style={{ color: "var(--text)" }}>Built With</h2>
        <div className="flex flex-wrap gap-2">
          {["React Native", "Expo", "Next.js 16", "Node.js", "Express", "MQTT (Aedes)", "Socket.IO",
            "Google Gemini AI", "Twilio", "Firebase FCM", "Auth0", "Tailwind CSS", "Recharts",
            "TypeScript", "JWT", "HMAC-SHA256"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: "var(--bg2)", color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
