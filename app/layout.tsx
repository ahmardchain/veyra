import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veyra ClosePrint — Session-aware rToken research",
  description: "An AI Trading Desk that turns after-hours events into a session-aware Monday re-anchor brief for rToken traders.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
