// components/home/StatsRow.tsx
const stats = [
  { label: "Originals", value: "One of a kind" },
  { label: "Ships to", value: "Ukraine · Europe · USA" },
  { label: "Based in", value: "Ukraine" },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {stats.map((s) => (
        <div key={s.label} className="border-t border-canvas-border pt-4">
          <p className="text-xs uppercase tracking-[0.15em] text-ink-muted mb-1">{s.label}</p>
          <p className="font-serif text-lg text-ink">{s.value}</p>
        </div>
      ))}
    </div>
  );
}