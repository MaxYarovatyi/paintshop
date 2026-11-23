import type { Metadata } from "next";
import { Inter, Fraunces, Newsreader, Instrument_Sans} from "next/font/google";
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
  title: "Gallery",
  description: "Original paintings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="bg-canvas textink antialiased">{children}</body>
    </html>
  );
}
