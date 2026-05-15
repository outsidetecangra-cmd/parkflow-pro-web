import "./globals.css";

import { AppSplash } from "@/components/app-splash";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Manrope } from "next/font/google";
import { ReactNode } from "react";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SmartPark | Sistema de Estacionamento",
  description: "SmartPark - conectando e simplificando o estacionamento.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/smartpark-favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-sans`}>
        <AppSplash />
        {children}
      </body>
    </html>
  );
}
