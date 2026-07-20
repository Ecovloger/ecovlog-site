import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="
        hidden
        md:block
        py-10
        mt-20
        border-t
        border-white/10
      "
    >
      <div
        className="
          max-w-[1400px]
          mx-auto
          px-6
          md:px-10
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-4
          text-sm
        "
      >
        <div className="text-white/50">
          © {new Date().getFullYear()} EcoVlog
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-white/50 hover:text-white transition-colors"
          >
            Политика конфиденциальности
          </Link>

          <Link
            href="/terms"
            className="text-white/50 hover:text-white transition-colors"
          >
            Пользовательское соглашение
          </Link>

          <Link
            href="/cookies"
            className="text-white/50 hover:text-white transition-colors"
          >
            Cookie
          </Link>
        </div>
      </div>
    </footer>
  );
}