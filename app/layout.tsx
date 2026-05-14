import "@/app/globals.css";
import { IBM_Plex_Sans, Manrope } from "next/font/google";
import { ReactNode } from "react";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"]
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-sans`}>{children}</body>
    </html>
  );
}

