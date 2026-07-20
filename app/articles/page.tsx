import Link from "next/link";

import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

const ARTICLES_PER_PAGE = 20;

const categories = [
  {
    title: "Все",
    value: "",
  },
  {
    title: "Новости",
    value: "news",
  },
  {
    title: "Расследования",
    value: "investigation",
  },
  {
    title: "Научные материалы",
    value: "science",
  },
  {
    title: "Аналитика",
    value: "analytics",
  },
];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const category = params.category || "";

  const search = params.search ? `*${params.search}*` : null;

  const currentPage = Number(params.page || "1");

  const query = `
    *[
      _type == "article"

      &&

      (
        !defined($category)
        ||
        category == $category
      )

      &&

      (
        !defined($search)
        ||
        title match $search
        ||
        description match $search
      )
    ]

    | order(date desc) {
      title,
      slug,
      category,
      cover,
      description,
      date
    }
  `;

  const articles = await client.fetch(query, {
    category: category || null,
    search,
  });

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  const start = (currentPage - 1) * ARTICLES_PER_PAGE;

  const currentArticles = articles.slice(
    start,
    start + ARTICLES_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SectionHeader
        current="/articles"
        searchAction="/articles"
        searchPlaceholder="Поиск новостей..."
      />

      <section className="mx-auto max-w-[1500px] px-3 pb-6 pt-2 md:px-6 md:pb-12 md:pt-12">
        <h1 className="text-3xl font-bold md:text-4xl">Новости</h1>

        <p className="mt-3 text-base text-white/60 md:mt-4 md:text-lg">
          Новости, экологические расследования, научные материалы и аналитика.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 md:mt-8 md:gap-3">
          {categories.map((item) => (
            <Link
              key={item.value}
              href={
                item.value
                  ? `/articles?category=${item.value}`
                  : "/articles"
              }
              className={`
                rounded-full
                border
                px-3
                py-1.5
                text-xs
                transition
                md:px-5
                md:py-2
                md:text-base
                ${
                  category === item.value
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {currentArticles.length > 0 ? (
            currentArticles.map((article: any) => (
              <Link
                key={article.slug.current}
                href={`/articles/${article.slug.current}`}
              >
                <article className="overflow-hidden rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl transition duration-300 hover:scale-[1.03] md:rounded-2xl">
                  {article.cover && (
                    <img
                      src={urlFor(article.cover)
                        .width(600)
                        .height(350)
                        .url()}
                      alt={article.title}
                      className="h-24 w-full object-cover md:h-44"
                    />
                  )}

                  <div className="p-2 md:p-4">
                    <div className="text-[9px] uppercase text-green-400 md:text-xs">
                      {
                        categories.find(
                          (item) => item.value === article.category,
                        )?.title
                      }
                    </div>

                    <h2 className="mt-1 line-clamp-2 text-sm font-bold md:mt-2 md:text-xl">
                      {article.title}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-xs text-white/60 md:mt-2 md:text-sm">
                      {article.description}
                    </p>

                    <div className="mt-2 text-[10px] text-white/40 md:mt-4 md:text-xs">
                      {article.date}
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p className="mt-10 text-white/50">Ничего не найдено</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {Array.from({
              length: totalPages,
            }).map((_, index) => {
              const page = index + 1;

              return (
                <Link
                  key={page}
                  href={`/articles?${
                    category ? `category=${category}&` : ""
                  }${search ? `search=${params.search}&` : ""}page=${page}`}
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    transition
                    ${
                      currentPage === page
                        ? "border-white bg-white text-black"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }
                  `}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}