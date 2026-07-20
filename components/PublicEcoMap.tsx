"use client";

import Link from "next/link";
import * as React from "react";
import * as ReactDOM from "react-dom";

import type {
  LngLat,
  YMapLocationRequest,
} from "@yandex/ymaps3-types";
import type { ReactifiedModule } from "@yandex/ymaps3-types/reactify/reactify";
import type {
  Feature,
  clusterByGrid as ClusterByGridFunction,
} from "@yandex/ymaps3-clusterer";

import {
  getComplaintCategoryTitle,
} from "@/lib/complaints";
import {
  getPublicComplaintStatusTitle,
  type PublicComplaint,
} from "@/lib/publicComplaints";

export type {
  PublicComplaint,
} from "@/lib/publicComplaints";

import RussiaRegionSelector, {
  type RussiaRegion,
} from "./RussiaRegionSelector";

type PublicEcoMapProps = {
  complaints: PublicComplaint[];
};

type ReactifiedYandexMaps = ReactifiedModule<
  typeof ymaps3
>;

type ClustererModule =
  typeof import("@yandex/ymaps3-clusterer");

type ReactifiedClustererModule =
  ReactifiedModule<ClustererModule>;

type LoadedMapModules = {
  maps: ReactifiedYandexMaps;
  clusterer: ReactifiedClustererModule;
  clusterByGrid: typeof ClusterByGridFunction;
};

type RegionMapLocation = {
  center: LngLat;
  zoom: number;
};

type ComplaintFeature = Feature & {
  id: string;
  geometry: {
    type: "Point";
    coordinates: LngLat;
  };
};

const DEFAULT_REGION_LOCATION: RegionMapLocation = {
  center: [90, 61],
  zoom: 3,
};

const CLUSTER_GRID_SIZE = 64;
const DESCRIPTION_PREVIEW_LENGTH = 180;

const REGION_LOCATIONS: Record<
  string,
  RegionMapLocation
