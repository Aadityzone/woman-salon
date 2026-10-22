import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison Belle | Beauty, Hair & Bridal Studio",
  description:
    "Discover considered beauty, hair, skin and bridal services at Maison Belle. Your beauty, your moment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}