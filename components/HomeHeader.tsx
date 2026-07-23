import Link from "next/link";

export default function HomeHeader() {
  return (
    <header
      className="
        w-full
        flex
        items-center
        justify-between
        px-3
        py-3
        md:px-6
        md:py-5
        gap-3
      "
    >
      <Link
        href="/"
        className="
          group
          hover:scale-105
          transition
          duration-300
          shrink-0
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            p-2
            bg-white/10
            border
            border-white/20
            backdrop-blur-2xl
            shadow-[0_8px_40px_rgba(255,255,255,0.15)]
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-white/30
              via-transparent
              to-transparent
              pointer-events-none
            "
          />

          <img
            src="/images/ecovlog-logo.png"
            alt="EcoVlog"
            className="
              relative
              h-12
              md:h-16
              w-auto
              object-contain
            "
          />
        </div>
      </Link>

      <Link
        href="/contacts"
        className="
          relative
          overflow-hidden
          shrink-0

          bg-white/10
          text-white

          px-4
          md:px-6

          py-2
          md:py-3

          rounded-full
          font-semibold

          text-sm
          md:text-base

          border
          border-white/25

          backdrop-blur-xl

          shadow-[0_8px_30px_rgba(255,255,255,0.12)]

          hover:bg-white/20
          hover:scale-105
          transition
          duration-300
        "
      >
        <span className="relative z-10">
          Контакты
        </span>

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-white/30
            via-transparent
            to-transparent
          "
        />
      </Link>
    </header>
  );
}
