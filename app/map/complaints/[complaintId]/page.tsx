import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ComplaintShareButton from "@/components/ComplaintShareButton";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import {
  getComplaintCategoryTitle,
} from "@/lib/complaints";
import {
  getPublicComplaintStatusTitle,
  PUBLIC_COMPLAINT_QUERY,
  type PublicComplaint,
} from "@/lib/publicComplaints";
import { client } from "@/sanity/lib/client";

type ComplaintPageProps = {
  params: Promise<{
    complaintId: string;
  }>;
};

function formatDate(
  value: string | undefined,
): string {
  if (!value) {
    return "Не указана";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "ru-RU",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getStatusClasses(
  status: PublicComplaint["status"],
): string {
  if (status === "resolved") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "inProgress") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-200";
  }

  return "border-red-400/25 bg-red-400/10 text-red-300";
}

function getYoutubeEmbedUrl(
  videoUrl: string,
): string | null {
  try {
    const url = new URL(videoUrl);

    if (
      url.hostname === "youtu.be"
    ) {
      const videoId = url.pathname
        .replace("/", "")
        .trim();

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      url.hostname.includes(
        "youtube.com",
      )
    ) {
      const videoId =
        url.searchParams.get("v");

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }
  } catch {
    return null;
  }

  return null;
}

async function getComplaint(
  complaintId: string,
): Promise<PublicComplaint | null> {
  try {
    return await client.fetch<
      PublicComplaint | null
    >(
      PUBLIC_COMPLAINT_QUERY,
      {
        complaintId,
      },
      {
        next: {
          revalidate: 60,
        },
      },
    );
  } catch (error) {
    console.error(
      "Public complaint loading error:",
      error,
    );

    return null;
  }
}

export async function generateMetadata({
  params,
}: ComplaintPageProps): Promise<Metadata> {
  const { complaintId } = await params;

  const decodedComplaintId =
    decodeURIComponent(complaintId);

  const complaint = await getComplaint(
    decodedComplaintId,
  );

  if (!complaint) {
    return {
      title: "Обращение не найдено",
    };
  }

  const description =
    complaint.description
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

  return {
    title: `${complaint.title} — Экокарта`,
    description,
    openGraph: {
      title: complaint.title,
      description,
      type: "article",
      images:
        complaint.photos.length > 0
          ? [
              {
                url: complaint.photos[0].url,
                alt:
                  complaint.photos[0].alt ||
                  complaint.title,
              },
            ]
          : undefined,
    },
    twitter: {
      card:
        complaint.photos.length > 0
          ? "summary_large_image"
          : "summary",
      title: complaint.title,
      description,
      images:
        complaint.photos.length > 0
          ? [
              complaint.photos[0].url,
            ]
          : undefined,
    },
  };
}

