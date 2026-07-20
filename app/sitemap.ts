import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";

const SITE_URL = "https://ecovloger.ru";

export const revalidate = 3600;

type SitemapArticle = {
  slug?: string;
  date?: string;
  _updatedAt?: string;
};

const sitemapArticlesQuery = `
  *[
    _type == "article" &&
    defined(slug.current)
  ] | order(date desc) {
    "slug": slug.current,
    date,
    _updatedAt
  }
`;

function getValidDate(
  primaryDate?: string,
  fallbackDate?: string,
) {
  const value = primaryDate || fallbackDate;

  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await client.fetch<SitemapArticle[]>(
    sitemapArticlesQuery,
  );

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },

    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },

    {
      url: `${SITE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles
    .filter(
      (
        article,
      ): article is SitemapArticle & {
        slug: string;
      } => Boolean(article.slug),
    )
    .map((article) => ({
      url: `${SITE_URL}/articles/${encodeURIComponent(
        article.slug,
      )}`,

      lastModified: getValidDate(
        article._updatedAt,
        article.date,
      ),

      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticPages, ...articlePages];
}