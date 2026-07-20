import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Oswald } from "next/font/google";
import Script from "next/script";

import PageBackground from "@/components/PageBackground";

const SITE_URL = "https://ecovloger.ru";
const SITE_NAME = "EcoVlog";
const SITE_DESCRIPTION =
  "Экологические расследования, новости природы, научные материалы и карта экологических нарушений.";

const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "EcoVlog — экологические новости России",
    template: "%s — EcoVlog",
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  keywords: [
    "экология",
    "экологические новости",
    "экологические нарушения",
    "природа России",
    "экологические расследования",
    "научные материалы",
    "защита природы",
    "EcoVlog",
  ],

  authors: [
    {
      name: "EcoVlog",
      url: SITE_URL,
    },
  ],

  creator: "EcoVlog",
  publisher: "EcoVlog",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "EcoVlog — экологические новости России",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: SITE_NAME,

    images: [
      {
        url: "/images/ecovlog-logo.png",
        width: 800,
        height: 800,
        alt: "EcoVlog — экологические новости России",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "EcoVlog — экологические новости России",
    description: SITE_DESCRIPTION,
    images: ["/images/ecovlog-logo.png"],
  },

  category: "Экология",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/ecovlog-logo.png`,
  description: SITE_DESCRIPTION,
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Эковлог",
  url: SITE_URL,
  inLanguage: "ru-RU",
  description: SITE_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const yandexMapsApiKey =
    process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "";

  return (
    <html lang="ru">
      <body className={oswald.variable}>
        <PageBackground>{children}</PageBackground>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />

        {yandexMapsApiKey && (
          <Script
            src={`https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(
              yandexMapsApiKey,
            )}&lang=ru_RU`}
            strategy="beforeInteractive"
          />
        )}
      </body>
    </html>
  );
}