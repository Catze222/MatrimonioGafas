import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Alejandra & Jaime - Boda 2025",
  description: "¡Nos casamos! Celebra con nosotros este día tan especial - 13 de Diciembre, 2025",
  keywords: "boda, matrimonio, Alejandra, Jaime, 2025, invitación, RSVP",
  authors: [{ name: "Alejandra & Jaime" }],
  openGraph: {
    title: "Alejandra & Jaime - Boda 2025",
    description: "¡Nos casamos! Celebra con nosotros este día tan especial - 13 de Diciembre, 2025",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alejandra & Jaime - Boda 2025",
    description: "¡Nos casamos! Celebra con nosotros este día tan especial - 13 de Diciembre, 2025",
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
        className={`${playfair.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: 'var(--font-montserrat)' }}
      >
        {children}
      </body>
    </html>
  );
}
