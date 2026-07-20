"use client";

import Link from "next/link";
import * as React from "react";

import type { LngLat } from "@yandex/ymaps3-types";

import Footer from "@/components/Footer";
import LocationPicker from "@/components/LocationPicker";
import SectionHeader from "@/components/SectionHeader";
import { COMPLAINT_CATEGORIES } from "@/lib/complaints";
import {
  getTotalFileSize,
  optimizeImageFiles,
} from "@/lib/imageOptimizer";
import {
  findRegion,
  REGIONS,
} from "@/lib/regions";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_OPTIMIZED_UPLOAD_SIZE =
  3.6 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const fieldClassName = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-white/[0.055]
  px-4
  py-3
  text-sm
  text-white
  outline-none
  transition
  placeholder:text-white/30
  hover:border-white/20
  focus:border-lime-400/70
  focus:bg-white/[0.075]
  focus:ring-4
  focus:ring-lime-400/10
  disabled:cursor-not-allowed
  disabled:opacity-50
  md:rounded-2xl
  md:px-5
  md:py-4
  md:text-base
`;

type ComplaintApiResponse = {
  success: boolean;
  complaintId?: string;
  documentId?: string;
  message?: string;
  error?: string;
};

function getFileKey(file: File): string {
  return [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");
}

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} КБ`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} МБ`;
}

export default function ReportPage() {
  const formRef =
    React.useRef<HTMLFormElement | null>(
      null,
    );

  const photoInputRef =
    React.useRef<HTMLInputElement | null>(
      null,
    );

  const [regionName, setRegionName] =
    React.useState("");

  const [coordinates, setCoordinates] =
    React.useState<LngLat | null>(null);

  const [address, setAddress] =
    React.useState("");

  const [photos, setPhotos] =
    React.useState<File[]>([]);

  const [
    isConsentAccepted,
    setIsConsentAccepted,
  ] = React.useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = React.useState(false);

  const [
    submissionStage,
    setSubmissionStage,
  ] = React.useState<
    "idle" | "optimizing" | "submitting"
  >("idle");

  const [
    optimizationProgress,
    setOptimizationProgress,
  ] = React.useState({
    current: 0,
    total: 0,
  });

  const [
    submitError,
    setSubmitError,
  ] = React.useState<string | null>(null);

  const [
    photoError,
    setPhotoError,
  ] = React.useState<string | null>(null);

  const [
    complaintId,
    setComplaintId,
  ] = React.useState<string | null>(null);

  const selectedRegion =
    findRegion(regionName);

  function handleRegionChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    setRegionName(event.target.value);
    setCoordinates(null);
    setAddress("");
    setSubmitError(null);
  }

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    setPhotoError(null);
    setSubmitError(null);

    if (selectedFiles.length > MAX_PHOTOS) {
      setPhotoError(
        `Можно загрузить не более ${MAX_PHOTOS} фотографий.`,
      );

      setPhotos([]);
      event.target.value = "";

      return;
    }

    for (const file of selectedFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.has(file.type)
      ) {
        setPhotoError(
          `Файл «${file.name}» имеет неподдерживаемый формат.`,
        );

        setPhotos([]);
        event.target.value = "";

        return;
      }

      if (file.size === 0) {
        setPhotoError(
          `Файл «${file.name}» пустой.`,
        );

        setPhotos([]);
        event.target.value = "";

        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(
          `Размер файла «${file.name}» превышает 10 МБ.`,
        );

        setPhotos([]);
        event.target.value = "";

        return;
      }
    }

    setPhotos(selectedFiles);
  }

  function removePhoto(
    photoToRemove: File,
  ): void {
    setPhotos((currentPhotos) =>
      currentPhotos.filter(
        (photo) =>
          getFileKey(photo) !==
          getFileKey(photoToRemove),
      ),
    );

    setPhotoError(null);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  function resetForm(): void {
    formRef.current?.reset();

    setRegionName("");
    setCoordinates(null);
    setAddress("");
    setPhotos([]);
    setIsConsentAccepted(false);
    setComplaintId(null);
    setSubmitError(null);
    setPhotoError(null);
    setIsSubmitting(false);
    setSubmissionStage("idle");
    setOptimizationProgress({
      current: 0,
      total: 0,
    });

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;

    setSubmitError(null);
    setPhotoError(null);

    /*
     * Важно: считываем FormData до установки isSubmitting.
     * После установки isSubmitting поля становятся disabled,
     * а disabled-поля браузер не добавляет в FormData.
     */
    const formData = new FormData(form);

    const title = String(
      formData.get("title") ?? "",
    ).trim();

    const description = String(
      formData.get("description") ?? "",
    ).trim();

    const phone = String(
      formData.get("phone") ?? "",
    ).trim();

    const email = String(
      formData.get("email") ?? "",
    ).trim();

    if (!title) {
      setSubmitError(
        "Укажите название проблемы.",
      );

      return;
    }

    if (!description) {
      setSubmitError(
        "Добавьте описание проблемы.",
      );

      return;
    }

    if (!selectedRegion) {
      setSubmitError(
        "Выберите регион, в котором обнаружено нарушение.",
      );

      return;
    }

    if (!coordinates) {
      setSubmitError(
        "Укажите место нарушения на карте.",
      );

      return;
    }

    if (!address.trim()) {
      setSubmitError(
        "Не удалось определить адрес выбранной точки. Выберите место на карте повторно.",
      );

      return;
    }

    if (photos.length === 0) {
      setPhotoError(
        "Добавьте хотя бы одну фотографию.",
      );

      return;
    }

    if (!phone) {
      setSubmitError(
        "Укажите телефон.",
      );

      return;
    }

    if (!isConsentAccepted) {
      setSubmitError(
        "Для отправки обращения необходимо дать согласие на обработку персональных данных.",
      );

      return;
    }

    formData.set("title", title);
    formData.set(
      "description",
      description,
    );
    formData.set("phone", phone);
    formData.set("email", email);

    setIsSubmitting(true);
    setSubmissionStage("optimizing");
    setOptimizationProgress({
      current: 0,
      total: photos.length,
    });

    try {
      const optimizedPhotos =
        await optimizeImageFiles(
          photos,
          ({ current, total }) => {
            setOptimizationProgress({
              current,
              total,
            });
          },
        );

      const optimizedTotalSize =
        getTotalFileSize(
          optimizedPhotos,
        );

      if (
        optimizedTotalSize >
        MAX_OPTIMIZED_UPLOAD_SIZE
      ) {
        setPhotoError(
          `Фотографии всё ещё весят слишком много даже после автоматической оптимизации: ${formatFileSize(
            optimizedTotalSize,
          )}. Попробуйте загрузить меньше фотографий или предварительно обрезать их.`,
        );

        return;
      }

      formData.set(
        "region",
        selectedRegion.name,
      );

      formData.set(
        "address",
        address.trim(),
      );

      formData.set(
        "latitude",
        String(coordinates[1]),
      );

      formData.set(
        "longitude",
        String(coordinates[0]),
      );

      formData.set(
        "personalDataConsent",
        "accepted",
      );

      formData.delete("photos");

      for (const photo of optimizedPhotos) {
        formData.append(
          "photos",
          photo,
        );
      }

      setSubmissionStage("submitting");

      const response = await fetch(
        "/api/complaints",
        {
          method: "POST",
          body: formData,
        },
      );

      const responseText =
        await response.text();

      let result: ComplaintApiResponse | null =
        null;

      if (responseText) {
        try {
          result = JSON.parse(
            responseText,
          ) as ComplaintApiResponse;
        } catch {
          result = null;
        }
      }

      if (response.status === 413) {
        throw new Error(
          "Фотографии весят слишком много для отправки. Попробуйте загрузить меньше фотографий или предварительно обрезать их.",
        );
      }

      if (!result) {
        throw new Error(
          response.ok
            ? "Сервер не смог обработать обращение. Попробуйте отправить его ещё раз."
            : "Не удалось отправить обращение. Попробуйте уменьшить количество фотографий и повторить попытку.",
        );
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Не удалось отправить обращение.",
        );
      }

      if (!result.complaintId) {
        throw new Error(
          "Обращение создано, но сервер не вернул его номер.",
        );
      }

      setComplaintId(
        result.complaintId,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Complaint form submission error:",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить обращение. Попробуйте ещё раз.",
      );
    } finally {
      setIsSubmitting(false);
      setSubmissionStage("idle");
      setOptimizationProgress({
        current: 0,
        total: 0,
      });
    }
  }

  if (complaintId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <SectionHeader current="/map" />

        <section className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-4 py-10 md:px-6 md:py-16">
          <div className="w-full rounded-[26px] border border-white/10 bg-white/[0.05] p-6 text-center shadow-2xl backdrop-blur-2xl md:rounded-[32px] md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-2xl font-black text-neutral-950 md:h-16 md:w-16 md:text-3xl">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold md:mt-6 md:text-4xl">
              Обращение отправлено
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60 md:mt-4 md:text-base md:leading-7">
              Мы получили информацию
              о нарушении. Обращение
              направлено на модерацию
              и появится на Экокарте
              после проверки.
            </p>

            <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] px-4 py-4 md:mt-7 md:px-5 md:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                Номер обращения
              </p>

              <p className="mt-2 text-xl font-bold tracking-wide text-lime-300 md:text-2xl">
                {complaintId}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/40 md:text-sm md:leading-6">
                Сохраните этот номер.
                Он поможет
                идентифицировать ваше
                обращение.
              </p>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row md:mt-8 md:gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-lime-300 md:px-7 md:py-4 md:text-base"
                href="/map"
              >
                Вернуться к Экокарте
              </Link>

              <button
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] md:px-7 md:py-4 md:text-base"
                onClick={resetForm}
                type="button"
              >
                Отправить ещё одно
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SectionHeader current="/map" />

      <section className="mx-auto max-w-5xl px-3 pb-14 pt-3 sm:px-4 md:px-6 md:pb-28 md:pt-20">
        <div className="text-center">
          <Link
            className="inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white md:text-sm"
            href="/map"
          >
            <span aria-hidden="true">
              ←
            </span>

            Вернуться к Экокарте
          </Link>

          <h1 className="mt-3 text-2xl font-bold tracking-tight md:mt-6 md:text-5xl">
            Сообщить о нарушении
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/55 md:mt-4 md:text-lg md:leading-7">
            Опишите экологическую
            проблему, приложите
            фотографии и укажите
            точное место на карте.
          </p>
        </div>

        <form
          className="
            mt-5
            rounded-[22px]
            border
            border-white/10
            bg-white/[0.035]
            p-4
            shadow-[0_35px_120px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
            md:mt-14
            md:rounded-[38px]
            md:p-10
          "
          encType="multipart/form-data"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          ref={formRef}
        >
          <div className="space-y-4 md:space-y-7">
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="title"
              >
                Название проблемы
              </label>

              <input
                autoComplete="off"
                className={fieldClassName}
                disabled={isSubmitting}
                id="title"
                maxLength={140}
                name="title"
                placeholder="Например: незаконная свалка возле леса"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="description"
              >
                Описание проблемы
              </label>

              <textarea
                className={`${fieldClassName} min-h-28 resize-y md:min-h-40`}
                disabled={isSubmitting}
                id="description"
                maxLength={3000}
                name="description"
                placeholder="Расскажите, что произошло, как давно существует нарушение и что находится рядом"
                required
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="category"
              >
                Категория нарушения
              </label>

              <select
                className={fieldClassName}
                defaultValue=""
                disabled={isSubmitting}
                id="category"
                name="category"
                required
              >
                <option
                  className="bg-neutral-900"
                  disabled
                  value=""
                >
                  Выберите категорию
                </option>

                {COMPLAINT_CATEGORIES.map(
                  (category) => (
                    <option
                      className="bg-neutral-900"
                      key={category.value}
                      value={category.value}
                    >
                      {category.title}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="region"
              >
                Регион
              </label>

              <select
                className={fieldClassName}
                disabled={isSubmitting}
                id="region"
                name="region"
                onChange={
                  handleRegionChange
                }
                required
                value={regionName}
              >
                <option
                  className="bg-neutral-900"
                  disabled
                  value=""
                >
                  Выберите регион
                </option>

                {REGIONS.map(
                  (region) => (
                    <option
                      className="bg-neutral-900"
                      key={region.name}
                      value={region.name}
                    >
                      {region.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {selectedRegion ? (
              <div className="animate-[fadeIn_.35s_ease-out]">
                <div
                  className={
                    isSubmitting
                      ? "pointer-events-none opacity-60"
                      : ""
                  }
                >
                  <LocationPicker
                    key={
                      selectedRegion.name
                    }
                    onAddressChange={
                      setAddress
                    }
                    onChange={
                      setCoordinates
                    }
                    region={
                      selectedRegion
                    }
                    value={coordinates}
                  />
                </div>

                <input
                  name="address"
                  type="hidden"
                  value={address}
                />

                <input
                  name="latitude"
                  type="hidden"
                  value={
                    coordinates?.[1] ??
                    ""
                  }
                />

                <input
                  name="longitude"
                  type="hidden"
                  value={
                    coordinates?.[0] ??
                    ""
                  }
                />

                {!coordinates && (
                  <p className="mt-2 text-xs leading-5 text-amber-300/80 md:mt-3 md:text-sm">
                    Для отправки
                    обращения необходимо
                    отметить место
                    нарушения.
                  </p>
                )}

                {coordinates &&
                  !address && (
                    <p className="mt-2 text-xs leading-5 text-amber-300/80 md:mt-3 md:text-sm">
                      Определяем адрес
                      выбранной точки.
                    </p>
                  )}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.025] px-5 py-7 text-center md:rounded-[26px] md:px-6 md:py-12">
                <p className="text-sm font-medium text-white/65 md:text-base">
                  Сначала выберите
                  регион
                </p>

                <p className="mt-1 text-xs text-white/35 md:mt-2 md:text-sm">
                  После этого здесь
                  появится Яндекс Карта.
                </p>
              </div>
            )}

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="photos"
              >
                Фотографии
              </label>

              <label
                className={`
                  flex
                  min-h-32
                  flex-col
                  items-center
                  justify-center
                  rounded-[20px]
                  border
                  border-dashed
                  px-4
                  py-5
                  text-center
                  transition
                  md:min-h-48
                  md:rounded-[26px]
                  md:px-6
                  md:py-8
                  ${
                    isSubmitting
                      ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-50"
                      : "cursor-pointer border-white/15 bg-white/[0.025] hover:border-lime-400/50 hover:bg-lime-400/[0.04]"
                  }
                `}
                htmlFor="photos"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-xl md:h-12 md:w-12 md:text-2xl">
                  +
                </span>

                <span className="mt-2 text-sm font-semibold md:mt-4 md:text-base">
                  Добавить фотографии
                </span>

                <span className="mt-1 text-xs text-white/40 md:mt-2 md:text-sm">
                  От 1 до 5 файлов,
                  не более 10 МБ каждый
                </span>

                <span className="mt-0.5 text-[11px] text-white/30 md:mt-1 md:text-xs">
                  Перед отправкой фотографии
                  автоматически сжимаются
                </span>

                <span className="mt-0.5 text-[11px] text-white/30 md:mt-1 md:text-xs">
                  JPEG, PNG, WEBP,
                  HEIC
                </span>

                <input
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="sr-only"
                  disabled={isSubmitting}
                  id="photos"
                  multiple
                  name="photos"
                  onChange={
                    handlePhotoChange
                  }
                  ref={photoInputRef}
                  type="file"
                />
              </label>

              {photoError && (
                <p className="mt-2 text-xs leading-5 text-red-300 md:mt-3 md:text-sm md:leading-6">
                  {photoError}
                </p>
              )}

              {photos.length > 0 && (
                <div className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
                  {photos.map(
                    (photo) => (
                      <div
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 md:gap-4 md:rounded-2xl md:px-4 md:py-3"
                        key={getFileKey(
                          photo,
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-white/75 md:text-sm">
                            {photo.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-white/35 md:mt-1 md:text-xs">
                            {formatFileSize(
                              photo.size,
                            )}
                          </p>
                        </div>

                        <button
                          aria-label={`Удалить фотографию ${photo.name}`}
                          className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/50 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40 md:px-3 md:py-1.5 md:text-xs"
                          disabled={
                            isSubmitting
                          }
                          onClick={() => {
                            removePhoto(
                              photo,
                            );
                          }}
                          type="button"
                        >
                          Удалить
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                  htmlFor="name"
                >
                  Ваше имя
                  <span className="ml-1.5 text-xs font-normal text-white/35 md:ml-2 md:text-base">
                    необязательно
                  </span>
                </label>

                <input
                  autoComplete="name"
                  className={fieldClassName}
                  disabled={isSubmitting}
                  id="name"
                  maxLength={150}
                  name="name"
                  placeholder="Как к вам обращаться"
                  type="text"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                  htmlFor="phone"
                >
                  Телефон
                </label>

                <input
                  autoComplete="tel"
                  className={fieldClassName}
                  disabled={isSubmitting}
                  id="phone"
                  inputMode="tel"
                  maxLength={50}
                  name="phone"
                  placeholder="+7"
                  required
                  type="tel"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="email"
              >
                Электронная почта
                <span className="ml-1.5 text-xs font-normal text-white/35 md:ml-2 md:text-base">
                  необязательно
                </span>
              </label>

              <input
                autoComplete="email"
                className={fieldClassName}
                disabled={isSubmitting}
                id="email"
                maxLength={254}
                name="email"
                placeholder="name@example.ru"
                type="email"
              />

              <p className="mt-1.5 text-xs leading-5 text-white/35 md:mt-2 md:text-sm md:leading-6">
                Укажите действующий
                номер телефона, чтобы
                мы могли связаться с
                вами.
              </p>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold md:mb-3 md:text-base"
                htmlFor="videoUrl"
              >
                Ссылка на видео
                <span className="ml-1.5 text-xs font-normal text-white/35 md:ml-2 md:text-base">
                  необязательно
                </span>
              </label>

              <input
                className={fieldClassName}
                disabled={isSubmitting}
                id="videoUrl"
                maxLength={2048}
                name="videoUrl"
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 md:mt-10 md:pt-7">
            {submitError && (
              <div
                className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-xs leading-5 text-red-200 md:mb-5 md:rounded-2xl md:px-5 md:py-4 md:text-sm md:leading-6"
                role="alert"
              >
                {submitError}
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:mb-6 md:p-5">
              <label
                className={`
                  flex
                  items-start
                  gap-3
                  ${
                    isSubmitting
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }
                `}
                htmlFor="personalDataConsent"
              >
                <input
                  checked={
                    isConsentAccepted
                  }
                  className="
                    mt-0.5
                    h-5
                    w-5
                    shrink-0
                    cursor-pointer
                    accent-lime-400
                    disabled:cursor-not-allowed
                  "
                  disabled={isSubmitting}
                  id="personalDataConsent"
                  name="personalDataConsent"
                  onChange={(event) => {
                    setIsConsentAccepted(
                      event.target.checked,
                    );

                    if (
                      event.target.checked
                    ) {
                      setSubmitError(null);
                    }
                  }}
                  required
                  type="checkbox"
                  value="accepted"
                />

                <span className="text-xs leading-5 text-white/60 md:text-sm md:leading-6">
                  Я даю согласие на{" "}
                  <Link
                    className="text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-lime-300"
                    href="/privacy"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    обработку персональных данных
                  </Link>
                  {" "}и принимаю{" "}
                  <Link
                    className="text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-lime-300"
                    href="/terms"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Пользовательское соглашение
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              className="
                flex
                w-full
                items-center
                justify-center
                rounded-full
                bg-lime-400
                px-6
                py-3.5
                text-sm
                font-bold
                text-neutral-950
                transition
                hover:bg-lime-300
                disabled:cursor-not-allowed
                disabled:bg-white/10
                disabled:text-white/30
                md:px-7
                md:py-4
                md:text-lg
              "
              disabled={
                isSubmitting ||
                !coordinates ||
                !address ||
                photos.length === 0 ||
                !isConsentAccepted
              }
              type="submit"
            >
              {submissionStage ===
              "optimizing"
                ? optimizationProgress.total >
                  0
                  ? `Оптимизируем фотографии… ${optimizationProgress.current} из ${optimizationProgress.total}`
                  : "Оптимизируем фотографии…"
                : submissionStage ===
                    "submitting"
                  ? "Отправляем обращение…"
                  : "Отправить обращение"}
            </button>

            <p className="mx-auto mt-3 max-w-2xl text-center text-[11px] leading-4 text-white/30 md:mt-4 md:text-xs md:leading-5">
              Отправить обращение можно
              только после подтверждения
              согласия.
            </p>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}