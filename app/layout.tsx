import type { Metadata } from "next";
import "./veyra-v2.css";

export const metadata: Metadata = {
  title: "Veyra ClosePrint — What survives Monday?",
  description: "A session-aware rToken research desk for after-hours events, visible-book cost and Monday re-anchor sensitivity.",
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
