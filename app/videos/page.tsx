import Link from "next/link";

import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import VideoCard from "@/components/VideoCard";
import { client } from "@/sanity/lib/client";

const VIDEOS_PER_PAGE = 20;

type Video = {
  _id: string;
  title?: string | null;
  description?: string | null;
  youtubeUrl?: string | null;
  vkVideoUrl?: string | null;
  coverUrl?: string | null;
  date?: string | null;
  slug?: {
    current?: string | null;
  } | null;
};

type VideosPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

const query = `
  *[
    _type == "video" &&
    defined(slug.current) &&
    slug.current != "" &&
    (
      !defined($search) ||
      title match $search ||
      description match $search
    )
  ]
  | order(date desc)
  [$start...$end]
  {
    _id,
    title,
    description,
    youtubeUrl,
    vkVideoUrl,
    "coverUrl": cover.asset->url,
    date,
    slug
  }
`;

const countQuery = `
  count(
    *[
      _type == "video" &&
      defined(slug.current) &&
      slug.current != "" &&
      (
        !defined($search) ||
        title match $search ||
        description match $search
      )
    ]
  )
`;

function parseCurrentPage(page?: string): number {
  const parsedPage = Number.parseInt(page ?? "1", 10);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export default async function Videos({
  searchParams,
}: VideosPageProps) {
  const params = await searchParams;
  const rawSearch = params.search?.trim() || "";
  const search = rawSearch ? `*${rawSearch}*` : null;
  const currentPage = parseCurrentPage(params.page);
  const start = (currentPage - 1) * VIDEOS_PER_PAGE;
  const end = start + VIDEOS_PER_PAGE;

  const [videos, totalVideos] = await Promise.all([
    client.fetch<Video[]>(query, { search, start, end }),
    client.fetch<number>(countQuery, { search }),
  ]);

  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeTotalVideos =
    typeof totalVideos === "number" && totalVideos > 0 ? totalVideos : 0;
  const totalPages = Math.ceil(safeTotalVideos / VIDEOS_PER_PAGE);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SectionHeader
        current="/videos"
        searchAction="/videos"
        searchPlaceholder="Поиск видео..."
      />

      <section className="mx-auto max-w-[1400px] px-3 pb-6 pt-2 md:px-10 md:pb-16 md:pt-16">
        <h1 className="text-3xl font-bold md:text-5xl">Видео</h1>

        {safeVideos.length > 0 ? (
          <div className="mt-6 grid auto-rows-fr grid-cols-2 items-stretch gap-3 md:mt-12 md:gap-8 lg:grid-cols-4">
            {safeVideos.map((video) => (
              <VideoCard key={video._id} {...video} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-white/50">Ничего не найдено</p>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Навигация по страницам видео"
            className="mt-12 flex flex-wrap justify-center gap-2"
          >
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const queryParams = new URLSearchParams();

              if (page > 1) queryParams.set("page", String(page));
              if (rawSearch) queryParams.set("search", rawSearch);

              const queryString = queryParams.toString();
              const href = queryString ? `/videos?${queryString}` : "/videos";
              const isCurrentPage = currentPage === page;

              return (
                <Link
                  key={page}
                  href={href}
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isCurrentPage
                      ? "border-white bg-white text-black"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </nav>
        )}
      </section>

      <Footer />
    </main>
  );
}
