import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project 1: Dynamic UI Generator",
  description: "Learn LangGraph + Generative UI with shadcn/ui",
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