> = {
  AD: { center: [40.1, 44.5], zoom: 8 },
  AL: { center: [86.9, 50.9], zoom: 6 },
  ALT: { center: [83.8, 52.7], zoom: 6 },
  AMU: { center: [128.1, 53.4], zoom: 5 },
  ARK: { center: [43.3, 63.5], zoom: 5 },
  AST: { center: [47.2, 47.2], zoom: 7 },
  BA: { center: [56.3, 54.4], zoom: 6 },
  BEL: { center: [36.6, 50.8], zoom: 7 },
  BRY: { center: [33.4, 52.9], zoom: 7 },
  BU: { center: [109.5, 53.5], zoom: 6 },
  CE: { center: [45.7, 43.3], zoom: 8 },
  CHE: { center: [60.4, 54.4], zoom: 6 },
  CHU: { center: [172, 66.5], zoom: 4 },
  CR: { center: [34.2, 45.2], zoom: 7 },
  CU: { center: [47.1, 55.4], zoom: 8 },
  DA: { center: [47.1, 42.3], zoom: 7 },
  IN: { center: [44.8, 43.2], zoom: 9 },
  IRK: { center: [105.3, 56.9], zoom: 5 },
  IVA: { center: [41.2, 57], zoom: 8 },
  KAM: { center: [159.5, 56.1], zoom: 5 },
  KB: { center: [43.4, 43.5], zoom: 8 },
  KC: { center: [41.7, 43.8], zoom: 8 },
  KDA: { center: [39.1, 45.3], zoom: 7 },
  KEM: { center: [87.1, 54.5], zoom: 7 },
  KGD: { center: [21.1, 54.7], zoom: 8 },
  KGN: { center: [64.4, 55.5], zoom: 7 },
  KHA: { center: [135, 53.5], zoom: 5 },
  KHM: { center: [69, 61], zoom: 5 },
  KIR: { center: [49.7, 58.6], zoom: 6 },
  KK: { center: [90, 53.4], zoom: 7 },
  KL: { center: [44.3, 46.4], zoom: 7 },
  KLU: { center: [35.4, 54.4], zoom: 8 },
  KO: { center: [54, 64], zoom: 5 },
  KOS: { center: [44, 58.4], zoom: 7 },
  KR: { center: [33.4, 63.5], zoom: 6 },
  KRS: { center: [36.2, 51.7], zoom: 8 },
  KYA: { center: [96, 64], zoom: 4 },
  LEN: { center: [31, 60.1], zoom: 7 },
  LIP: { center: [39.1, 52.7], zoom: 8 },
  MAG: { center: [151, 62.9], zoom: 5 },
  ME: { center: [47.9, 56.6], zoom: 8 },
  MO: { center: [44.4, 54.2], zoom: 8 },
  MOS: { center: [37, 55.5], zoom: 7 },
  MOW: {
    center: [37.6176, 55.7558],
    zoom: 10,
  },
  MUR: { center: [34.7, 68], zoom: 6 },
  NEN: { center: [53, 68], zoom: 5 },
  NGR: { center: [32.8, 58.4], zoom: 7 },
  NIZ: { center: [44.2, 56.2], zoom: 7 },
  NVS: { center: [79.6, 55.4], zoom: 6 },
  OMS: { center: [73.2, 56], zoom: 6 },
  ORE: { center: [56, 51.8], zoom: 6 },
  ORL: { center: [36.4, 52.8], zoom: 8 },
  PER: { center: [56.5, 58.9], zoom: 6 },
  PNZ: { center: [44.6, 53.2], zoom: 8 },
  PRI: { center: [134, 45], zoom: 6 },
  PSK: { center: [29.2, 57.3], zoom: 7 },
  ROS: { center: [41.3, 47.8], zoom: 7 },
  RYA: { center: [40.4, 54.4], zoom: 8 },
  SA: { center: [127, 66], zoom: 4 },
  SAK: { center: [143, 50.3], zoom: 5 },
  SAM: { center: [50.2, 53.2], zoom: 7 },
  SAR: { center: [46.7, 51.5], zoom: 7 },
  SE: { center: [44.3, 43.2], zoom: 8 },
  SMO: { center: [32.9, 54.8], zoom: 7 },
  SPE: {
    center: [30.3158, 59.9391],
    zoom: 10,
  },
  STA: { center: [43.9, 44.8], zoom: 7 },
  SVE: { center: [61, 58.8], zoom: 6 },
  TA: { center: [50.9, 55.4], zoom: 7 },
  TAM: { center: [41.4, 52.7], zoom: 8 },
  TOM: { center: [82.1, 58.7], zoom: 6 },
  TUL: { center: [37.6, 54.2], zoom: 8 },
  TVE: { center: [34.8, 57.1], zoom: 7 },
  TY: { center: [94.4, 51.7], zoom: 6 },
  TYU: { center: [69, 57.3], zoom: 6 },
  UD: { center: [52.8, 57.3], zoom: 7 },
  ULY: { center: [48.2, 54.3], zoom: 7 },
  VGG: { center: [44.4, 49.5], zoom: 7 },
  VLA: { center: [40.6, 56], zoom: 8 },
  VLG: { center: [40, 60], zoom: 6 },
  VOR: { center: [40.8, 51], zoom: 7 },
  YAN: { center: [75, 66], zoom: 5 },
  YAR: { center: [39.1, 57.6], zoom: 7 },
  YEV: { center: [132.9, 48.6], zoom: 7 },
  ZAB: { center: [115, 52], zoom: 5 },
};

function normalizeRegionName(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[()]/g, " ")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function regionsAreEqual(
  firstRegion: string | null | undefined,
  secondRegion: string,
): boolean {
  if (!firstRegion) {
    return false;
  }

  return (
    normalizeRegionName(firstRegion) ===
    normalizeRegionName(secondRegion)
  );
}

function isValidComplaintLocation(
  complaint: PublicComplaint,
): boolean {
  return (
    Number.isFinite(complaint.location.lat) &&
    Number.isFinite(complaint.location.lng) &&
    complaint.location.lat >= -90 &&
    complaint.location.lat <= 90 &&
    complaint.location.lng >= -180 &&
    complaint.location.lng <= 180
  );
}

function getComplaintUrl(
  complaint: PublicComplaint,
): string {
  return `/map/complaints/${encodeURIComponent(
    complaint.complaintId,
  )}`;
}