export default async function ComplaintPage({
  params,
}: ComplaintPageProps) {
  const { complaintId } = await params;

  const decodedComplaintId =
    decodeURIComponent(complaintId);

  const complaint = await getComplaint(
    decodedComplaintId,
  );

  if (!complaint) {
    notFound();
  }

  const youtubeEmbedUrl =
    complaint.videoUrl
      ? getYoutubeEmbedUrl(
          complaint.videoUrl,
        )
      : null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SectionHeader current="/map" />

      <section className="mx-auto max-w-[1180px] px-3 pb-16 pt-4 sm:px-4 md:px-6 md:pb-24 md:pt-10">
        <nav
          aria-label="Навигация"
          className="flex flex-wrap items-center gap-2 text-xs text-white/45 md:text-sm"
        >
          <Link
            className="transition hover:text-white"
            href="/map"
          >
            Экокарта
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <Link
            className="transition hover:text-white"
            href="/map/explore"
          >
            Обращения
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <span className="text-white/70">
            {complaint.complaintId}
          </span>
        </nav>

        <header className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:mt-8 md:rounded-[34px] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold tracking-wide text-white/60">
                  {complaint.complaintId}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                    complaint.status,
                  )}`}
                >
                  {getPublicComplaintStatusTitle(
                    complaint.status,
                  )}
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.08]">
                {complaint.title}
              </h1>

              <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-white/65 md:text-lg md:leading-8">
                {complaint.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-lime-400 px-6 text-sm font-bold text-neutral-950 transition hover:bg-lime-300"
                href="/map/explore"
              >
                Вернуться к карте
              </Link>

              <ComplaintShareButton
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-6 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/[0.09]"
                label="Скопировать ссылку"
              />
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-7 md:rounded-[30px]">
              <h2 className="text-xl font-bold md:text-2xl">
                Детали обращения
              </h2>

              <dl className="mt-5 divide-y divide-white/10">
                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Номер обращения
                  </dt>

                  <dd className="text-sm font-semibold text-white md:text-base">
                    {complaint.complaintId}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Категория
                  </dt>

                  <dd className="text-sm text-white/80 md:text-base">
                    {getComplaintCategoryTitle(
                      complaint.category,
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Статус решения
                  </dt>

                  <dd className="text-sm text-white/80 md:text-base">
                    {getPublicComplaintStatusTitle(
                      complaint.status,
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Регион
                  </dt>

                  <dd className="text-sm text-white/80 md:text-base">
                    {complaint.region}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Адрес или место
                  </dt>

                  <dd className="text-sm leading-6 text-white/80 md:text-base">
                    {complaint.address}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Широта
                  </dt>

                  <dd className="font-mono text-sm text-white/80 md:text-base">
                    {complaint.location.lat}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Долгота
                  </dt>

                  <dd className="font-mono text-sm text-white/80 md:text-base">
                    {complaint.location.lng}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Дата поступления
                  </dt>

                  <dd className="text-sm text-white/80 md:text-base">
                    {formatDate(
                      complaint.createdAt,
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
                  <dt className="text-sm font-semibold text-white/45">
                    Дата публикации
                  </dt>

                  <dd className="text-sm text-white/80 md:text-base">
                    {formatDate(
                      complaint.publishedAt ??
                        complaint.createdAt,
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {complaint.photos.length > 0 ? (
              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-7 md:rounded-[30px]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold md:text-2xl">
                      Фотографии
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Материалы, приложенные
                      к обращению
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-white/45">
                    {
                      complaint.photos
                        .length
                    }
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {complaint.photos.map(
                    (photo, index) => (
                      <a
                        className="group relative block overflow-hidden rounded-[20px] border border-white/10 bg-black/20"
                        href={photo.url}
                        key={photo.key}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <img
                          alt={
                            photo.alt ||
                            `${complaint.title}, фотография ${index + 1}`
                          }
                          className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading={
                            index === 0
                              ? "eager"
                              : "lazy"
                          }
                          src={photo.url}
                        />

                        <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-neutral-950/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                          Открыть
                        </span>
                      </a>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            {complaint.videoUrl ? (
              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-7 md:rounded-[30px]">
                <h2 className="text-xl font-bold md:text-2xl">
                  Видео
                </h2>

                {youtubeEmbedUrl ? (
                  <div className="mt-5 overflow-hidden rounded-[20px] border border-white/10 bg-black">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="aspect-video w-full"
                      loading="lazy"
                      src={youtubeEmbedUrl}
                      title={`Видео к обращению ${complaint.complaintId}`}
                    />
                  </div>
                ) : (
                  <a
                    className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-6 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    href={
                      complaint.videoUrl
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    Открыть видео
                  </a>
                )}
              </section>
            ) : null}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 md:rounded-[30px] md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                Местоположение
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {complaint.region}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/55">
                {complaint.address}
              </p>

              <a
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-5 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                href={`https://yandex.ru/maps/?pt=${complaint.location.lng},${complaint.location.lat}&z=15&l=map`}
                rel="noreferrer"
                target="_blank"
              >
                Открыть на карте
              </a>
            </section>

            <section className="rounded-[24px] border border-lime-400/20 bg-lime-400/[0.06] p-5 md:rounded-[30px] md:p-6">
              <h2 className="text-lg font-bold">
                Знаете о другом нарушении?
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Отметьте проблему на
                Народной Экокарте и
                приложите фотографии с
                места.
              </p>

              <Link
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-lime-400 px-5 text-sm font-bold text-neutral-950 transition hover:bg-lime-300"
                href="/map/report"
              >
                Сообщить о нарушении
              </Link>
            </section>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}