import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ana & Carlos - Boda 2025",
  description: "¡Nos casamos! Celebra con nosotros este día tan especial - 15 de Febrero, 2025",
  keywords: "boda, matrimonio, Ana, Carlos, 2025, invitación, RSVP",
  authors: [{ name: "Ana & Carlos" }],
  openGraph: {
    title: "Ana & Carlos - Boda 2025",
    description: "¡Nos casamos! Celebra con nosotros este día tan especial",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