function getDescriptionPreview(
  description: string | null | undefined,
): string {
  const normalizedDescription = (
    description ?? ""
  )
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedDescription) {
    return "Описание обращения не указано.";
  }

  const sentenceMatch = normalizedDescription.match(
    /^.*?[.!?](?:\s|$)/,
  );

  const firstSentence =
    sentenceMatch?.[0]?.trim() ??
    normalizedDescription;

  if (
    firstSentence.length <=
    DESCRIPTION_PREVIEW_LENGTH
  ) {
    if (
      sentenceMatch ||
      normalizedDescription.length <=
        DESCRIPTION_PREVIEW_LENGTH
    ) {
      return firstSentence;
    }

    return `${firstSentence}…`;
  }

  const shortenedText = firstSentence.slice(
    0,
    DESCRIPTION_PREVIEW_LENGTH,
  );

  const lastSpaceIndex =
    shortenedText.lastIndexOf(" ");

  const safeText =
    lastSpaceIndex > 100
      ? shortenedText.slice(0, lastSpaceIndex)
      : shortenedText;

  return `${safeText.trim()}…`;
}

function getBounds(
  coordinates: LngLat[],
): [LngLat, LngLat] {
  const longitudes = coordinates.map(
    ([longitude]) => longitude,
  );

  const latitudes = coordinates.map(
    ([, latitude]) => latitude,
  );

  const minimumLongitude = Math.min(
    ...longitudes,
  );

  const maximumLongitude = Math.max(
    ...longitudes,
  );

  const minimumLatitude = Math.min(
    ...latitudes,
  );

  const maximumLatitude = Math.max(
    ...latitudes,
  );

  const longitudePadding = Math.max(
    (maximumLongitude - minimumLongitude) *
      0.2,
    0.2,
  );

  const latitudePadding = Math.max(
    (maximumLatitude - minimumLatitude) *
      0.2,
    0.15,
  );

  return [
    [
      minimumLongitude - longitudePadding,
      minimumLatitude - latitudePadding,
    ],
    [
      maximumLongitude + longitudePadding,
      maximumLatitude + latitudePadding,
    ],
  ];
}

function getMapLocation(
  region: RussiaRegion,
  complaints: PublicComplaint[],
): YMapLocationRequest {
  const coordinates: LngLat[] = complaints
    .filter(isValidComplaintLocation)
    .map((complaint) => [
      complaint.location.lng,
      complaint.location.lat,
    ]);

  if (coordinates.length === 1) {
    return {
      center: coordinates[0],
      zoom: 11,
    };
  }

  if (coordinates.length > 1) {
    return {
      bounds: getBounds(coordinates),
    };
  }

  return (
    REGION_LOCATIONS[region.id] ??
    DEFAULT_REGION_LOCATION
  );
}

function waitForYandexMaps(
  timeout = 20000,
): Promise<typeof ymaps3> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    function checkApi(): void {
      if (
        typeof window !== "undefined" &&
        window.ymaps3
      ) {
        resolve(window.ymaps3);
        return;
      }

      if (Date.now() - startedAt >= timeout) {
        reject(
          new Error(
            "API Яндекс Карт не загрузился.",
          ),
        );

        return;
      }

      window.setTimeout(checkApi, 100);
    }

    checkApi();
  });
}

function getMarkerClasses(
  status: PublicComplaint["status"],
): string {
  if (status === "resolved") {
    return "border-emerald-200 bg-emerald-500 shadow-[0_8px_25px_rgba(16,185,129,0.45)]";
  }

  if (status === "inProgress") {
    return "border-amber-100 bg-amber-400 shadow-[0_8px_25px_rgba(251,191,36,0.45)]";
  }

  return "border-red-100 bg-red-500 shadow-[0_8px_25px_rgba(239,68,68,0.45)]";
}

