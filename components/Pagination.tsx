import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}: Props) {
  if (totalPages <= 1) return null;

  const createHref = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (page > 1) params.set("page", String(page));

    const query = params.toString();

    return query ? `${basePath}?${query}` : basePath;
  };

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">

      {currentPage > 1 && (
        <Link
          href={createHref(currentPage - 1)}
          className="
          px-4
          py-2
          rounded-full
          bg-white/10
          border
          border-white/20
          backdrop-blur-xl
          hover:bg-white/20
          transition
          "
        >
          ←
        </Link>
      )}

      {pages.map((item, index) => {

        if (item === "...") {
          return (
            <div
              key={index}
              className="px-3 text-white/50"
            >
              ...
            </div>
          );
        }

        return (
          <Link
            key={item}
            href={createHref(item)}
            className={`
            px-4
            py-2
            rounded-full
            backdrop-blur-xl
            border
            transition
            ${
              item === currentPage
                ? "bg-white text-black border-white"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }
            `}
          >
            {item}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={createHref(currentPage + 1)}
          className="
          px-4
          py-2
          rounded-full
          bg-white/10
          border
          border-white/20
          backdrop-blur-xl
          hover:bg-white/20
          transition
          "
        >
          →
        </Link>
      )}

    </div>
  );
}