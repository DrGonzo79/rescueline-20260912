import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "RescueLine — Missed call recovery queue", description: "A fictional demo for triaging opportunities missed by AI receptionists." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