function getStatusBadgeClasses(
  status: PublicComplaint["status"],
): string {
  if (status === "resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "inProgress") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

async function copyText(
  text: string,
): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const wasCopied =
    document.execCommand("copy");

  textarea.remove();

  if (!wasCopied) {
    throw new Error(
      "Не удалось скопировать ссылку.",
    );
  }
}

function ComplaintPopup({
  complaint,
  onClose,
}: {
  complaint: PublicComplaint;
  onClose: () => void;
}) {
  const [copyState, setCopyState] =
    React.useState<
      "idle" | "copied" | "error"
    >("idle");

  const timeoutRef =
    React.useRef<number | null>(null);

  const complaintUrl =
    getComplaintUrl(complaint);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(
          timeoutRef.current,
        );
      }
    };
  }, []);

  async function handleCopy(): Promise<void> {
    try {
      const absoluteUrl = new URL(
        complaintUrl,
        window.location.origin,
      ).toString();

      await copyText(absoluteUrl);
      setCopyState("copied");
    } catch (error) {
      console.error(
        "Complaint link copying error:",
        error,
      );

      setCopyState("error");
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(
        timeoutRef.current,
      );
    }

    timeoutRef.current =
      window.setTimeout(() => {
        setCopyState("idle");
      }, 2200);
  }

  return (
    <div
      className="absolute bottom-[calc(100%+18px)] left-1/2 z-30 w-[min(360px,calc(100vw-32px))] -translate-x-1/2"
      onClick={(event) =>
        event.stopPropagation()
      }
      onPointerDown={(event) =>
        event.stopPropagation()
      }
    >
      <article className="relative rounded-[22px] border border-black/10 bg-white p-4 text-neutral-950 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-5">
        <button
          aria-label="Закрыть карточку обращения"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <div className="pr-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
            {complaint.complaintId}
          </p>

          <h2 className="mt-1.5 text-base font-bold leading-5 sm:text-lg sm:leading-6">
            {complaint.title}
          </h2>
        </div>

        <p className="mt-3 text-sm leading-5 text-neutral-600">
          {getDescriptionPreview(
            complaint.description,
          )}
        </p>

        <dl className="mt-4 space-y-2.5 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-neutral-900">
              Категория
            </dt>

            <dd className="max-w-[65%] text-right text-neutral-600">
              {getComplaintCategoryTitle(
                complaint.category,
              )}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-neutral-900">
              Статус
            </dt>

            <dd>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClasses(
                  complaint.status,
                )}`}
              >
                {getPublicComplaintStatusTitle(
                  complaint.status,
                )}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-bold text-neutral-800 transition hover:bg-neutral-100 sm:text-sm"
            onClick={() => {
              void handleCopy();
            }}
            type="button"
          >
            {copyState === "copied"
              ? "Ссылка скопирована"
              : copyState === "error"
                ? "Ошибка копирования"
                : "Скопировать ссылку"}
          </button>

          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white transition hover:bg-emerald-800 sm:text-sm"
            href={complaintUrl}
          >
            Подробнее
          </Link>
        </div>

        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-black/10 bg-white"
        />
      </article>
    </div>
  );
}

function ComplaintMarker({
  complaint,
  isSelected,
  onSelect,
  onClose,
}: {
  complaint: PublicComplaint;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      {isSelected ? (
        <ComplaintPopup
          complaint={complaint}
          onClose={onClose}
        />
      ) : null}

      <button
        aria-label={`Открыть обращение: ${complaint.title}`}
        aria-expanded={isSelected}
        className={`
          relative
          flex
          h-9
          w-9
          -translate-x-1/2
          -translate-y-full
          items-center
          justify-center
          rounded-full
          border-2
          transition
          hover:scale-110
          focus:outline-none
          focus:ring-4
          focus:ring-white/30
          ${
            isSelected
              ? "scale-110 ring-4 ring-white/40"
              : ""
          }
          ${getMarkerClasses(
            complaint.status,
          )}
        `}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        type="button"
      >
        <span className="h-3 w-3 rounded-full border-2 border-white bg-white/30" />
      </button>
    </div>
  );
}

function ClusterMarker({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  const sizeClass =
    count >= 100
      ? "h-16 w-16 text-lg"
      : count >= 20
        ? "h-14 w-14 text-base"
        : "h-12 w-12 text-sm";

  return (
    <button
      aria-label={`Показать ${count} обращений`}
      className={`
        flex
        -translate-x-1/2
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        border-[3px]
        border-white
        bg-emerald-700
        font-bold
        text-white
        shadow-[0_10px_30px_rgba(4,120,87,0.45)]
        transition
        hover:scale-110
        hover:bg-emerald-800
        focus:outline-none
        focus:ring-4
        focus:ring-emerald-300/50
        ${sizeClass}
      `}
      onClick={onClick}
      type="button"
    >
      {count}
    </button>
  );
}

function getComplaintWord(
  count: number,
): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (
    lastTwoDigits >= 11 &&
    lastTwoDigits <= 14
  ) {
    return "обращений";
  }

  if (lastDigit === 1) {
    return "обращение";
  }

  if (
    lastDigit >= 2 &&
    lastDigit <= 4
  ) {
    return "обращения";
  }

  return "обращений";
}

function RegionMap({
  modules,
  region,
  complaints,
}: {
  modules: LoadedMapModules;
  region: RussiaRegion;
  complaints: PublicComplaint[];
}) {
  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
  } = modules.maps;

  const { YMapClusterer } =
    modules.clusterer;

  const [location, setLocation] =
    React.useState<YMapLocationRequest>(() =>
      getMapLocation(region, complaints),
    );

  const [
    selectedComplaintId,
    setSelectedComplaintId,
  ] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocation(
      getMapLocation(region, complaints),
    );

    setSelectedComplaintId(null);
  }, [complaints, region]);

  const complaintsById = React.useMemo(
    () =>
      new Map(
        complaints.map((complaint) => [
          complaint.complaintId,
          complaint,
        ]),
      ),
    [complaints],
  );

  const features =
    React.useMemo<ComplaintFeature[]>(
      () =>
        complaints.map((complaint) => ({
          type: "Feature",
          id: complaint.complaintId,
          geometry: {
            type: "Point",
            coordinates: [
              complaint.location.lng,
              complaint.location.lat,
            ],
          },
        })),
      [complaints],
    );

  const clusteringMethod = React.useMemo(
    () =>
      modules.clusterByGrid({
        gridSize: CLUSTER_GRID_SIZE,
      }),
    [modules.clusterByGrid],
  );

  const handleClusterClick =
    React.useCallback(
      (clusterFeatures: Feature[]): void => {
        setSelectedComplaintId(null);

        const coordinates =
          clusterFeatures.map(
            (feature) =>
              feature.geometry
                .coordinates as LngLat,
          );

        if (coordinates.length === 0) {
          return;
        }

        if (coordinates.length === 1) {
          setLocation({
            center: coordinates[0],
            zoom: 13,
            duration: 500,
            easing: "ease-in-out",
          });

          return;
        }

        setLocation({
          bounds: getBounds(coordinates),
          duration: 500,
          easing: "ease-in-out",
        });
      },
      [],
    );

  const renderMarker =
    React.useCallback(
      (feature: Feature) => {
        const complaintId =
          String(feature.id);

        const complaint =
          complaintsById.get(complaintId);

        if (!complaint) {
          return (
            <YMapMarker
              coordinates={
                feature.geometry
                  .coordinates as LngLat
              }
            >
              <span />
            </YMapMarker>
          );
        }

        return (
          <YMapMarker
            coordinates={
              feature.geometry
                .coordinates as LngLat
            }
          >
            <ComplaintMarker
              complaint={complaint}
              isSelected={
                selectedComplaintId ===
                complaint.complaintId
              }
              onClose={() => {
                setSelectedComplaintId(null);
              }}
              onSelect={() => {
                setSelectedComplaintId(
                  complaint.complaintId,
                );
              }}
            />
          </YMapMarker>
        );
      },
      [
        YMapMarker,
        complaintsById,
        selectedComplaintId,
      ],
    );

  const renderCluster =
    React.useCallback(
      (
        coordinates: LngLat,
        clusterFeatures: Feature[],
      ) => (
        <YMapMarker coordinates={coordinates}>
          <ClusterMarker
            count={clusterFeatures.length}
            onClick={() =>
              handleClusterClick(
                clusterFeatures,
              )
            }
          />
        </YMapMarker>
      ),
      [YMapMarker, handleClusterClick],
    );

  return (
    <YMap
      key={region.id}
      location={location}
      margin={[160, 40, 80, 40]}
      showScaleInCopyrights
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />

      <YMapClusterer
        cluster={renderCluster}
        features={features}
        marker={renderMarker}
        method={clusteringMethod}
      />
    </YMap>
  );
}

export default function PublicEcoMap({
  complaints,
}: PublicEcoMapProps) {
  const [selectedRegion, setSelectedRegion] =
    React.useState<RussiaRegion | null>(
      null,
    );

  const [modules, setModules] =
    React.useState<LoadedMapModules | null>(
      null,
    );

  const [error, setError] =
    React.useState<string | null>(null);

  const selectedComplaints =
    React.useMemo(() => {
      if (!selectedRegion) {
        return [];
      }

      return complaints.filter(
        (complaint) =>
          regionsAreEqual(
            complaint.region,
            selectedRegion.name,
          ) &&
          isValidComplaintLocation(
            complaint,
          ),
      );
    }, [complaints, selectedRegion]);

  React.useEffect(() => {
    if (!selectedRegion) {
      return;
    }

    const activeRegion = selectedRegion;
    let isCancelled = false;

    async function initializeMap(): Promise<void> {
      try {
        setModules(null);
        setError(null);

        const ymaps =
          await waitForYandexMaps();

        await ymaps.ready;

        ymaps.import.registerCdn(
          "https://cdn.jsdelivr.net/npm/{package}",
          [
            "@yandex/ymaps3-clusterer@0.0.12",
          ],
        );

        const [
          ymaps3React,
          clustererPackage,
        ] = await Promise.all([
          ymaps.import(
            "@yandex/ymaps3-reactify",
          ),
          ymaps.import(
            "@yandex/ymaps3-clusterer",
          ) as Promise<ClustererModule>,
        ]);

        const reactify =
          ymaps3React.reactify.bindTo(
            React,
            ReactDOM,
          );

        const reactifiedMaps =
          reactify.module(ymaps);

        const reactifiedClusterer =
          reactify.module(
            clustererPackage,
          );

        if (isCancelled) {
          return;
        }

        setModules({
          maps: reactifiedMaps,
          clusterer:
            reactifiedClusterer,
          clusterByGrid:
            clustererPackage.clusterByGrid,
        });
      } catch (caughtError) {
        console.error(
          "Yandex Maps initialization error:",
          caughtError,
        );

        if (isCancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : `Не удалось открыть ${activeRegion.name}.`,
        );
      }
    }

    void initializeMap();

    return () => {
      isCancelled = true;
    };
  }, [selectedRegion]);

  function handleSelectRegion(
    region: RussiaRegion,
  ): void {
    setModules(null);
    setError(null);
    setSelectedRegion(region);
  }

  function handleBackToRegions(): void {
    setSelectedRegion(null);
    setModules(null);
    setError(null);
  }

  if (!selectedRegion) {
    return (
      <RussiaRegionSelector
        complaints={complaints}
        onSelectRegion={
          handleSelectRegion
        }
      />
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold">
            Карта временно недоступна
          </h1>

          <p className="mt-3 text-sm text-white/60">
            {error}
          </p>

          <button
            className="mt-6 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
            onClick={
              handleBackToRegions
            }
            type="button"
          >
            Выбрать другой регион
          </button>
        </div>
      </main>
    );
  }

  if (!modules) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-white/15 border-t-white" />

          <p className="mt-4 text-sm text-white/60">
            Загружаем{" "}
            {selectedRegion.name}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-neutral-950 text-white">
      <div className="relative h-full w-full">
        <RegionMap
          complaints={
            selectedComplaints
          }
          modules={modules}
          region={selectedRegion}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 md:p-5">
          <div className="pointer-events-auto mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-neutral-950/80 px-3 py-3 shadow-2xl backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Выбрать другой регион"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg transition hover:bg-white/15"
                onClick={
                  handleBackToRegions
                }
                type="button"
              >
                ←
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-base font-bold sm:text-xl">
                  {selectedRegion.name}
                </h1>

                <p className="text-xs text-white/55">
                  {
                    selectedComplaints.length
                  }{" "}
                  {getComplaintWord(
                    selectedComplaints.length,
                  )}
                </p>
              </div>
            </div>

            <Link
              className="shrink-0 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-white/90 sm:px-5 sm:text-sm"
              href="/map/report"
            >
              Сообщить о нарушении
            </Link>
          </div>

          <div className="pointer-events-auto mx-auto mt-3 flex w-fit max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/80 px-4 py-2.5 shadow-xl backdrop-blur-xl">
            <p className="text-xs text-white/70 sm:text-sm">
              Нажмите на точку, чтобы
              открыть обращение
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}