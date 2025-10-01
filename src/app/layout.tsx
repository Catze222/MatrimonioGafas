import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
