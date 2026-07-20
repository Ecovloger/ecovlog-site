import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика cookie | EcoVlog",
  description:
    "Информация об использовании файлов cookie и аналогичных технологий на сайте EcoVlog.",
};

const UPDATED_AT = "20 июля 2026 года";
const CONTACT_EMAIL = "ya-gr@mail.ru";

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-10 text-neutral-800">
        <header className="space-y-4 border-b border-neutral-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Политика использования файлов cookie
          </h1>
          <p className="text-sm text-neutral-500">
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
              className="font-medium underline underline-offset-4"
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
          <h3 className="text-lg font-semibold text-neutral-950">
            Обязательные
          </h3>
          <p>
            Необходимы для загрузки страниц, обеспечения безопасности,
            сохранения пользовательского выбора и работы основных функций сайта.
            Без них отдельные элементы сайта могут работать некорректно.
          </p>

          <h3 className="text-lg font-semibold text-neutral-950">
            Функциональные
          </h3>
          <p>
            Запоминают настройки пользователя, например выбранный регион, язык,
            отображение интерфейса или другие предпочтения.
          </p>

          <h3 className="text-lg font-semibold text-neutral-950">
            Аналитические
          </h3>
          <p>
            Помогают оценивать посещаемость, популярность страниц, источники
            переходов и взаимодействие пользователей с сайтом. Как правило,
            такие сведения используются в обобщенном или обезличенном виде.
          </p>

          <h3 className="text-lg font-semibold text-neutral-950">
            Сторонние
          </h3>
          <p>
            Могут устанавливаться внешними сервисами, материалы которых встроены
            в страницы сайта: картами, видеоплеерами, социальными сетями,
            аналитическими системами и другими платформами.
          </p>
        </LegalSection>

        <LegalSection title="3. Для чего используются cookie">
          <ul className="list-disc space-y-2 pl-6">
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
              className="font-medium underline underline-offset-4"
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
              className="font-medium underline underline-offset-4"
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
  children: React.ReactNode;
};

function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
        {title}
      </h2>
      <div className="space-y-4 leading-7">{children}</div>
    </section>
  );
}
