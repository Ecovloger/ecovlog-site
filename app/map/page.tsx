import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { client } from "@/sanity/lib/client";

export const metadata: Metadata = {
  title: "Народная карта экологических нарушений",
  description:
    "Сообщите об экологическом нарушении на Народной карте. Мы добиваемся устранения нарушений и показываем результаты работы.",
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
        status in ["inProgress", "resolved"]
      ]
    ),

    "resolved": count(
      *[
        _type == "complaint" &&
        status == "resolved"
      ]
    ),

    "inProgress": count(
      *[
        _type == "complaint" &&
        status == "inProgress"
      ]
    )
  }
`;

async function getStatistics(): Promise<ComplaintStatistics> {
  try {
    return await client.fetch<ComplaintStatistics>(STATISTICS_QUERY);
  } catch (error) {
    console.error("Failed to load complaint statistics:", error);

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
      className="h-5 w-5 shrink-0"
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
          px-4
          pb-14
          pt-2
          md:px-6
          md:pb-24
          md:pt-20
        "
      >
        <div className="text-center">
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              md:text-5xl
            "
          >
            Народная карта экологических нарушений
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-3xl
              text-base
              leading-relaxed
              text-white/60
              md:mt-6
              md:text-xl
            "
          >
            Здесь вы отмечаете экологические нарушения, а мы добиваемся
            их устранения и показываем результаты работы.
          </p>
        </div>

        <Link
          aria-label="Сообщить об экологическом нарушении"
          className="
            group
            relative
            mt-8
            block
            overflow-hidden
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.03]
            shadow-[0_30px_100px_rgba(0,0,0,0.45)]
            outline-none
            transition
            duration-500
            hover:border-white/20
            hover:shadow-[0_35px_120px_rgba(0,0,0,0.6)]
            focus-visible:ring-2
            focus-visible:ring-white/70
            focus-visible:ring-offset-4
            focus-visible:ring-offset-neutral-950
            md:mt-12
            md:rounded-[36px]
          "
          href="/map/report"
        >
          <div
            className="
              relative
              aspect-[16/10]
              min-h-[360px]
              overflow-hidden
              sm:aspect-[16/8]
              md:min-h-[500px]
            "
          >
            <Image
              alt=""
              className="
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-[1.035]
              "
              fill
              priority
              sizes="
                (max-width: 768px) 100vw,
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
                from-black/10
                via-black/15
                to-black/45
                transition-colors
                duration-500
                group-hover:from-black/5
                group-hover:via-black/10
                group-hover:to-black/35
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-1/2
                w-1/3
                -skew-x-12
                bg-gradient-to-r
                from-transparent
                via-white/10
                to-transparent
                opacity-0
                transition-all
                duration-1000
                group-hover:left-[120%]
                group-hover:opacity-100
              "
            />

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-white/25
                  bg-white/15
                  px-6
                  py-4
                  text-base
                  font-semibold
                  text-white
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_18px_50px_rgba(0,0,0,0.3)]
                  backdrop-blur-2xl
                  transition
                  duration-500
                  group-hover:-translate-y-1
                  group-hover:scale-[1.03]
                  group-hover:border-white/40
                  group-hover:bg-white/20
                  md:px-9
                  md:py-5
                  md:text-xl
                "
              >
                <LocationIcon />
                <span>Сообщить о нарушении</span>
              </div>
            </div>
          </div>
        </Link>

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
            md:mt-7
            md:gap-5
          "
        >
          {statisticCards.map((card) => (
            <div
              className="
                relative
                overflow-hidden
                rounded-[24px]
                border
                border-white/10
                bg-white/[0.055]
                px-5
                py-6
                backdrop-blur-2xl
                transition
                duration-300
                hover:-translate-y-1
                hover:border-white/20
                hover:bg-white/[0.075]
                md:rounded-[28px]
                md:px-7
                md:py-8
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
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <div
                    className="
                      text-3xl
                      font-bold
                      tracking-tight
                      md:text-4xl
                    "
                  >
                    {formatNumber(card.value)}
                  </div>

                  <div
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-white/55
                      md:text-base
                    "
                  >
                    {card.label}
                  </div>
                </div>

                <div
                  className="
                    flex
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
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
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