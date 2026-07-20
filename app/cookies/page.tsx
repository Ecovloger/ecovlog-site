import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Политика cookie | EcoVlog",
  description:
    "Информация об использовании файлов cookie и аналогичных технологий на сайте EcoVlog.",
};

const UPDATED_AT = "20 июля 2026 года";
const CONTACT_EMAIL = "ya-gr@mail.ru";

export default function CookiesPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <article className="mx-auto w-full max-w-5xl space-y-10 rounded-3xl border border-white/10 bg-black/75 p-6 text-base leading-8 text-white/85 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-10 lg:p-12">
        <header className="space-y-4 border-b border-white/20 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Политика использования файлов cookie
          </h1>
          <p className="text-sm text-white/55">
            Последнее обновление: {UPDATED_AT}
          </p>
        </header>

        <section className="space-y-4">
          <p>
            Настоящая Политика объясняет, как сайт EcoVlog использует файлы
            cookie и аналогичные технологии.
          </p>
          <p>
            Владелец сайта — Виноградов Егор. По вопросам использования cookie
            можно обратиться по адресу{" "}
            <a
              className="font-semibold text-lime-400 underline decoration-lime-400/50 underline-offset-4 transition-colors hover:text-lime-300"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <LegalSection title="1. Что такое cookie">
          <p>
            Cookie — это небольшие текстовые файлы, которые сайт сохраняет в
            браузере или на устройстве пользователя. Они позволяют распознавать
            браузер, сохранять выбранные настройки, поддерживать работу отдельных
            функций и получать статистику посещений.
          </p>
          <p>
            Помимо cookie могут применяться локальное хранилище браузера,
            пиксели, идентификаторы устройств и другие технологии с похожим
            назначением.
          </p>
        </LegalSection>

        <LegalSection title="2. Какие cookie могут использоваться">
          <h3 className="text-lg font-semibold text-white">
            Обязательные
          </h3>
          <p>
            Необходимы для загрузки страниц, обеспечения безопасности,
            сохранения пользовательского выбора и работы основных функций сайта.
            Без них отдельные элементы сайта могут работать некорректно.
          </p>

          <h3 className="text-lg font-semibold text-white">
            Функциональные
          </h3>
          <p>
            Запоминают настройки пользователя, например выбранный регион, язык,
            отображение интерфейса или другие предпочтения.
          </p>

          <h3 className="text-lg font-semibold text-white">
            Аналитические
          </h3>
          <p>
            Помогают оценивать посещаемость, популярность страниц, источники
            переходов и взаимодействие пользователей с сайтом. Как правило,
            такие сведения используются в обобщенном или обезличенном виде.
          </p>

          <h3 className="text-lg font-semibold text-white">
            Сторонние
          </h3>
          <p>
            Могут устанавливаться внешними сервисами, материалы которых встроены
            в страницы сайта: картами, видеоплеерами, социальными сетями,
            аналитическими системами и другими платформами.
          </p>
        </LegalSection>

        <LegalSection title="3. Для чего используются cookie">
          <ul className="list-disc space-y-3 pl-6 marker:text-lime-400">
            <li>для корректной и безопасной работы сайта;</li>
            <li>для сохранения пользовательских настроек;</li>
            <li>для анализа посещаемости и производительности;</li>
            <li>для выявления технических ошибок;</li>
            <li>для улучшения структуры, содержания и функций сайта;</li>
            <li>для работы встроенных материалов сторонних сервисов.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Срок действия cookie">
          <p>
            Сеансовые cookie удаляются после закрытия браузера. Постоянные cookie
            могут храниться до истечения установленного срока или до их удаления
            пользователем.
          </p>
          <p>
            Конкретный срок зависит от назначения cookie и настроек сервиса,
            который его установил.
          </p>
        </LegalSection>

        <LegalSection title="5. Согласие пользователя">
          <p>
            Необязательные cookie используются на основании выбора пользователя,
            если получение согласия требуется применимым законодательством.
            Пользователь может принять, отклонить или изменить выбранные
            настройки через доступный на сайте инструмент управления cookie.
          </p>
          <p>
            Обязательные cookie могут использоваться без отдельного согласия,
            поскольку они необходимы для работы сайта и обеспечения его
            безопасности.
          </p>
        </LegalSection>

        <LegalSection title="6. Как отключить cookie">
          <p>
            Пользователь может удалить ранее сохраненные cookie или запретить их
            сохранение в настройках браузера. Порядок управления cookie зависит
            от используемого браузера и устройства.
          </p>
          <p>
            Полное отключение cookie может привести к некорректной работе
            отдельных страниц, форм, настроек и встроенных материалов.
          </p>
        </LegalSection>

        <LegalSection title="7. Сторонние сервисы">
          <p>
            Сторонние сервисы самостоятельно определяют состав, назначение и срок
            хранения своих cookie. Их использование регулируется документами
            соответствующих поставщиков.
          </p>
          <p>
            Владелец сайта не управляет cookie, которые устанавливаются третьими
            лицами после перехода пользователя на внешний ресурс или
            взаимодействия со встроенным элементом.
          </p>
        </LegalSection>

        <LegalSection title="8. Связь с Политикой конфиденциальности">
          <p>
            Дополнительная информация об обработке пользовательских данных
            приведена в{" "}
            <a
              className="font-semibold text-lime-400 underline decoration-lime-400/50 underline-offset-4 transition-colors hover:text-lime-300"
              href="/privacy"
            >
              Политике конфиденциальности
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="9. Изменение Политики">
          <p>
            Настоящая Политика может обновляться при изменении работы сайта,
            используемых технологий или требований законодательства. Новая
            редакция действует с момента публикации на сайте, если в ней не
            указано иное.
          </p>
        </LegalSection>

        <LegalSection title="10. Контакты">
          <p>
            По вопросам использования cookie можно написать на{" "}
            <a
              className="font-semibold text-lime-400 underline decoration-lime-400/50 underline-offset-4 transition-colors hover:text-lime-300"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </LegalSection>
      </article>
    </main>
  );
}

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="space-y-4 text-white/80 [&_strong]:text-white">{children}</div>
    </section>
  );
}
