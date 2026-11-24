import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Eyebrow from "@/components/layout/Eyebrow";
import { ARTIST_NAME } from "@/lib/brand";
import { HOME_ABOUT } from "@/lib/home";
import PortraitPlaceholder from "./PortraitPlaceholder";

export default function AboutTeaser() {
  return (
    <section className="snap-block flex items-center py-12 md:py-16 lg:min-h-[100svh]">
      <PageContainer className="w-full">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="lg:w-full lg:max-w-md lg:justify-self-end">
            <PortraitPlaceholder imagePath={HOME_ABOUT.portraitPath} />
          </div>
          <div className="max-w-lg">
            <Eyebrow>About</Eyebrow>
            <h2 className="mb-4 font-serif text-2xl text-ink md:text-3xl">{ARTIST_NAME}</h2>
            <p className="mb-6 leading-relaxed text-ink-muted">{HOME_ABOUT.statement}</p>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
            >
              About
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
