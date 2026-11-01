import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison Restaurant & Kitchen",
  description: "A refined restaurant ordering and billing experience.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
