"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DEFAULT_SLOGAN = "Начните видеть экологию иначе.";

const sections = [
  {
    title: "Видео",
    image: "/images/video.webp",
    link: "/videos",
    slogan: "Начните смотреть на привычные вещи по-новому.",
  },
  {
    title: "Новости",
    image: "/images/articles.webp",
    link: "/articles",
    slogan: "Начните следить за тем, что действительно важно.",
  },
  {
    title: "Публикации",
    image: "/images/posts.webp",
    link: "/posts",
    slogan: "Начните разбираться глубже.",
  },
  {
    title: "Экокарта",
    image: "/images/map.webp",
    link: "/map",
    slogan: "Начните менять мир вокруг себя.",
  },
];

export default function SectionCards() {
  const [active, setActive] = useState<number | null>(null);
  const [displayedSlogan, setDisplayedSlogan] = useState(DEFAULT_SLOGAN);
  const [sloganVisible, setSloganVisible] = useState(false);
  const isFirstRender = useRef(true);

  const nextSlogan =
    active === null ? DEFAULT_SLOGAN : sections[active].slogan;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSloganVisible(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSloganVisible(false);

    const timer = window.setTimeout(() => {
      setDisplayedSlogan(nextSlogan);
      setSloganVisible(true);
    }, 160);

    return () => window.clearTimeout(timer);
  }, [nextSlogan]);

  return (
    <section
      className="
        mx-auto
        max-w-[1500px]
        px-4
        py-10
        md:px-6
        md:py-16
      "
    >
      {/* ДЕСКТОП */}

      <div
        className="
          hidden
          min-h-[76px]
          items-center
          justify-center
          px-6
          pb-8
          md:flex
        "
        aria-live="polite"
      >
        <p
          className={`
            max-w-4xl
            text-center
            text-2xl
            font-medium
            leading-tight
            tracking-[-0.025em]
            text-white/90
            transition-all
            duration-300
            ease-out
            motion-reduce:transform-none
            motion-reduce:transition-none
            lg:text-3xl
            ${
              sloganVisible
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-1.5 opacity-0 blur-[2px]"
            }
          `}
        >
          {displayedSlogan}
        </p>
      </div>

      <div
        className="
          hidden
          h-[520px]
          w-full
          gap-5
          md:flex
        "
      >
        {sections.map((item, index) => (
          <Link
            key={item.title}
            href={item.link}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            className={`
              min-w-0
              transition-[flex-grow]
              duration-[900ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              motion-reduce:transition-none
              ${
                active === index
                  ? "flex-[1.18]"
                  : active !== null
                    ? "flex-[0.94]"
                    : "flex-1"
              }
            `}
          >
            <div
              className="
                relative
                h-[520px]
                cursor-pointer
                overflow-hidden
                rounded-[2rem]
                border
                border-white/10
                bg-[#1d1b1f]
                shadow-2xl
              "
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority
                quality={85}
                sizes="
                  (min-width:1536px) 25vw,
                  (min-width:1024px) 33vw,
                  (min-width:768px) 40vw,
                  50vw
                "
                className={`
                  object-contain
                  transition-transform
                  duration-[1000ms]
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  motion-reduce:transform-none
                  motion-reduce:transition-none
                  ${active === index ? "scale-[1.025]" : "scale-100"}
                `}
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-b
                  from-black/5
                  via-transparent
                  to-black/55
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
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    px-10
                    py-4
                    shadow-xl
                    backdrop-blur-xl
                  "
                >
                  <h2 className="text-3xl font-bold">{item.title}</h2>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* МОБИЛЬНАЯ ВЕРСИЯ */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          md:hidden
        "
      >
        {sections.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="
              relative
              h-[220px]
              overflow-hidden
              rounded-[1.5rem]
              border
              border-white/20
              bg-[#1d1b1f]
              shadow-xl
            "
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority
              quality={80}
              sizes="50vw"
              className="object-contain"
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-b
                from-black/5
                via-transparent
                to-black/55
              "
            />

            <div
              className="
                absolute
                inset-x-0
                bottom-4
                flex
                justify-center
                px-2
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-white/25
                  bg-white/15
                  px-4
                  py-3
                  shadow-[0_8px_24px_rgba(0,0,0,0.28)]
                  backdrop-blur-2xl
                "
              >
                <h2
                  className="
                    text-center
                    text-base
                    font-bold
                    leading-[1.05]
                    text-white
                  "
                >
                  {item.title}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
