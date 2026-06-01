import type { Metadata } from "next";
import { Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-head",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CalendarioMorbido — Eventi cicloturistici in Italia",
  description:
    "Calendario degli eventi cicloturistici non competitivi in Italia. Scopri, salva e proponi pedalate.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${caveat.variable} ${patrickHand.variable}`}>
      <body className="font-body">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
          <Header />
          <main className="flex-1 px-4 pb-16 pt-4">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
