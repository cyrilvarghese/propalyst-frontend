'use client'
import type { Metadata } from "next";
import { useEffect } from 'react';
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import { initMixpanel } from '../lib/mixpanel-client';
export const metadata: Metadata = {
  title: "Propalyst Property Search",
  description: "Propalyst Property Search",
  icons: {
    icon: '/icon.png',
  },
};
useEffect(() => {
  initMixpanel(); // Initialize Mixpanel
}, []);
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="G-Z4XJK7SZM6" />
      <body >{children}</body>
    </html>
  );
}
