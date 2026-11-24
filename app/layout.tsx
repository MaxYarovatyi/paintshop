import type { Metadata } from "next";
import { Newsreader, Instrument_Sans} from "next/font/google";
import { SHOP_NAME, TAGLINE, SITE_URL } from "@/lib/brand";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const sans = Instrument_Sans({
  variable: "--font-sans-variable",
  subsets: ["latin"],
});

const serif = Newsreader({
  variable: "--font-serif-variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SHOP_NAME, template: `%s | ${SHOP_NAME}` },
  description: TAGLINE,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
