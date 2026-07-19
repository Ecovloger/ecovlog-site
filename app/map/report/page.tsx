"use client";

import Link from "next/link";
import * as React from "react";

import type { LngLat } from "@yandex/ymaps3-types";

import Footer from "@/components/Footer";
import LocationPicker from "@/components/LocationPicker";
import SectionHeader from "@/components/SectionHeader";
import { COMPLAINT_CATEGORIES } from "@/lib/complaints";
import {
  findRegion,
  REGIONS,
} from "@/lib/regions";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const fieldClassName = `
  w-full
  rounded-2xl
  border
  border-white/10
  bg-white/[0.055]
  px-5
  py-4
  text-base
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
`;

type ComplaintApiResponse = {
  success: boolean;
  complaintId?: string;
  documentId?: string;
  message?: string;
  error?: string;
};

function getFileKey(
  file: File,
): string {
  return [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");
}

function formatFileSize(
  size: number,
): string {
  if (size < 1024 * 1024) {
    return `${Math.ceil(
      size / 1024,
    )} КБ`;
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
    React.useState<LngLat | null>(
      null,
    );

  const [address, setAddress] =
    React.useState("");

  const [photos, setPhotos] =
    React.useState<File[]>([]);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = React.useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    React.useState<string | null>(
      null,
    );

  const [
    photoError,
    setPhotoError,
  ] =
    React.useState<string | null>(
      null,
    );

  const [
    complaintId,
    setComplaintId,
  ] =
    React.useState<string | null>(
      null,
    );

  const selectedRegion =
    findRegion(regionName);

  function handleRegionChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    setRegionName(
      event.target.value,
    );

    setCoordinates(null);
    setAddress("");
    setSubmitError(null);
  }

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      );

    setPhotoError(null);
    setSubmitError(null);

    if (
      selectedFiles.length >
      MAX_PHOTOS
    ) {
      setPhotoError(
        `Можно загрузить не более ${MAX_PHOTOS} фотографий.`,
      );

      setPhotos([]);
      event.target.value = "";

      return;
    }

    for (const file of selectedFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.has(
          file.type,
        )
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

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
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
    setPhotos(
      (currentPhotos) =>
        currentPhotos.filter(
          (photo) =>
            getFileKey(photo) !==
            getFileKey(
              photoToRemove,
            ),
        ),
    );

    setPhotoError(null);

    if (
      photoInputRef.current
    ) {
      photoInputRef.current.value =
        "";
    }
  }

  function resetForm(): void {
    formRef.current?.reset();

    setRegionName("");
    setCoordinates(null);
    setAddress("");
    setPhotos([]);
    setComplaintId(null);
    setSubmitError(null);
    setPhotoError(null);
    setIsSubmitting(false);

    if (
      photoInputRef.current
    ) {
      photoInputRef.current.value =
        "";
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

    setSubmitError(null);
    setPhotoError(null);

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

    const formData =
      new FormData(
        event.currentTarget,
      );

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

    formData.delete("photos");

    for (const photo of photos) {
      formData.append(
        "photos",
        photo,
      );
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/complaints",
        {
          method: "POST",
          body: formData,
        },
      );

      let result: ComplaintApiResponse;

      try {
        result =
          (await response.json()) as ComplaintApiResponse;
      } catch {
        throw new Error(
          "Сервер вернул некорректный ответ.",
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
    }
  }

  if (complaintId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <SectionHeader current="/map" />

        <section className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-4 py-16 md:px-6">
          <div className="w-full rounded-[32px] border border-white/10 bg-white/[0.05] p-7 text-center shadow-2xl backdrop-blur-2xl md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-3xl font-black text-neutral-950">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold md:text-4xl">
              Обращение отправлено
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/60">
              Мы получили информацию
              о нарушении. Обращение
              направлено на модерацию
              и появится на Экокарте
              после проверки.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                Номер обращения
              </p>

              <p className="mt-2 text-2xl font-bold tracking-wide text-lime-300">
                {complaintId}
              </p>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Сохраните этот номер.
                Он поможет
                идентифицировать ваше
                обращение.
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-lime-400 px-7 py-4 font-semibold text-neutral-950 transition hover:bg-lime-300"
                href="/map"
              >
                Вернуться к Экокарте
              </Link>

              <button
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
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

      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 md:px-6 md:pb-28 md:pt-20">
        <div className="text-center">
          <Link
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
            href="/map"
          >
            <span aria-hidden="true">
              ←
            </span>
            Вернуться к Экокарте
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl">
            Сообщить о нарушении
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
            Опишите экологическую
            проблему, приложите
            фотографии и укажите
            точное место на карте.
          </p>
        </div>

        <form
          className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:mt-14 md:rounded-[38px] md:p-10"
          encType="multipart/form-data"
          onSubmit={(event) => {
            void handleSubmit(
              event,
            );
          }}
          ref={formRef}
        >
          <div className="space-y-7">
            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="title"
              >
                Название проблемы
              </label>

              <input
                autoComplete="off"
                className={
                  fieldClassName
                }
                disabled={
                  isSubmitting
                }
                id="title"
                maxLength={140}
                minLength={5}
                name="title"
                placeholder="Например: незаконная свалка возле леса"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="description"
              >
                Описание проблемы
              </label>

              <textarea
                className={`${fieldClassName} min-h-40 resize-y`}
                disabled={
                  isSubmitting
                }
                id="description"
                maxLength={3000}
                minLength={20}
                name="description"
                placeholder="Расскажите, что произошло, как давно существует нарушение и что находится рядом"
                required
              />
            </div>

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="category"
              >
                Категория нарушения
              </label>

              <select
                className={
                  fieldClassName
                }
                defaultValue=""
                disabled={
                  isSubmitting
                }
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
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {
                        category.title
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="region"
              >
                Регион
              </label>

              <select
                className={
                  fieldClassName
                }
                disabled={
                  isSubmitting
                }
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
                      value={
                        region.name
                      }
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
                    value={
                      coordinates
                    }
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
                  <p className="mt-3 text-sm text-amber-300/80">
                    Для отправки
                    обращения необходимо
                    отметить место
                    нарушения.
                  </p>
                )}

                {coordinates &&
                  !address && (
                    <p className="mt-3 text-sm text-amber-300/80">
                      Определяем адрес
                      выбранной точки.
                    </p>
                  )}
              </div>
            ) : (
              <div className="rounded-[26px] border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center">
                <p className="font-medium text-white/65">
                  Сначала выберите
                  регион
                </p>

                <p className="mt-2 text-sm text-white/35">
                  После этого здесь
                  появится Яндекс Карта.
                </p>
              </div>
            )}

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="photos"
              >
                Фотографии
              </label>

              <label
                className={`
                  flex
                  min-h-48
                  flex-col
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-dashed
                  px-6
                  py-8
                  text-center
                  transition
                  ${
                    isSubmitting
                      ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-50"
                      : "cursor-pointer border-white/15 bg-white/[0.025] hover:border-lime-400/50 hover:bg-lime-400/[0.04]"
                  }
                `}
                htmlFor="photos"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-2xl">
                  +
                </span>

                <span className="mt-4 font-semibold">
                  Добавить фотографии
                </span>

                <span className="mt-2 text-sm text-white/40">
                  От 1 до 5 файлов,
                  не более 10 МБ
                  каждый
                </span>

                <span className="mt-1 text-xs text-white/30">
                  JPEG, PNG, WEBP,
                  HEIC
                </span>

                <input
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="sr-only"
                  disabled={
                    isSubmitting
                  }
                  id="photos"
                  multiple
                  name="photos"
                  onChange={
                    handlePhotoChange
                  }
                  ref={
                    photoInputRef
                  }
                  type="file"
                />
              </label>

              {photoError && (
                <p className="mt-3 text-sm leading-6 text-red-300">
                  {photoError}
                </p>
              )}

              {photos.length >
                0 && (
                <div className="mt-4 space-y-2">
                  {photos.map(
                    (photo) => (
                      <div
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
                        key={getFileKey(
                          photo,
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/75">
                            {
                              photo.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            {formatFileSize(
                              photo.size,
                            )}
                          </p>
                        </div>

                        <button
                          aria-label={`Удалить фотографию ${photo.name}`}
                          className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
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

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  className="mb-3 block text-base font-semibold"
                  htmlFor="name"
                >
                  Ваше имя
                  <span className="ml-2 font-normal text-white/35">
                    необязательно
                  </span>
                </label>

                <input
                  autoComplete="name"
                  className={
                    fieldClassName
                  }
                  disabled={
                    isSubmitting
                  }
                  id="name"
                  maxLength={150}
                  name="name"
                  placeholder="Как к вам обращаться"
                  type="text"
                />
              </div>

              <div>
                <label
                  className="mb-3 block text-base font-semibold"
                  htmlFor="phone"
                >
                  Телефон
                  <span className="ml-2 font-normal text-white/35">
                    необязательно
                  </span>
                </label>

                <input
                  autoComplete="tel"
                  className={
                    fieldClassName
                  }
                  disabled={
                    isSubmitting
                  }
                  id="phone"
                  inputMode="tel"
                  maxLength={50}
                  name="phone"
                  placeholder="+7"
                  type="tel"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="email"
              >
                Электронная почта
                <span className="ml-2 font-normal text-white/35">
                  необязательно
                </span>
              </label>

              <input
                autoComplete="email"
                className={
                  fieldClassName
                }
                disabled={
                  isSubmitting
                }
                id="email"
                maxLength={254}
                name="email"
                placeholder="name@example.ru"
                type="email"
              />

              <p className="mt-2 text-sm leading-6 text-white/35">
                Укажите телефон или
                электронную почту, чтобы
                мы могли связаться с
                вами.
              </p>
            </div>

            <div>
              <label
                className="mb-3 block text-base font-semibold"
                htmlFor="videoUrl"
              >
                Ссылка на видео
                <span className="ml-2 font-normal text-white/35">
                  необязательно
                </span>
              </label>

              <input
                className={
                  fieldClassName
                }
                disabled={
                  isSubmitting
                }
                id="videoUrl"
                maxLength={2048}
                name="videoUrl"
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-7">
            {submitError && (
              <div
                className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.07] px-5 py-4 text-sm leading-6 text-red-200"
                role="alert"
              >
                {submitError}
              </div>
            )}

            <button
              className="
                flex
                w-full
                items-center
                justify-center
                rounded-full
                bg-lime-400
                px-7
                py-4
                text-base
                font-bold
                text-neutral-950
                transition
                hover:bg-lime-300
                disabled:cursor-not-allowed
                disabled:bg-white/10
                disabled:text-white/30
                md:text-lg
              "
              disabled={
                isSubmitting ||
                !coordinates ||
                !address ||
                photos.length === 0
              }
              type="submit"
            >
              {isSubmitting
                ? "Отправляем обращение…"
                : "Отправить обращение"}
            </button>

            <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-5 text-white/35">
              Нажимая «Отправить
              обращение», вы
              соглашаетесь с{" "}
              <Link
                className="underline decoration-white/25 underline-offset-4 transition hover:text-white/65"
                href="/privacy"
              >
                условиями обработки
                персональных данных
              </Link>
              .
            </p>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}