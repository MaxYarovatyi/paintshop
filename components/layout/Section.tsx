import PageContainer from "./PageContainer";
import Eyebrow from "./Eyebrow";

export default function Section({
    eyebrow,
    title,
    muted=false,
    children,
}: {
    eyebrow?:string;
    title?: string;
    muted?: boolean;
    children: React.ReactNode
}) {
    return (
        <section className={`py-12 md:py-20 ${muted ? "bg-canvas-muted": ""}`}>
            <PageContainer>
                {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                {title && <h2 className="font-serif text-2s1 md:text-3xl mb-8 text-ink">{title}</h2>}
                {children}
            </PageContainer>
        </section>
    )
}