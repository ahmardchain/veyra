import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veyra — rToken Immediacy Desk",
  description: "A read-only agent desk that prices the cost of trading rTokens while the US cash market is closed.",
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
