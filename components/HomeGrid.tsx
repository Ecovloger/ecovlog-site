"use client";

import { useState } from "react";
import HomeCard from "./HomeCard";


export default function HomeGrid() {

  const [active, setActive] = useState<number | null>(null);


  const cards = [
    {
      title: "Видео",
      href: "/videos",
      image: "/images/video.jpg",
    },
    {
      title: "Статьи",
      href: "/articles",
      image: "/images/articles.jpg",
    },
    {
      title: "Публикации",
      href: "/posts",
      image: "/images/posts.jpg",
    },
    {
      title: "Экокарта",
      href: "/map",
      image: "/images/map.jpg",
    },
  ];


  return (

    <section className="py-10">

      <div
        className="
          max-w-[1400px]
          mx-auto
          px-6
          md:px-10
          flex
          gap-5
        "
        onMouseLeave={() => setActive(null)}
      >

        {cards.map((card, index) => (

          <HomeCard
            key={card.title}
            {...card}
            active={active === index}
            onHover={() => setActive(index)}
            onLeave={() => setActive(null)}
          />

        ))}

      </div>

    </section>

  );
}