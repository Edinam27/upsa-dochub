import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "UPSA DocHub - PDF Tools for Students",
  description: "Complete PDF management solution for University of Professional Studies, Accra (UPSA) students. Merge, split, compress, convert, and process PDFs with ease.",
  keywords: "PDF tools, UPSA, University of Professional Studies Accra, student tools, PDF converter, PDF merger",
  authors: [{ name: "UPSA DocHub Team" }],
  robots: "index, follow",
  openGraph: {
    title: "UPSA DocHub - PDF Tools for Students",
    description: "Complete PDF management solution for UPSA students",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
