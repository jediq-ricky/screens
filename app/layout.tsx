import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCREENS - Video Control System",
  description: "Multi-device video display and control application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
