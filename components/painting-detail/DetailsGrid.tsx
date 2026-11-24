export default function DetailsGrid({
  medium,
  widthCm,
  heightCm,
  yearCreated,
}: {
  medium: string;
  widthCm: number;
  heightCm: number;
  yearCreated: number | null;
}) {
  const items = [
    { label: "Medium", value: medium },
    { label: "Size", value: `${widthCm} x ${heightCm} cm` },
    ...(yearCreated ? [{ label: "Year", value: String(yearCreated) }] : []),
  ];

  return (
    <dl className="text-sm">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between gap-6 py-3 border-b border-canvas-border"
        >
          <dt className="text-ink-muted">{item.label}</dt>
          <dd className="text-ink text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
