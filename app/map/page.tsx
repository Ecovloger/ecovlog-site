import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { client } from "@/sanity/lib/client";

export const metadata: Metadata = {
  title: "Народная карта экологических нарушений",
  description:
    "Откройте Народную карту экологических нарушений или сообщите о новой экологической проблеме.",
};

export const revalidate = 60;

type ComplaintStatistics = {
  total: number;
  resolved: number;
  inProgress: number;
};

const STATISTICS_QUERY = `
  {
    "total": count(
      *[
        _type == "complaint" &&
        isPublic == true &&
        status in ["accepted", "inProgress", "resolved"]
      ]
    ),

    "resolved": count(
      *[
        _type == "complaint" &&
        isPublic == true &&
        status == "resolved"
      ]
    ),

    "inProgress": count(
      *[
        _type == "complaint" &&
        isPublic == true &&
        status == "inProgress"
      ]
    )
  }
`;

async function getStatistics(): Promise<ComplaintStatistics> {
  try {
    return await client.fetch<ComplaintStatistics>(
      STATISTICS_QUERY,
    );
  } catch (error) {
    console.error(
      "Failed to load complaint statistics:",
      error,
    );

    return {
      total: 0,
      resolved: 0,
      inProgress: 0,
    };
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 md:h-6 md:w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 md:h-5 md:w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />

      <path
        d="M9 3v15M15 6v15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function StatisticsIcon({
  type,
}: {
  type: "total" | "resolved" | "inProgress";
}) {
  if (type === "resolved") {
    return (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="m7 12 3 3 7-7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />

        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (type === "inProgress") {
    return (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default async function MapPage() {
  const statistics = await getStatistics();

  const statisticCards = [
    {
      label: "Обращений",
      value: statistics.total,
      type: "total" as const,
    },
    {
      label: "Решено",
      value: statistics.resolved,
      type: "resolved" as const,
    },
    {
      label: "В работе",
      value: statistics.inProgress,
      type: "inProgress" as const,
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SectionHeader current="/map" />

      <section
        className="
          mx-auto
          max-w-[1400px]
          px-3
          pb-12
          pt-1
          sm:px-4
          md:px-6
          md:pb-20
          md:pt-6
        "
      >
        <div className="text-center">
          <h1
            className="
              mx-auto
              max-w-5xl
              text-2xl
              font-bold
              leading-tight
              tracking-tight
              sm:text-3xl
              md:text-4xl
              lg:text-5xl
            "
          >
            Народная карта экологических нарушений
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-3xl
              text-sm
              leading-relaxed
              text-white/60
              sm:text-base
              md:mt-4
              md:text-lg
            "
          >
            Здесь вы отмечаете экологические нарушения, а мы
            добиваемся их устранения и показываем результаты
            работы.
          </p>
        </div>

        <div
          className="
            group
            relative
            mt-5
            overflow-hidden
            rounded-[22px]
            border
            border-white/10
            bg-white/[0.03]
            shadow-[0_24px_80px_rgba(0,0,0,0.4)]
            md:mt-7
            md:rounded-[30px]
          "
        >
          <div
            className="
              relative
              h-[260px]
              overflow-hidden
              min-[390px]:h-[280px]
              sm:h-[330px]
              md:h-[410px]
              lg:h-[450px]
              xl:h-[480px]
            "
          >
            <Image
              alt="Народная карта экологических нарушений"
              className="
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.025]
              "
              fill
              priority
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1400px) 96vw,
                1400px
              "
              src="/images/ecocard.png"
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-b
                from-black/15
                via-black/25
                to-black/60
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_55%,rgba(0,0,0,0.42)_100%)]
              "
            />

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                px-4
                py-6
                sm:px-6
              "
            >
              <div
                className="
                  flex
                  w-full
                  max-w-[520px]
                  flex-col
                  items-center
                  gap-3
                  md:gap-4
                "
              >
                <Link
                  className="
                    group/button
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2.5
                    rounded-full
                    border
                    border-white/30
                    bg-black/25
                    px-5
                    py-4
                    text-base
                    font-bold
                    text-white
                    shadow-[0_18px_55px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.16)]
                    backdrop-blur-2xl
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-white/50
                    hover:bg-white/[0.12]
                    hover:shadow-[0_24px_65px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]
                    md:px-8
                    md:py-5
                    md:text-xl
                  "
                  href="/map/report"
                >
                  <LocationIcon />

                  <span>Сообщить о нарушении</span>
                </Link>

                <Link
                  className="
                    group/button
                    inline-flex
                    w-[88%]
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-white/20
                    bg-black/20
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white/90
                    shadow-[0_14px_40px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)]
                    backdrop-blur-2xl
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-white/40
                    hover:bg-white/[0.1]
                    hover:text-white
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.18)]
                    sm:w-[76%]
                    md:px-7
                    md:py-4
                    md:text-base
                  "
                  href="/map/explore"
                >
                  <MapIcon />

                  <span>Открыть Экокарту</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
            md:mt-5
            md:gap-5
          "
        >
          {statisticCards.map((card) => (
            <div
              className="
                relative
                min-w-0
                overflow-hidden
                rounded-[18px]
                border
                border-white/10
                bg-white/[0.055]
                px-3
                py-4
                backdrop-blur-2xl
                transition
                duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/[0.075]
                sm:px-4
                md:rounded-[26px]
                md:px-7
                md:py-7
              "
              key={card.label}
            >
              <div
                className="
                  absolute
                  -right-12
                  -top-12
                  h-32
                  w-32
                  rounded-full
                  bg-white/[0.04]
                  blur-2xl
                "
              />

              <div
                className="
                  relative
                  flex
                  flex-col
                  items-start
                  gap-3
                  md:flex-row
                  md:items-center
                  md:justify-between
                  md:gap-4
                "
              >
                <div className="min-w-0">
                  <div
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      md:text-4xl
                    "
                  >
                    {formatNumber(card.value)}
                  </div>

                  <div
                    className="
                      mt-1
                      truncate
                      text-xs
                      font-medium
                      text-white/55
                      sm:text-sm
                      md:mt-2
                      md:text-base
                    "
                  >
                    {card.label}
                  </div>
                </div>

                <div
                  className="
                    hidden
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.07]
                    text-white/70
                    md:flex
                  "
                >
                  <StatisticsIcon type={card.type} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}