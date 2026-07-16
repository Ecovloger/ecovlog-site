import Link from "next/link";

type HomeCardProps = {
  title: string;
  href: string;
  image: string;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
};

export default function HomeCard({
  title,
  href,
  image,
  active,
  onHover,
  onLeave,
}: HomeCardProps) {

  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative
        transition-all
        duration-500
        ease-in-out
        ${
          active
            ? "flex-[1.5]"
            : "flex-1"
        }
      `}
    >

      <div
        className="
          relative
          h-[460px]
          overflow-hidden
          rounded-3xl
        "
      >

        <img
          src={image}
          alt={title}
          className={`
            absolute
            inset-0
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            ${active ? "scale-110" : "scale-100"}
          `}
        />


        <div
          className={`
            absolute
            inset-0
            transition
            duration-500
            ${
              active
                ? "bg-black/25"
                : "bg-black/45"
            }
          `}
        />


        <div className="absolute bottom-8 left-8">

          <h2 className="text-4xl font-bold text-white uppercase">
            {title}
          </h2>

        </div>

      </div>

    </Link>
  );
}