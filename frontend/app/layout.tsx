import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eccelso by Sharkawy | Luxury Car Rental Cairo",
  description:
    "Experience premium luxury car rental in Cairo, Egypt. Supercars, exotic vehicles, and luxury sedans available for daily rental.",
  keywords: "luxury car rental, Cairo, Egypt, supercar, Ferrari, Lamborghini, Rolls-Royce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} bg-luxury-black text-cream antialiased`}>
        {children}
      </body>
    </html>
  );
}
