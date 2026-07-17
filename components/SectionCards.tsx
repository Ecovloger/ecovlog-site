"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const sections = [
  {
    title: "Видео",
    image: "/images/video.webp",
    link: "/videos",
  },
  {
    title: "Статьи",
    image: "/images/articles.webp",
    link: "/articles",
  },
  {
    title: "Публикации",
    image: "/images/posts.webp",
    link: "/posts",
  },
  {
    title: "Экокарта",
    image: "/images/map.webp",
    link: "/map",
  },
];

export default function SectionCards() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      className="
      max-w-[1500px]
      mx-auto
      px-4
      md:px-6
      py-10
      md:py-16
    "
    >
      {/* ДЕСКТОП */}

      <div
        className="
        hidden
        md:flex
        w-full
        gap-5
        h-[520px]
      "
      >
        {sections.map((item, index) => (
          <Link
            key={item.title}
            href={item.link}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            className={`
              transition-all
              duration-700
              ease-[cubic-bezier(0.34,1.56,0.64,1)]

              ${
                active === index
                  ? "flex-[1.4]"
                  : active !== null
                  ? "flex-[0.8]"
                  : "flex-1"
              }
            `}
          >
            <div
              className="
              relative
              h-[520px]
              rounded-[2rem]
              overflow-hidden
              cursor-pointer
              border
              border-white/10
              shadow-2xl
            "
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority
                quality={80}
                sizes="(min-width:1536px) 25vw,
                       (min-width:1024px) 33vw,
                       (min-width:768px) 40vw,
                       50vw"
                className={`
                  object-cover
                  transition-transform
                  duration-700

                  ${
                    active === index
                      ? "scale-110"
                      : "scale-100"
                  }
                `}
              />

              <div
                className="
                absolute
                inset-0
                bg-gradient-to-b
                from-black/10
                to-black/70
              "
              />

              <div
                className="
                absolute
                bottom-8
                left-1/2
                -translate-x-1/2
              "
              >
                <div
                  className="
                  backdrop-blur-xl
                  bg-white/10
                  border
                  border-white/20
                  rounded-full
                  px-10
                  py-4
                  shadow-xl
                "
                >
                  <h2
                    className="
                    text-3xl
                    font-bold
                  "
                  >
                    {item.title}
                  </h2>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* МОБИЛЬНАЯ ВЕРСИЯ */}

      <div
        className="
        md:hidden
        grid
        grid-cols-2
        gap-3
      "
      >
        {sections.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="
              relative
              h-[220px]
              rounded-[1.5rem]
              overflow-hidden
              border
              border-white/20
              shadow-xl
            "
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority
              quality={70}
              sizes="50vw"
              className="
                object-cover
              "
            />

            <div
              className="
              absolute
              inset-0
              bg-black/40
            "
            />

            <div
              className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
            >
              <div
                className="
                backdrop-blur-2xl
                bg-white/15
                border
                border-white/25
                rounded-2xl
                px-4
                py-3
                shadow-[0_8px_32px_rgba(0,0,0,0.35)]
              "
              >
                <h2
                  className="
                  text-base
                  font-bold
                  text-white
                  leading-[1.05]
                  text-center
                "
                >
                  {item.title}
                </h2>
              </div>
            </div>          </Link>
        ))}
      </div>
    </section>
  );
}