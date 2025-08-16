import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Orbitron } from "next/font/google";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ETH NYC - D-Corp",
  description: "D-Corp Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const fontBrand = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`dark ${fontBrand.variable} bg-background text-foreground`}
    >
      <body className={cn("min-h-screen font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
