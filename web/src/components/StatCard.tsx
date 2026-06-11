import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: "up" | "down" | "stable";
}

export default function StatCard({ label, value, sublabel, icon: Icon, iconColor = "#8b5cf6", iconBg = "#8b5cf622" }: Props) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-3"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>{value}</p>
        {sublabel && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
      </div>
    </div>
  );
}
