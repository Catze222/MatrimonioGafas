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
  icons: {
    icon: "https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/ChatGPT%20Image%2030%20sept%202025,%2009_31_09%20p.m..png",
    apple: "https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/ChatGPT%20Image%2030%20sept%202025,%2009_31_09%20p.m..png",
  },
  openGraph: {
    title: "Alejandra & Jaime - Boda 2025",
    description: "¡Nos casamos! Celebra con nosotros este día tan especial - 13 de Diciembre, 2025",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/ChatGPT%20Image%2030%20sept%202025,%2009_31_09%20p.m..png",
        width: 1200,
        height: 630,
        alt: "Alejandra & Jaime - Boda 2025",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alejandra & Jaime - Boda 2025",
    description: "¡Nos casamos! Celebra con nosotros este día tan especial - 13 de Diciembre, 2025",
    images: ["https://elhwpjjmfjlkpibyxuje.supabase.co/storage/v1/object/public/productos/ChatGPT%20Image%2030%20sept%202025,%2009_31_09%20p.m..png"],
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
