import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import VideoPlatformPlayer from "@/components/VideoPlatformPlayer";
import { client } from "@/sanity/lib/client";

const query = `
  *[_type == "video" && slug.current == $slug][0] {
    title,
    description,
    youtubeUrl,
    vkVideoUrl,
    date,
    "coverUrl": cover.asset->url
  }
`;

type Video = {
  title?: string | null;
  description?: string | null;
  youtubeUrl?: string | null;
  vkVideoUrl?: string | null;
  date?: string | null;
  coverUrl?: string | null;
};

function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] ?? null;
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? null;
      }

      return parsedUrl.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await client.fetch<Video | null>(query, { slug });

  if (!video) {
    return { title: "Видео не найдено" };
  }

  const youtubeId = getYoutubeId(video.youtubeUrl);
  const previewImage =
    video.coverUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined);

  const title = video.title || "Видео";
  const description = video.description || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: previewImage ? [previewImage] : undefined,
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: previewImage ? [previewImage] : undefined,
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await client.fetch<Video | null>(query, { slug });

  if (!video) {
    return (
      <main className="min-h-screen bg-neutral-950 p-10 text-white">
        Видео не найдено
      </main>
    );
  }

  const title = video.title?.trim() || "Видео без названия";
  const formattedDate = formatDate(video.date);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-10 md:py-16">
        <div className="grid items-start gap-10 md:grid-cols-[400px_1fr] md:gap-12">
          <VideoPlatformPlayer
            title={title}
            youtubeUrl={video.youtubeUrl}
            vkVideoUrl={video.vkVideoUrl}
          />

          <div>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {title}
            </h1>

            {video.description && (
              <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/70 md:mt-8 md:text-xl">
                {video.description}
              </p>
            )}

            {formattedDate && (
              <div className="mt-6 text-white/40">{formattedDate}</div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
