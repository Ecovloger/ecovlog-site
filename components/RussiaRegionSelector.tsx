"use client";

import Link from "next/link";
import * as React from "react";

export type RussiaRegion = {
  id: string;
  name: string;
  totalComplaints: number;
  unresolvedComplaints: number;
  unresolvedPercent: number;
};

export type RegionComplaint = {
  region?: string | null;
  status?: string | null;
};

type RussiaRegionSelectorProps = {
  complaints: RegionComplaint[];
  onSelectRegion: (region: RussiaRegion) => void;
};

type RussiaRegionsJson = Record<
  string,
  {
    title: string;
  }
>;

const REGION_COLORS = {
  empty: "#b8d5c4",
  low: "#72bc82",
  moderate: "#a6cc72",
  elevated: "#e2c865",
  high: "#e69b5d",
  critical: "#d86b63",
  hover: "#2f8f65",
} as const;

const REGION_STROKE = "#ffffff";
const REGION_HOVER_STROKE = "#15583d";

function normalizeRegionName(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[()]/g, " ")
    .replace(/[—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRegionIdFromSvgId(svgId: string): string {
  return svgId.replace(/^RU-/, "");
}

function isResolvedStatus(
  status: string | null | undefined,
): boolean {
  if (!status) {
    return false;
  }

  const normalizedStatus = status
    .toLocaleLowerCase("ru-RU")
    .replaceAll("_", "")
    .replaceAll("-", "")
    .replaceAll(" ", "");

  return (
    normalizedStatus === "resolved" ||
    normalizedStatus === "closed" ||
    normalizedStatus === "решено" ||
    normalizedStatus === "устранено"
  );
}

function getRegionColor(region: RussiaRegion): string {
  if (region.totalComplaints === 0) {
    return REGION_COLORS.empty;
  }

  if (region.unresolvedPercent <= 20) {
    return REGION_COLORS.low;
  }

  if (region.unresolvedPercent <= 40) {
    return REGION_COLORS.moderate;
  }

  if (region.unresolvedPercent <= 60) {
    return REGION_COLORS.elevated;
  }

  if (region.unresolvedPercent <= 80) {
    return REGION_COLORS.high;
  }

  return REGION_COLORS.critical;
}

function getComplaintWord(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "обращений";
  }

  if (lastDigit === 1) {
    return "обращение";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "обращения";
  }

  return "обращений";
}

function createRegion(
  id: string,
  name: string,
  complaints: RegionComplaint[],
): RussiaRegion {
  const normalizedName = normalizeRegionName(name);

  const regionComplaints = complaints.filter(
    (complaint) =>
      complaint.region &&
      normalizeRegionName(complaint.region) === normalizedName,
  );

  const unresolvedComplaints = regionComplaints.filter(
    (complaint) => !isResolvedStatus(complaint.status),
  ).length;

  const unresolvedPercent =
    regionComplaints.length > 0
      ? Math.round(
          (unresolvedComplaints / regionComplaints.length) * 100,
        )
      : 0;

  return {
    id,
    name,
    totalComplaints: regionComplaints.length,
    unresolvedComplaints,
    unresolvedPercent,
  };
}

function getRegionShapes(
  regionElement: SVGElement,
): SVGElement[] {
  if (
    regionElement.matches(
      "path, polygon, polyline, rect, circle, ellipse",
    )
  ) {
    return [regionElement];
  }

  return Array.from(
    regionElement.querySelectorAll<SVGElement>(
      "path, polygon, polyline, rect, circle, ellipse",
    ),
  );
}

function paintRegion(
  regionElement: SVGElement,
  fill: string,
  stroke: string,
  strokeWidth: string,
): void {
  const shapes = getRegionShapes(regionElement);
  const targets =
    shapes.length > 0 ? shapes : [regionElement];

  targets.forEach((shape) => {
    shape.removeAttribute("fill");
    shape.removeAttribute("stroke");

    shape.style.setProperty("fill", fill, "important");
    shape.style.setProperty("stroke", stroke, "important");
    shape.style.setProperty(
      "stroke-width",
      strokeWidth,
      "important",
    );
    shape.style.setProperty(
      "stroke-linejoin",
      "round",
      "important",
    );
    shape.style.setProperty(
      "stroke-linecap",
      "round",
      "important",
    );
    shape.style.setProperty(
      "vector-effect",
      "non-scaling-stroke",
      "important",
    );
    shape.style.setProperty(
      "transition",
      "fill 150ms ease, stroke 150ms ease, filter 150ms ease",
      "important",
    );

    shape.style.cursor = "pointer";
    shape.style.pointerEvents = "all";
  });
}

function MapLegend() {
  const items = [
    {
      label: "Нет обращений",
      color: REGION_COLORS.empty,
    },
    {
      label: "До 20%",
      color: REGION_COLORS.low,
    },
    {
      label: "21–40%",
      color: REGION_COLORS.moderate,
    },
    {
      label: "41–60%",
      color: REGION_COLORS.elevated,
    },
    {
      label: "61–80%",
      color: REGION_COLORS.high,
    },
    {
      label: "81–100%",
      color: REGION_COLORS.critical,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {items.map((item) => (
        <div
          className="flex items-center gap-2"
          key={item.label}
        >
          <span
            className="h-3 w-3 rounded-full border border-black/10"
            style={{
              backgroundColor: item.color,
            }}
          />

          <span className="text-xs text-neutral-600">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RussiaRegionSelector({
  complaints,
  onSelectRegion,
}: RussiaRegionSelectorProps) {
  const mapContainerRef =
    React.useRef<HTMLDivElement | null>(null);

  const onSelectRegionRef =
    React.useRef(onSelectRegion);

  const regionsByIdRef =
    React.useRef<Map<string, RussiaRegion>>(
      new Map(),
    );

  const regionElementsRef =
    React.useRef<Map<string, SVGElement>>(
      new Map(),
    );

  const [regions, setRegions] = React.useState<
    RussiaRegion[]
  >([]);

  const [hoveredRegion, setHoveredRegion] =
    React.useState<RussiaRegion | null>(null);

  const [selectedRegionId, setSelectedRegionId] =
    React.useState("");

  const [isLoading, setIsLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
  }, [onSelectRegion]);

  React.useEffect(() => {
    const controller = new AbortController();
    const cleanupFunctions: Array<() => void> = [];

    let isDisposed = false;

    async function loadMap(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        setHoveredRegion(null);
        setSelectedRegionId("");

        regionsByIdRef.current.clear();
        regionElementsRef.current.clear();

        const container = mapContainerRef.current;

        if (!container) {
          return;
        }

        const [svgResponse, jsonResponse] =
          await Promise.all([
            fetch("/data/russia.svg", {
              signal: controller.signal,
              cache: "no-store",
            }),
            fetch("/data/russia.json", {
              signal: controller.signal,
              cache: "no-store",
            }),
          ]);

        if (!svgResponse.ok) {
          throw new Error(
            `Не удалось загрузить russia.svg: ${svgResponse.status}.`,
          );
        }

        if (!jsonResponse.ok) {
          throw new Error(
            `Не удалось загрузить russia.json: ${jsonResponse.status}.`,
          );
        }

        const svgText = await svgResponse.text();

        const regionsJson =
          (await jsonResponse.json()) as RussiaRegionsJson;

        if (
          controller.signal.aborted ||
          isDisposed
        ) {
          return;
        }

        const parsedRegions = Object.entries(
          regionsJson,
        )
          .map(([id, value]) =>
            createRegion(
              id,
              value.title,
              complaints,
            ),
          )
          .sort((firstRegion, secondRegion) =>
            firstRegion.name.localeCompare(
              secondRegion.name,
              "ru-RU",
            ),
          );

        const regionMap = new Map(
          parsedRegions.map((region) => [
            region.id,
            region,
          ]),
        );

        regionsByIdRef.current = regionMap;
        setRegions(parsedRegions);

        const currentContainer =
          mapContainerRef.current;

        if (
          !currentContainer ||
          controller.signal.aborted ||
          isDisposed
        ) {
          return;
        }

        const parser = new DOMParser();

        const svgDocument = parser.parseFromString(
          svgText,
          "image/svg+xml",
        );

        if (
          svgDocument.querySelector("parsererror")
        ) {
          throw new Error(
            "Файл russia.svg содержит некорректный SVG.",
          );
        }

        svgDocument
          .querySelectorAll("script")
          .forEach((element) => element.remove());

        const sourceSvg =
          svgDocument.documentElement;

        if (
          sourceSvg.tagName.toLocaleLowerCase() !==
          "svg"
        ) {
          throw new Error(
            "Загруженный файл не является SVG-картой.",
          );
        }

        sourceSvg.removeAttribute("width");
        sourceSvg.removeAttribute("height");

        sourceSvg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet",
        );
        sourceSvg.setAttribute("role", "img");
        sourceSvg.setAttribute(
          "aria-label",
          "Интерактивная карта регионов России",
        );

        sourceSvg.style.width = "100%";
        sourceSvg.style.height = "100%";
        sourceSvg.style.display = "block";
        sourceSvg.style.overflow = "visible";
        sourceSvg.style.background =
          "transparent";
        sourceSvg.style.touchAction =
          "manipulation";

        const importedSvg = document.importNode(
          sourceSvg,
          true,
        );

        currentContainer.replaceChildren(
          importedSvg,
        );

        const regionElements =
          currentContainer.querySelectorAll<SVGElement>(
            ".russia-region",
          );

        if (regionElements.length === 0) {
          throw new Error(
            "В russia.svg не найдены элементы с классом russia-region.",
          );
        }

        let connectedRegionCount = 0;

        regionElements.forEach((regionElement) => {
          const regionId = getRegionIdFromSvgId(
            regionElement.id,
          );

          const region = regionMap.get(regionId);

          if (!region) {
            console.warn(
              `Регион ${regionElement.id} отсутствует в russia.json.`,
            );

            paintRegion(
              regionElement,
              REGION_COLORS.empty,
              REGION_STROKE,
              "1.5",
            );

            return;
          }

          connectedRegionCount += 1;

          regionElementsRef.current.set(
            region.id,
            regionElement,
          );

          regionElement.dataset.regionId =
            region.id;

          regionElement.style.cursor =
            "pointer";
          regionElement.style.outline =
            "none";
          regionElement.style.pointerEvents =
            "all";

          regionElement.setAttribute(
            "tabindex",
            "0",
          );
          regionElement.setAttribute(
            "role",
            "button",
          );
          regionElement.setAttribute(
            "aria-label",
            `${region.name}. Открыть карту региона.`,
          );

          const titleElement =
            document.createElementNS(
              "http://www.w3.org/2000/svg",
              "title",
            );

          titleElement.textContent = region.name;
          regionElement.prepend(titleElement);

          const restoreRegion = (): void => {
            paintRegion(
              regionElement,
              getRegionColor(region),
              REGION_STROKE,
              "1.5",
            );

            regionElement.style.filter = "none";
          };

          const highlightRegion = (): void => {
            paintRegion(
              regionElement,
              REGION_COLORS.hover,
              REGION_HOVER_STROKE,
              "2.5",
            );

            regionElement.style.filter =
              "drop-shadow(0 5px 7px rgba(21, 88, 61, 0.28))";
          };

          const selectRegion = (): void => {
            setSelectedRegionId(region.id);
            onSelectRegionRef.current(region);
          };

          const handlePointerEnter =
            (): void => {
              setHoveredRegion(region);
              highlightRegion();
            };

          const handlePointerLeave =
            (): void => {
              setHoveredRegion(
                (currentRegion) =>
                  currentRegion?.id === region.id
                    ? null
                    : currentRegion,
              );

              restoreRegion();
            };

          const handleFocus = (): void => {
            setHoveredRegion(region);
            highlightRegion();
          };

          const handleBlur = (): void => {
            setHoveredRegion(
              (currentRegion) =>
                currentRegion?.id === region.id
                  ? null
                  : currentRegion,
            );

            restoreRegion();
          };

          const handleClick = (): void => {
            selectRegion();
          };

          const handleKeyDown = (
            event: KeyboardEvent,
          ): void => {
            if (
              event.key !== "Enter" &&
              event.key !== " "
            ) {
              return;
            }

            event.preventDefault();
            selectRegion();
          };

          restoreRegion();

          regionElement.addEventListener(
            "pointerenter",
            handlePointerEnter,
          );
          regionElement.addEventListener(
            "pointerleave",
            handlePointerLeave,
          );
          regionElement.addEventListener(
            "focus",
            handleFocus,
          );
          regionElement.addEventListener(
            "blur",
            handleBlur,
          );
          regionElement.addEventListener(
            "click",
            handleClick,
          );
          regionElement.addEventListener(
            "keydown",
            handleKeyDown,
          );

          cleanupFunctions.push(() => {
            regionElement.removeEventListener(
              "pointerenter",
              handlePointerEnter,
            );
            regionElement.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );
            regionElement.removeEventListener(
              "focus",
              handleFocus,
            );
            regionElement.removeEventListener(
              "blur",
              handleBlur,
            );
            regionElement.removeEventListener(
              "click",
              handleClick,
            );
            regionElement.removeEventListener(
              "keydown",
              handleKeyDown,
            );
          });
        });

        if (connectedRegionCount === 0) {
          throw new Error(
            "Не удалось сопоставить регионы SVG с russia.json.",
          );
        }

        if (
          !controller.signal.aborted &&
          !isDisposed
        ) {
          setIsLoading(false);
        }
      } catch (caughtError) {
        if (
          controller.signal.aborted ||
          isDisposed
        ) {
          return;
        }

        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Russia map loading error:",
          caughtError,
        );

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Не удалось загрузить карту России.",
        );

        setIsLoading(false);
      }
    }

    void loadMap();

    return () => {
      isDisposed = true;
      controller.abort();

      cleanupFunctions.forEach((cleanup) => {
        cleanup();
      });

      regionElementsRef.current.clear();
    };
  }, [complaints]);

  function handleSelectChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    const regionId = event.target.value;

    setSelectedRegionId(regionId);

    if (!regionId) {
      return;
    }

    const region =
      regionsByIdRef.current.get(regionId);

    if (region) {
      onSelectRegionRef.current(region);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#f2f6f3] px-4 py-7 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1480px]">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Народная Экокарта
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Выберите регион
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            Нажмите на любой регион России или
            выберите его из списка.
          </p>
        </header>

        <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label
              className="sr-only"
              htmlFor="russia-region-selector"
            >
              Выберите регион
            </label>

            <select
              className="h-13 w-full rounded-2xl border border-emerald-950/15 bg-white px-4 text-sm font-semibold shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              disabled={isLoading || Boolean(error)}
              id="russia-region-selector"
              onChange={handleSelectChange}
              value={selectedRegionId}
            >
              <option value="">
                Выберите регион
              </option>

              {regions.map((region) => (
                <option
                  key={region.id}
                  value={region.id}
                >
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            className="flex h-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
            href="/map/report"
          >
            Сообщить о нарушении
          </Link>
        </div>

        <div className="mt-4 min-h-14 text-center">
          {hoveredRegion ? (
            <>
              <p className="text-lg font-bold">
                {hoveredRegion.name}
              </p>

              <p className="mt-1 text-sm text-neutral-600">
                {hoveredRegion.totalComplaints >
                0
                  ? `${hoveredRegion.totalComplaints} ${getComplaintWord(
                      hoveredRegion.totalComplaints,
                    )}`
                  : "Нажмите, чтобы открыть карту региона"}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-500">
              Наведите указатель на регион
            </p>
          )}
        </div>

        <div className="relative mt-2 min-h-[420px] overflow-hidden rounded-[30px] border border-emerald-950/10 bg-white p-4 shadow-[0_22px_80px_rgba(28,74,51,0.10)] sm:min-h-[540px] sm:p-7 lg:min-h-[650px]">
          <div
            className="h-full min-h-[390px] w-full sm:min-h-[490px] lg:min-h-[590px]"
            ref={mapContainerRef}
          />

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-900/10 border-t-emerald-600" />

                <p className="mt-4 text-sm text-neutral-500">
                  Загружаем карту России
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white px-4">
              <div className="max-w-lg text-center">
                <h2 className="text-xl font-bold">
                  Карта не загрузилась
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {error}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {!error ? (
          <div className="mt-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Доля нерешённых обращений
            </p>

            <MapLegend />
          </div>
        ) : null}
      </div>
    </main>
  );
}