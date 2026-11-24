import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Eyebrow from "@/components/layout/Eyebrow";
import { HOME_DESIGNERS } from "@/lib/home";

export default function DesignersBlock() {
  return (
    <section className="snap-block flex items-center bg-canvas-muted py-12 md:py-16 lg:min-h-[100svh]">
      <PageContainer className="w-full">
        <div className="max-w-2xl">
          <Eyebrow>{HOME_DESIGNERS.eyebrow}</Eyebrow>
          <h2 className="mb-6 font-serif text-2xl text-ink md:text-4xl">{HOME_DESIGNERS.heading}</h2>
          <div className="mb-8 space-y-3 leading-relaxed text-ink-muted">
            {HOME_DESIGNERS.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <Link
            href={HOME_DESIGNERS.href}
            className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
          >
            {HOME_DESIGNERS.linkLabel}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
