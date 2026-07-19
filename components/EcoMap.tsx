"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import type { ReactifiedModule } from "@yandex/ymaps3-types/reactify/reactify";

export type MapComplaint = {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  region: string;
  address: string;
  latitude: number;
  longitude: number;
  status: "inProgress" | "resolved";
  createdAt: string;
  imageUrl?: string;
};

type EcoMapProps = {
  complaints: MapComplaint[];
};

type ReactifiedApi = ReactifiedModule<typeof ymaps3>;

function getStatusLabel(status: MapComplaint["status"]): string {
  return status === "resolved" ? "Решено" : "В работе";
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function waitForYandexMaps(timeout = 15000): Promise<typeof ymaps3> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const checkApi = () => {
      if (window.ymaps3) {
        resolve(window.ymaps3);
        return;
      }

      if (Date.now() - startedAt >= timeout) {
        reject(
          new Error(
            "API Яндекс Карт не загрузился за 15 секунд. Проверьте ключ, ограничения Referer и загрузку скрипта.",
          ),
        );
        return;
      }

      window.setTimeout(checkApi, 100);
    };

    checkApi();
  });
}

export default function EcoMap({ complaints }: EcoMapProps) {
  const [reactifiedApi, setReactifiedApi] =
    React.useState<ReactifiedApi | null>(null);

  const [selectedComplaint, setSelectedComplaint] =
    React.useState<MapComplaint | null>(null);

  const [mapError, setMapError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    async function initializeMap(): Promise<void> {
      try {
        const yandexMaps = await waitForYandexMaps();

        await yandexMaps.ready;

        const ymaps3React = await yandexMaps.import(
          "@yandex/ymaps3-reactify",
        );

        if (isCancelled) {
          return;
        }

        const reactify = ymaps3React.reactify.bindTo(
          React,
          ReactDOM,
        );

        const api = reactify.module(yandexMaps);

        setReactifiedApi(api);
      } catch (error) {
        console.error("Yandex Maps initialization error:", error);

        if (!isCancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить Яндекс Карты.",
          );
        }
      }
    }

    initializeMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  const validComplaints = React.useMemo(
    () =>
      complaints.filter(
        (complaint) =>
          Number.isFinite(complaint.latitude) &&
          Number.isFinite(complaint.longitude),
      ),
    [complaints],
  );

  const initialLocation = React.useMemo(
    () => ({
      center:
        validComplaints.length > 0
          ? ([
              validComplaints[0].longitude,
              validComplaints[0].latitude,
            ] as [number, number])
          : ([37.6173, 55.7558] as [number, number]),
      zoom: validComplaints.length > 0 ? 8 : 4,
    }),
    [validComplaints],
  );

  if (mapError) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/15 bg-neutral-950/95 px-6 text-center md:min-h-[680px]">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold">
            Карта временно недоступна
          </h2>

          <p className="mt-3 text-base text-white/60">
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  if (!reactifiedApi) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/15 bg-neutral-950/90 md:min-h-[680px]">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-white/20 border-t-white" />

          <p className="mt-4 text-lg font-medium">
            Загружаем Экокарту
          </p>
        </div>
      </div>
    );
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
  } = reactifiedApi;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
      <div className="h-[520px] w-full md:h-[680px]">
        <YMap location={initialLocation}>
          <YMapDefaultSchemeLayer />
          <YMapDefaultFeaturesLayer />

          {validComplaints.map((complaint) => (
            <YMapMarker
              key={complaint._id}
              coordinates={[
                complaint.longitude,
                complaint.latitude,
              ]}
            >
              <button
                type="button"
                aria-label={`Открыть жалобу ${complaint.complaintId}`}
                onClick={() => setSelectedComplaint(complaint)}
                className={`
                  flex
                  h-11
                  w-11
                  -translate-x-1/2
                  -translate-y-full
                  items-center
                  justify-center
                  rounded-full
                  border-[3px]
                  border-white
                  text-xl
                  font-bold
                  text-white
                  shadow-[0_8px_24px_rgba(0,0,0,0.45)]
                  transition
                  hover:scale-110
                  ${
                    complaint.status === "resolved"
                      ? "bg-green-600"
                      : "bg-amber-500"
                  }
                `}
              >
                !
              </button>
            </YMapMarker>
          ))}
        </YMap>
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-2xl border border-white/15 bg-black/75 px-4 py-3 text-left shadow-xl backdrop-blur-xl md:left-5 md:top-5">
        <p className="text-sm font-semibold">
          Нарушений на карте: {validComplaints.length}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <span className="flex items-center gap-2 text-white/70">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            В работе
          </span>

          <span className="flex items-center gap-2 text-white/70">
            <span className="h-3 w-3 rounded-full bg-green-600" />
            Решено
          </span>
        </div>
      </div>

      {selectedComplaint && (
        <>
          <button
            type="button"
            aria-label="Закрыть информацию о жалобе"
            onClick={() => setSelectedComplaint(null)}
            className="absolute inset-0 z-30 cursor-default bg-black/35 backdrop-blur-[2px]"
          />

          <article className="absolute bottom-3 left-3 right-3 z-40 max-h-[calc(100%-24px)] overflow-y-auto rounded-3xl border border-white/15 bg-neutral-950/95 p-5 text-left shadow-2xl backdrop-blur-2xl md:bottom-5 md:left-auto md:right-5 md:top-5 md:w-[390px] md:p-6">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl leading-none transition hover:bg-white/20"
            >
              ×
            </button>

            {selectedComplaint.imageUrl && (
              <img
                src={selectedComplaint.imageUrl}
                alt={selectedComplaint.title}
                className="mb-5 h-48 w-full rounded-2xl object-cover"
              />
            )}

            <div className="pr-12">
              <span
                className={`
                  inline-flex
                  rounded-full
                  px-3
                  py-1
                  text-sm
                  font-semibold
                  ${
                    selectedComplaint.status === "resolved"
                      ? "bg-green-600/20 text-green-300"
                      : "bg-amber-500/20 text-amber-300"
                  }
                `}
              >
                {getStatusLabel(selectedComplaint.status)}
              </span>

              <p className="mt-3 text-sm text-white/45">
                {selectedComplaint.complaintId}
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-bold leading-tight">
              {selectedComplaint.title}
            </h2>

            <p className="mt-3 text-sm text-white/50">
              {selectedComplaint.category}
            </p>

            <p className="mt-4 whitespace-pre-line text-base leading-7 text-white/75">
              {selectedComplaint.description}
            </p>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div>
                <p className="text-white/40">Адрес</p>
                <p className="mt-1 text-white/80">
                  {selectedComplaint.address}
                </p>
              </div>

              <div>
                <p className="text-white/40">Регион</p>
                <p className="mt-1 text-white/80">
                  {selectedComplaint.region}
                </p>
              </div>

              <div>
                <p className="text-white/40">Дата обращения</p>
                <p className="mt-1 text-white/80">
                  {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  );
}