import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans-variable",
  subsets: ["latin", "cyrillic"],
});

const serif = Fraunces({
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
