import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Propalyst Property Search",
  description: "Propalyst Property Search",
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
