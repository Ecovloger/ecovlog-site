import "./globals.css";

import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import Script from "next/script";

import PageBackground from "@/components/PageBackground";

const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecovloger.ru"),

  title: {
    default: "EcoVlog — экологические новости России",
    template: "%s — EcoVlog",
  },

  description:
    "Экологические расследования, новости природы, научные материалы и карта экологических нарушений.",

  keywords: [
    "экология",
    "экологические новости",
    "экологические нарушения",
    "природа России",
    "экологические расследования",
    "Зелёный Фронт",
    "EcoVlog",
  ],

  authors: [
    {
      name: "EcoVlog",
    },
  ],

  openGraph: {
    title: "EcoVlog — экологические новости России",
    description:
      "Экологические расследования, новости природы и мониторинг экологических нарушений.",
    type: "website",
    locale: "ru_RU",
    url: "https://ecovloger.ru",
    siteName: "EcoVlog",
    images: [
      {
        url: "/images/ecovlog-logo.png",
        width: 800,
        height: 800,
        alt: "EcoVlog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "EcoVlog — экологические новости России",
    description:
      "Экологические расследования, новости природы и мониторинг экологических нарушений.",
    images: ["/images/ecovlog-logo.png"],
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