import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://joedytools.com'),
  title: {
    default: "JoedyTools - PDF Tools for Everyone",
    template: "%s | JoedyTools"
  },
  description: "Complete PDF management solution for everyone. Merge, split, compress, convert, and process PDFs with ease — secure, fast, and private.",
  keywords: ["PDF tools", "PDF converter", "PDF merger", "OCR", "compress PDF", "document tools", "global"],
  authors: [{ name: "JoedyTools Team" }],
  creator: "JoedyTools",
  publisher: "JoedyTools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "JoedyTools - PDF Tools for Everyone",
    description: "Complete PDF management solution for everyone. Free, secure, and local processing.",
    url: "https://joedytools.com",
    siteName: "JoedyTools",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'JoedyTools Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "JoedyTools - PDF Tools for Everyone",
    description: "Complete PDF management solution",
    images: ['/android-chrome-512x512.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://joedytools.com',
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "JoedyTools",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "124"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
