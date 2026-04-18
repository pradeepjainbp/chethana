import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AuthProvider from "@/components/AuthProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chethana · ಚೇತನ",
  description: "A personal health companion for mindful fasting, breath, gut wisdom, and yoga.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <main className="min-h-screen pb-20" suppressHydrationWarning>
            {children}
          </main>
          <BottomNav />
          <footer style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            textAlign: 'center', padding: '4px 0 6px',
            fontSize: '0.65rem', color: 'var(--ink-soft)',
            pointerEvents: 'none', zIndex: 0,
          }}>
            <a href="/disclaimer" style={{ pointerEvents: 'auto', color: 'var(--ink-soft)', textDecoration: 'none' }}>
              Educational tool only · Not medical advice
            </a>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
