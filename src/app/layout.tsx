import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protein Journey & Crosstalk",
  description: "An interactive visualization of protein biology and interactions.",
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
