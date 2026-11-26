import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import { HOME_LINES } from "@/lib/home";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";

/** What the artist makes. `fallbackPaintingPath` fills the Paintings column when it has no image of its own. */
export default function LinesBlock({ fallbackPaintingPath }: { fallbackPaintingPath?: string | null }) {
  return (
    <section className="snap-block flex items-center py-12 md:py-16 lg:min-h-[100svh]">
      <PageContainer className="w-full">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {HOME_LINES.map((line) => {
            const path = line.imagePath ?? (line.key === "paintings" ? fallbackPaintingPath : null);
            return (
              <div key={line.key}>
                <div className="relative mb-5 aspect-[4/5] max-h-[60svh] w-full md:max-h-[50svh]">
                  {path ? (
                    <Image
                      src={getPaintingImageUrl(path)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[12rem] w-full items-center justify-center border border-canvas-border text-sm text-ink-muted">
                      Coming soon
                    </div>
                  )}
                </div>
                <h2 className="mb-2 font-serif text-xl text-ink">{line.title}</h2>
                <p className="mb-3 text-sm leading-relaxed text-ink-muted">{line.text}</p>
                <Link
                  href={line.href}
                  className="inline-flex min-h-11 items-center text-sm text-ink underline-offset-4 hover:underline"
                >
                  {line.linkLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
