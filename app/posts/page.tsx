import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

const POSTS_PER_PAGE = 20;

type SanityImage = {
  _key?: string;
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

type Post = {
  _id: string;
  title?: string | null;
  slug?: {
    current?: string | null;
  } | null;
  images?: SanityImage[] | null;
  description?: string | null;
  date?: string | null;
  category?: string | null;
};

type PostsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const query = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != ""
  ]
  | order(date desc)
  [$start...$end]
  {
    _id,
    title,
    slug,
    images,
    description,
    date,
    category
  }
`;

const countQuery = `
  count(
    *[
      _type == "post" &&
      defined(slug.current) &&
      slug.current != ""
    ]
  )
`;

function hasValidImageAsset(
  image: SanityImage | null | undefined,
): image is SanityImage {
  if (!image?.asset) {
    return false;
  }

  return Boolean(image.asset._ref || image.asset._id);
}

function getFirstValidImage(
  images: SanityImage[] | null | undefined,
): SanityImage | null {
  if (!Array.isArray(images)) {
    return null;
  }

  return images.find(hasValidImageAsset) ?? null;
}

function getPostImageUrl(image: SanityImage | null): string | null {
  if (!image) {
    return null;
  }

  try {
    return urlFor(image)
      .width(900)
      .height(1200)
      .fit("max")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

function parseCurrentPage(page: string | undefined): number {
  const parsedPage = Number.parseInt(page ?? "1", 10);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export default async function PostsPage({
  searchParams,
}: PostsPageProps) {
  const params = await searchParams;
  const currentPage = parseCurrentPage(params.page);

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const [posts, totalPosts] = await Promise.all([
    client.fetch<Post[]>(
      query,
      {
        start,
        end,
      },
    ),
    client.fetch<number>(countQuery),
  ]);

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeTotalPosts =
    typeof totalPosts === "number" && totalPosts > 0
      ? totalPosts
      : 0;

  const totalPages = Math.ceil(
    safeTotalPosts / POSTS_PER_PAGE,
  );

  return (
    <main
      className="
        min-h-screen
        bg-neutral-950
        text-white
      "
    >
      <SectionHeader
        current="/posts"
        searchAction="/posts/search"
        searchPlaceholder="Поиск публикаций..."
      />

      <section
        className="
          mx-auto
          max-w-[1400px]
          px-3
          pb-6
          pt-2
          md:px-6
          md:pb-12
          md:pt-12
        "
      >
        <h1
          className="
            text-4xl
            font-bold
          "
        >
          Публикации
        </h1>

        <p
          className="
            mt-4
            text-lg
            text-white/60
          "
        >
          Короткие экологические материалы, факты и визуальные
          истории.
        </p>

        {safePosts.length > 0 ? (
          <div
            className="
              mt-10
              grid
              grid-cols-2
              gap-3
              md:gap-6
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {safePosts.map((post) => {
              const slug = post.slug?.current?.trim();

              if (!slug) {
                return null;
              }

              const title =
                post.title?.trim() || "Публикация без названия";

              const description =
                post.description?.trim() ||
                "Описание публикации пока не добавлено.";

              const firstImage = getFirstValidImage(post.images);
              const imageUrl = getPostImageUrl(firstImage);

              return (
                <Link
                  key={post._id}
                  href={`/posts/${encodeURIComponent(slug)}`}
                >
                  <article
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/10
                      backdrop-blur-xl
                      transition
                      duration-300
                      hover:scale-[1.03]
                    "
                  >
                    <div
                      className="
                        relative
                        aspect-[3/4]
                        w-full
                        overflow-hidden
                        rounded-t-2xl
                        bg-black/20
                      "
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          sizes="
                            (max-width: 768px) 50vw,
                            (max-width: 1200px) 33vw,
                            25vw
                          "
                          className="object-contain"
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-white/10
                            to-transparent
                            px-4
                            text-center
                            text-sm
                            text-white/40
                          "
                        >
                          Изображение не добавлено
                        </div>
                      )}
                    </div>

                    <div
                      className="
                        p-3
                        md:p-4
                      "
                    >
                      <h2
                        className="
                          line-clamp-2
                          text-sm
                          font-bold
                          leading-tight
                          md:text-xl
                        "
                      >
                        {title}
                      </h2>

                      <p
                        className="
                          mt-2
                          line-clamp-3
                          text-xs
                          text-white/60
                          md:text-sm
                        "
                      >
                        {description}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="
              mt-10
              rounded-2xl
              border
              border-white/10
              bg-white/5
              px-6
              py-12
              text-center
              text-white/60
            "
          >
            Публикации пока не добавлены.
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Навигация по страницам публикаций"
            className="
              mt-12
              flex
              flex-wrap
              justify-center
              gap-2
            "
          >
            {Array.from({
              length: totalPages,
            }).map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;

              return (
                <Link
                  key={page}
                  href={
                    page === 1
                      ? "/posts"
                      : `/posts?page=${page}`
                  }
                  aria-current={
                    isCurrentPage ? "page" : undefined
                  }
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    transition
                    ${
                      isCurrentPage
                        ? "border-white/40 bg-white/25"
                        : "border-white/20 bg-white/10 hover:bg-white/20"
                    }
                  `}
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