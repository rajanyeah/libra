import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "libra",
  description: "libra — a personal life log",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
