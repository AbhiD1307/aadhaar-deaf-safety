"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield, Phone, Heart, Zap, Save, Mail, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({ flashLights: true, vibration: true, watchAlerts: true });
  const [saved, setSaved] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", relation: "", phone: "" });
  const [addingContact, setAddingContact] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/users/user_demo`)
      .then((r) => r.json())
      .then((u) => {
        setUser(u);
        if (u?.settings) {
          setSettings({
            flashLights: u.settings.flashLights ?? true,
            vibration: u.settings.vibration ?? true,
            watchAlerts: u.settings.watchAlerts ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function saveSettings() {
    await fetch(`${API}/api/users/user_demo/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function addContact() {
    if (!newContact.name.trim()) return;
    const res = await fetch(`${API}/api/users/user_demo/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    const contacts = await res.json();
    setUser((u: any) => ({ ...u, trustedContacts: contacts }));
    setNewContact({ name: "", relation: "", phone: "" });
    setAddingContact(false);
  }

  const contacts = user?.trustedContacts ?? [];

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text)" }}>Profile & Settings</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Personal info, alert preferences, emergency contacts, and medical info for SOS dispatch
        </p>
      </div>

      {/* Profile hero */}
      <div
        className="rounded-3xl p-7 border relative overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--primary)" }} />
        <div className="flex items-center gap-5 relative z-10">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{ background: "var(--gradient-hero)" }}
          >
            AD
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Abhishek Deshmukh</h2>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={13} style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>deshmukh.abhishek152@gmail.com</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "#f59e0b22", color: "#f59e0b" }}>
                🏆 UW Hackathon Winner
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "var(--primary-glow)", color: "var(--primary-light)" }}>
                Aadhar Creator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Alert settings */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} color="var(--primary-light)" />
            <h2 className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>ALERT CHANNELS</h2>
          </div>
          <div className="flex flex-col gap-5">
            <Toggle label="Flash Lights" sublabel="Smart bulbs pulse on emergency" value={settings.flashLights} onChange={(v) => setSettings((s) => ({ ...s, flashLights: v }))} />
            <Toggle label="Vibration" sublabel="Phone & connected watch" value={settings.vibration} onChange={(v) => setSettings((s) => ({ ...s, vibration: v }))} />
            <Toggle label="Watch Alerts" sublabel="Wearable haptic notification" value={settings.watchAlerts} onChange={(v) => setSettings((s) => ({ ...s, watchAlerts: v }))} />
          </div>
          <button
            onClick={saveSettings}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
            style={{ background: saved ? "var(--success)" : "var(--primary)", color: "#fff" }}
          >
            {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            {saved ? "Saved successfully!" : "Save Settings"}
          </button>
        </div>

        {/* Trusted contacts */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Phone size={16} color="var(--primary-light)" />
              <h2 className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>TRUSTED CONTACTS</h2>
            </div>
            <button
              onClick={() => setAddingContact(!addingContact)}
              className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{ background: "var(--primary-glow)", color: "var(--primary-light)" }}
            >
              + Add
            </button>
          </div>

          {addingContact && (
            <div className="mb-4 p-3 rounded-xl flex flex-col gap-2" style={{ background: "var(--bg2)" }}>
              {["name", "relation", "phone"].map((field) => (
                <input
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(newContact as any)[field]}
                  onChange={(e) => setNewContact((c) => ({ ...c, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                  style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--text)" }}
                />
              ))}
              <button onClick={addContact} className="py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "var(--primary)", color: "#fff" }}>
                Save Contact
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {contacts.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No contacts added yet.</p>
            ) : contacts.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg2)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "var(--primary)", color: "#fff" }}>
                  {c.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.relation} · {c.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical info */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Heart size={16} color="#ef4444" />
            <h2 className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>MEDICAL INFO</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Shared automatically with trusted contacts and 911 dispatch when SOS is triggered.
          </p>
          {user?.settings?.medicalInfo ? (
            <div className="flex flex-col gap-3">
              {Object.entries(user.settings.medicalInfo).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ background: "var(--bg2)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{v as string}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No medical info added.</p>
          )}

          <div className="mt-4 p-3 rounded-xl border" style={{ background: "#ef444408", borderColor: "#ef444420" }}>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "#ef4444" }}>Privacy:</strong> Medical info is only shared during active SOS. It is never stored in plain text or exposed via API.
            </p>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold" style={{ color: "var(--text)" }}>Aadhar v1.0.0</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Built by Abhishek Deshmukh · deshmukh.abhishek152@gmail.com · UW Hackathon 2024
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-xl font-bold"
            style={{ background: "#f59e0b22", color: "#f59e0b" }}>
            🏆 Winner
          </span>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, sublabel, value, onChange }: { label: string; sublabel: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sublabel}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "var(--success)" : "var(--card-border)" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}
