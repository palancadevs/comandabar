import type { Metadata } from "next";
import { Baloo_2, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const comandaDisplay = Baloo_2({
  variable: "--font-comanda-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const comandaBody = Montserrat({
  variable: "--font-comanda-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "COMANDA | Pedidos QR con presencia de marca",
  description:
    "Sistema de comandas QR para locales gastronómicos que buscan operar mejor y verse distinto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${comandaDisplay.variable} ${comandaBody.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
