export default function DetailsGrid({
    medium, widthCm, heightCm, yearCreated
} : {
    medium: string;
    widthCm: number;
    heightCm: number;
    yearCreated: number | null;
}) {
    const items = [
        {label: "Medium", value: medium},
        {label: "Size", value: `${widthCm} x ${heightCm} cm`},
        ...(yearCreated ? [{label: "Year", value: String(yearCreated)}] : [])
    ]

    return (
        <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-canvas-border">
            {items.map((item)=> (
                <div key={item.label}>
                    <p className="text-xs uppercase tracking-wide text-ink-muted mb-1">{item.label}</p>
                    <p className="text-sm text-ink">{item.value}</p>
                </div>
            ))}
        </div>
    );
}