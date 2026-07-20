import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

const SITE_URL = "https://ecovloger.ru";
const SITE_NAME = "EcoVlog";
const DEFAULT_DESCRIPTION =
  "Экологические новости, расследования и научные материалы на EcoVlog.";

const query = `
  *[
    _type == "article" &&
    slug.current == $slug
  ][0] {
    title,
    "slug": slug.current,
    category,
    cover {
      ...,
      alt,
      caption
    },
    description,
    content,
    date,
    _updatedAt
  }
`;

const categories = {
  news: "Новости",
  investigation: "Расследования",
  science: "Научные материалы",
  analytics: "Аналитика",
} as const;

type ArticleCategory = keyof typeof categories;

type ArticleImageValue = {
  _type: "image";

  asset?: {
    _ref?: string;
    _type?: "reference";
  };

  alt?: string;
  caption?: string;
};

type Article = {
  title: string;
  slug?: string;
  category?: ArticleCategory;
  cover?: ArticleImageValue;
  description?: string;
  content?: unknown[];
  date?: string;
  _updatedAt?: string;
};

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getArticlePublishedDate(date?: string) {
  if (!date) {
    return undefined;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function formatArticleDate(date?: string) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(parsedDate);
}

function getDescription(article: Article) {
  const description = article.description?.trim();

  if (description) {
    return description;
  }

  return DEFAULT_DESCRIPTION;
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-lg leading-8 text-white/85 last:mb-0">
        {children}
      </p>
    ),

    justify: ({ children }) => (
      <p className="mb-6 text-justify text-lg leading-8 text-white/85 [hyphens:auto] last:mb-0">
        {children}
      </p>
    ),

    h2: ({ children }) => (
      <h2 className="mb-5 mt-12 text-3xl font-bold leading-tight text-white first:mt-0 md:text-4xl">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="mb-4 mt-10 text-2xl font-bold leading-tight text-white first:mt-0 md:text-3xl">
        {children}
      </h3>
    ),

    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-green-500 bg-white/5 px-5 py-4 text-lg italic leading-8 text-white/75 md:px-7">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-3 text-lg leading-8 text-white/85 marker:text-green-400">
        {children}
      </ul>
    ),

    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-3 text-lg leading-8 text-white/85 marker:font-semibold marker:text-green-400">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="pl-2">{children}</li>
    ),

    number: ({ children }) => (
      <li className="pl-2">{children}</li>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-white">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),

    underline: ({ children }) => (
      <span className="underline decoration-white/40 underline-offset-4">
        {children}
      </span>
    ),

    "strike-through": ({ children }) => (
      <span className="line-through">{children}</span>
    ),

    link: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: {
        href?: string;
        blank?: boolean;
      };
    }) => {
      const href = value?.href;

      if (!href) {
        return <>{children}</>;
      }

      const shouldOpenInNewTab =
        value?.blank ?? href.startsWith("http");

      return (
        <a
          href={href}
          target={
            shouldOpenInNewTab ? "_blank" : undefined
          }
          rel={
            shouldOpenInNewTab
              ? "noopener noreferrer"
              : undefined
          }
          className="font-medium text-green-400 underline decoration-green-400/40 underline-offset-4 transition hover:text-green-300"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    image: ({
      value,
    }: {
      value: ArticleImageValue;
    }) => {
      if (!value?.asset) {
        return null;
      }

      const imageUrl = urlFor(value)
        .width(1400)
        .fit("max")
        .auto("format")
        .url();

      return (
        <figure className="my-10">
          <img
            src={imageUrl}
            alt={value.alt || ""}
            loading="lazy"
            className="mx-auto h-auto max-h-[800px] w-full rounded-2xl object-contain"
          />

          {value.caption ? (
            <figcaption className="mt-3 text-center text-sm leading-6 text-white/45">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },

  unknownBlockStyle: ({ children }) => (
    <p className="mb-6 text-lg leading-8 text-white/85 last:mb-0">
      {children}
    </p>
  ),
};

async function getArticle(slug: string) {
  return client.fetch<Article | null>(query, {
    slug,
  });
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Статья не найдена",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const articleUrl = `${SITE_URL}/articles/${encodeURIComponent(
    slug,
  )}`;

  const description = getDescription(article);

  const imageUrl = article.cover
    ? urlFor(article.cover)
        .width(1200)
        .height(630)
        .fit("crop")
        .auto("format")
        .url()
    : `${SITE_URL}/images/ecovlog-logo.png`;

  const publishedTime = getArticlePublishedDate(article.date);

  return {
    title: article.title,
    description,

    alternates: {
      canonical: articleUrl,
    },

    authors: [
      {
        name: SITE_NAME,
        url: SITE_URL,
      },
    ],

    category: article.category
      ? categories[article.category]
      : "Экология",

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
      title: article.title,
      description,
      url: articleUrl,
      siteName: SITE_NAME,
      locale: "ru_RU",
      type: "article",
      publishedTime,
      modifiedTime: article._updatedAt,
      section: article.category
        ? categories[article.category]
        : "Экология",
      authors: [SITE_NAME],

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.cover?.alt || article.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `${SITE_URL}/articles/${encodeURIComponent(
    slug,
  )}`;

  const categoryTitle = article.category
    ? categories[article.category]
    : null;

  const formattedDate = formatArticleDate(article.date);

  const publishedTime = getArticlePublishedDate(article.date);

  const description = getDescription(article);

  const coverImageUrl = article.cover
    ? urlFor(article.cover)
        .width(1600)
        .fit("max")
        .auto("format")
        .url()
    : `${SITE_URL}/images/ecovlog-logo.png`;

  const structuredData = {
    "@context": "https://schema.org",

    "@type":
      article.category === "news"
        ? "NewsArticle"
        : "Article",

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    headline: article.title,
    description,
    image: [coverImageUrl],
    url: articleUrl,
    inLanguage: "ru-RU",

    ...(publishedTime
      ? {
          datePublished: publishedTime,
        }
      : {}),

    ...(article._updatedAt
      ? {
          dateModified: article._updatedAt,
        }
      : {}),

    ...(categoryTitle
      ? {
          articleSection: categoryTitle,
        }
      : {}),

    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },

    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,

      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/ecovlog-logo.png`,
      },
    },
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <article className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 md:py-16">
        {categoryTitle ? (
          <div className="text-sm font-medium uppercase tracking-wide text-green-400">
            {categoryTitle}
          </div>
        ) : null}

        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          {article.title}
        </h1>

        {formattedDate ? (
          <time
            dateTime={publishedTime || article.date}
            className="mt-4 block text-white/40"
          >
            {formattedDate}
          </time>
        ) : null}

        {article.cover ? (
          <div className="mt-8 flex justify-center">
            <img
              src={coverImageUrl}
              alt={article.cover.alt || article.title}
              className="max-h-[600px] w-full rounded-2xl object-cover"
            />
          </div>
        ) : null}

        {article.description ? (
          <p className="mt-8 text-xl leading-8 text-white/65 md:text-2xl md:leading-9">
            {article.description}
          </p>
        ) : null}

        {article.content?.length ? (
          <div className="mt-10">
            <PortableText
              value={article.content}
              components={portableTextComponents}
            />
          </div>
        ) : null}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <Footer />
    </main>
  );
}