import Link from "next/link";

type VideoProps = {
  title?: string | null;
  description?: string | null;
  date?: string | null;
  slug?: {
    current?: string | null;
  } | null;
  youtubeUrl?: string | null;
};

function getYoutubeId(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return (
          parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] ??
          null
        );
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return (
          parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ??
          null
        );
      }

      return parsedUrl.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function formatDate(date?: string | null): string | null {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export default function VideoCard({
  title,
  description,
  date,
  slug,
  youtubeUrl,
}: VideoProps) {
  const slugValue = slug?.current?.trim();

  if (!slugValue) {
    return null;
  }

  const safeTitle = title?.trim() || "Видео без названия";
  const safeDescription = description?.trim() || "";
  const formattedDate = formatDate(date);

  const youtubeId = getYoutubeId(youtubeUrl);

  const preview = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "/images/video.jpg";

  return (
    <Link
      href={`/videos/${encodeURIComponent(slugValue)}`}
      className="block h-full min-w-0"
    >
      <article
        className="
          flex
          h-full
          min-w-0
          cursor-pointer
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white/10
          transition
          duration-300
          hover:scale-[1.03]
        "
      >
        <div
          className="
            relative
            aspect-[9/16]
            w-full
            shrink-0
            overflow-hidden
            bg-black
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={safeTitle}
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>

        <div
          className="
            flex
            h-[190px]
            min-w-0
            flex-col
            p-4
            md:h-[230px]
            md:p-6
          "
        >
          {formattedDate && (
            <div
              className="
                shrink-0
                text-xs
                text-white/50
                md:text-sm
              "
            >
              {formattedDate}
            </div>
          )}

          <h2
            className="
              mt-2
              min-w-0
              overflow-hidden
              text-lg
              font-bold
              leading-[1.2]
              [display:-webkit-box]
              [-webkit-box-orient:vertical]
              [-webkit-line-clamp:5]
              [overflow-wrap:anywhere]
              md:text-2xl
              md:[-webkit-line-clamp:4]
            "
          >
            {safeTitle}
          </h2>

          {safeDescription && (
            <p
              className="
                mt-3
                hidden
                min-w-0
                overflow-hidden
                text-white/70
                [display:-webkit-box]
                [-webkit-box-orient:vertical]
                [-webkit-line-clamp:3]
                [overflow-wrap:anywhere]
                md:block
              "
            >
              {safeDescription}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}