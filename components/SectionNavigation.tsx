import Link from "next/link";

const sections = [
  {
    title: "Видео",
    link: "/videos",
  },
  {
    title: "Статьи",
    link: "/articles",
  },
  {
    title: "Публикации",
    link: "/posts",
  },
  {
    title: "Экокарта",
    link: "/map",
  },
];

export default function SectionNavigation({
  current,
}: {
  current?: string;
}) {
  return (
    <div
      className="
        md:hidden
        w-full
        mt-2
      "
    >
      <div
        className="
          grid
          grid-cols-2
          gap-2
        "
      >
        {sections.map((item) => (
          <Link
            key={item.link}
            href={item.link}
            className={`
              h-9
              flex
              items-center
              justify-center
              rounded-full
              text-[11px]
              font-medium
              border
              backdrop-blur-xl
              transition
              duration-300

              ${
                current === item.link
                  ? "bg-white text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            `}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}