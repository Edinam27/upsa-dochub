import type { Metadata, Viewport } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://joedytools.com'),
  title: {
    default: "JoedyTools - PDF Tools for Everyone",
    template: "%s | JoedyTools"
  },
  description: "JoedyTools offers a complete suite of free, secure, and fast PDF tools. Easily merge, split, compress, convert PDF to Word/Excel, extract OCR text, and process documents locally in your browser.",
  keywords: [
    "PDF tools", "free PDF editor", "PDF converter", "merge PDF", "split PDF", "compress PDF", 
    "PDF to Word", "PDF to Excel", "PDF to PowerPoint", "OCR text extraction", "secure PDF tools",
    "local PDF processing", "browser based PDF editor", "document management", "JoedyTools"
  ],
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
    "@graph": [
      {
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
      },
      {
        "@type": "WebSite",
        "name": "JoedyTools",
        "url": "https://joedytools.com",
        "description": "Free, secure, and fast PDF tools for everyone.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://joedytools.com/tools?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
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
      <body className={`antialiased ${spaceMono.variable} ${inter.variable}`} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col font-sans">
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
