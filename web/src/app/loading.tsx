export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4" style={{ minHeight: "50vh" }}>
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--primary) transparent transparent transparent" }} />
        <div className="absolute inset-2 rounded-full flex items-center justify-center text-base font-black"
          style={{ background: "var(--grad-brand)" }}>
          A
        </div>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
    </div>
  );
}
