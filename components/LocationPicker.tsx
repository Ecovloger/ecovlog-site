"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import type {
  DomEventHandler,
  LngLat,
  YMapLocationRequest,
} from "@yandex/ymaps3-types";
import type { ReactifiedModule } from "@yandex/ymaps3-types/reactify/reactify";

import type { RegionOption } from "@/lib/regions";

type ReactifiedApi =
  ReactifiedModule<typeof ymaps3>;

type LocationPickerProps = {
  region: RegionOption;
  value: LngLat | null;
  onChange: (coordinates: LngLat) => void;
  onAddressChange?: (address: string) => void;
};

type GeocoderGeoObject = {
  Point?: {
    pos?: string;
  };
  name?: string;
  description?: string;
  metaDataProperty?: {
    GeocoderMetaData?: {
      text?: string;
      Address?: {
        formatted?: string;
      };
    };
  };
};

type GeocoderResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: Array<{
        GeoObject?: GeocoderGeoObject;
      }>;
    };
  };
};

type ParsedCoordinates = {
  coordinates: LngLat;
  latitude: number;
  longitude: number;
};

function waitForYandexMaps(
  timeout = 20000,
): Promise<typeof ymaps3> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const checkApi = (): void => {
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
            "API Яндекс Карт не загрузился. Проверьте ключ JavaScript API в файле .env.local.",
          ),
        );

        return;
      }

      window.setTimeout(checkApi, 100);
    };

    checkApi();
  });
}

function getGeocoderApiKey(): string {
  return (
    process.env
      .NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY?.trim() ??
    ""
  );
}

function getFirstGeoObject(
  data: GeocoderResponse,
): GeocoderGeoObject | undefined {
  return data.response?.GeoObjectCollection
    ?.featureMember?.[0]?.GeoObject;
}

function getGeoObjectAddress(
  geoObject: GeocoderGeoObject | undefined,
): string {
  if (!geoObject) {
    return "";
  }

  const metadata =
    geoObject.metaDataProperty?.GeocoderMetaData;

  const formattedAddress =
    metadata?.Address?.formatted?.trim() ?? "";

  const text = metadata?.text?.trim() ?? "";

  if (formattedAddress) {
    return formattedAddress;
  }

  if (text) {
    return text;
  }

  const description =
    geoObject.description?.trim() ?? "";

  const name = geoObject.name?.trim() ?? "";

  if (description && name) {
    return `${description}, ${name}`;
  }

  return description || name;
}

function getGeoObjectCoordinates(
  geoObject: GeocoderGeoObject | undefined,
): LngLat | null {
  const position =
    geoObject?.Point?.pos?.trim();

  if (!position) {
    return null;
  }

  const [longitudeValue, latitudeValue] =
    position.split(/\s+/);

  const longitude = Number(longitudeValue);
  const latitude = Number(latitudeValue);

  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude)
  ) {
    return null;
  }

  return [longitude, latitude];
}

function isValidLatitude(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: number,
): boolean {
  return (
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function createParsedCoordinates(
  latitude: number,
  longitude: number,
): ParsedCoordinates | null {
  if (
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  return {
    coordinates: [longitude, latitude],
    latitude,
    longitude,
  };
}

function parseNumber(
  value: string | null | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value
    .trim()
    .replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const number = Number(normalizedValue);

  return Number.isFinite(number)
    ? number
    : null;
}

function parseCoordinatePair(
  value: string,
  order: "lat-lon" | "lon-lat",
): ParsedCoordinates | null {
  const normalizedValue = value.trim();

  const match = normalizedValue.match(
    /^([+-]?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*([+-]?\d{1,3}(?:\.\d+)?)$/,
  );

  if (!match) {
    return null;
  }

  const first = parseNumber(match[1]);
  const second = parseNumber(match[2]);

  if (first === null || second === null) {
    return null;
  }

  if (order === "lon-lat") {
    return createParsedCoordinates(
      second,
      first,
    );
  }

  return createParsedCoordinates(
    first,
    second,
  );
}

function parseCoordinatesFromUrl(
  value: string,
): ParsedCoordinates | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  /*
   * Яндекс Карты:
   * https://yandex.ru/maps/?ll=30.552983%2C59.964269
   *
   * Параметр ll имеет порядок:
   * долгота, широта.
   */
  const yandexLl = url.searchParams.get("ll");

  if (yandexLl) {
    const parsed = parseCoordinatePair(
      yandexLl,
      "lon-lat",
    );

    if (parsed) {
      return parsed;
    }
  }

  /*
   * Яндекс Карты также могут передавать
   * координаты в параметре whatshere[point].
   */
  const yandexPoint =
    url.searchParams.get("whatshere[point]");

  if (yandexPoint) {
    const parsed = parseCoordinatePair(
      yandexPoint,
      "lon-lat",
    );

    if (parsed) {
      return parsed;
    }
  }

  /*
   * Google Maps:
   * https://www.google.com/maps/@59.964269,30.552983,15z
   *
   * Порядок:
   * широта, долгота.
   */
  const googlePathMatch =
    url.pathname.match(
      /@([+-]?\d{1,3}(?:\.\d+)?),([+-]?\d{1,3}(?:\.\d+)?)/,
    );

  if (googlePathMatch) {
    const latitude =
      parseNumber(googlePathMatch[1]);

    const longitude =
      parseNumber(googlePathMatch[2]);

    if (
      latitude !== null &&
      longitude !== null
    ) {
      const parsed = createParsedCoordinates(
        latitude,
        longitude,
      );

      if (parsed) {
        return parsed;
      }
    }
  }

  /*
   * Google Maps и другие картографические
   * сервисы могут хранить координаты
   * в параметрах q, query, destination.
   */
  const coordinateQueryParameters = [
    "q",
    "query",
    "destination",
    "center",
  ];

  for (const parameterName of coordinateQueryParameters) {
    const parameterValue =
      url.searchParams.get(parameterName);

    if (!parameterValue) {
      continue;
    }

    const parsed = parseCoordinatePair(
      parameterValue,
      "lat-lon",
    );

    if (parsed) {
      return parsed;
    }
  }

  /*
   * Формат geo:
   * geo:59.964269,30.552983
   */
  if (url.protocol === "geo:") {
    const geoValue = value.replace(
      /^geo:/i,
      "",
    );

    const parsed = parseCoordinatePair(
      geoValue.split("?")[0],
      "lat-lon",
    );

    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function parseCoordinatesInput(
  value: string,
): ParsedCoordinates | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const coordinatesFromUrl =
    parseCoordinatesFromUrl(normalizedValue);

  if (coordinatesFromUrl) {
    return coordinatesFromUrl;
  }

  /*
   * Для обычного текста используем привычный
   * пользователю порядок:
   *
   * широта, долгота
   *
   * Например:
   * 59.964269, 30.552983
   */
  return parseCoordinatePair(
    normalizedValue,
    "lat-lon",
  );
}

function formatCoordinates(
  coordinates: LngLat,
): string {
  const longitude = coordinates[0];
  const latitude = coordinates[1];

  return `${latitude.toFixed(
    6,
  )}, ${longitude.toFixed(6)}`;
}

async function requestGeocoder(
  geocode: string,
): Promise<GeocoderGeoObject | undefined> {
  const apiKey = getGeocoderApiKey();

  if (!apiKey) {
    throw new Error(
      "В файле .env.local не указан ключ NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY.",
    );
  }

  const parameters = new URLSearchParams({
    apikey: apiKey,
    geocode,
    lang: "ru_RU",
    format: "json",
    results: "1",
  });

  const response = await fetch(
    `https://geocode-maps.yandex.ru/v1/?${parameters.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    let errorMessage =
      `Ошибка Геокодера Яндекса: ${response.status}`;

    try {
      const errorData =
        (await response.json()) as {
          message?: string;
        };

      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ответ сервиса может не содержать JSON.
    }

    throw new Error(errorMessage);
  }

  const data =
    (await response.json()) as GeocoderResponse;

  return getFirstGeoObject(data);
}

export default function LocationPicker({
  region,
  value,
  onChange,
  onAddressChange,
}: LocationPickerProps) {
  const [reactifiedApi, setReactifiedApi] =
    React.useState<ReactifiedApi | null>(
      null,
    );

  const [location, setLocation] =
    React.useState<YMapLocationRequest>({
      center: region.center,
      zoom: region.zoom,
    });

  const [searchValue, setSearchValue] =
    React.useState("");

  const [
    selectedAddress,
    setSelectedAddress,
  ] = React.useState("");

  const [mapError, setMapError] =
    React.useState<string | null>(null);

  const [searchError, setSearchError] =
    React.useState<string | null>(null);

  const [isSearching, setIsSearching] =
    React.useState(false);

  const [
    isResolvingAddress,
    setIsResolvingAddress,
  ] = React.useState(false);

  const geocoderRequestIdRef =
    React.useRef(0);

  React.useEffect(() => {
    let isCancelled = false;

    async function initializeMap(): Promise<void> {
      try {
        setMapError(null);

        const mapsApi =
          await waitForYandexMaps();

        await mapsApi.ready;

        const ymaps3React =
          await mapsApi.import(
            "@yandex/ymaps3-reactify",
          );

        const reactify =
          ymaps3React.reactify.bindTo(
            React,
            ReactDOM,
          );

        const coreApi =
          reactify.module(mapsApi);

        if (isCancelled) {
          return;
        }

        setReactifiedApi(coreApi);
      } catch (error) {
        console.error(
          "Yandex Maps initialization error:",
          error,
        );

        if (isCancelled) {
          return;
        }

        setMapError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить Яндекс Карты.",
        );
      }
    }

    void initializeMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  React.useEffect(() => {
    geocoderRequestIdRef.current += 1;

    setLocation({
      center: region.center,
      zoom: region.zoom,
      duration: 500,
    });

    setSearchValue("");
    setSearchError(null);
    setSelectedAddress("");
    setIsSearching(false);
    setIsResolvingAddress(false);

    onAddressChange?.("");
  }, [region, onAddressChange]);

  const updateAddress =
    React.useCallback(
      (address: string): void => {
        const normalizedAddress =
          address.trim();

        setSelectedAddress(
          normalizedAddress,
        );

        onAddressChange?.(
          normalizedAddress,
        );
      },
      [onAddressChange],
    );

  const resolveAddress =
    React.useCallback(
      async (
        coordinates: LngLat,
      ): Promise<void> => {
        const requestId =
          geocoderRequestIdRef.current + 1;

        geocoderRequestIdRef.current =
          requestId;

        setIsResolvingAddress(true);

        try {
          const longitude =
            coordinates[0];

          const latitude =
            coordinates[1];

          const geoObject =
            await requestGeocoder(
              `${longitude},${latitude}`,
            );

          if (
            geocoderRequestIdRef.current !==
            requestId
          ) {
            return;
          }

          const address =
            getGeoObjectAddress(geoObject);

          updateAddress(
            address ||
              `${region.name}, координаты: ${formatCoordinates(
                coordinates,
              )}`,
          );
        } catch (error) {
          console.error(
            "Yandex reverse geocoding error:",
            error,
          );

          if (
            geocoderRequestIdRef.current !==
            requestId
          ) {
            return;
          }

          /*
           * Отсутствие адреса не мешает выбрать
           * точку. Поэтому здесь не показываем
           * красную ошибку пользователю.
           */
          updateAddress(
            `${region.name}, координаты: ${formatCoordinates(
              coordinates,
            )}`,
          );
        } finally {
          if (
            geocoderRequestIdRef.current ===
            requestId
          ) {
            setIsResolvingAddress(false);
          }
        }
      },
      [region.name, updateAddress],
    );

  const handleCoordinatesChange =
    React.useCallback(
      (
        coordinates: LngLat,
        knownAddress?: string,
      ): void => {
        onChange(coordinates);

        if (knownAddress?.trim()) {
          geocoderRequestIdRef.current += 1;

          setIsResolvingAddress(false);
          updateAddress(knownAddress);

          return;
        }

        void resolveAddress(coordinates);
      },
      [
        onChange,
        resolveAddress,
        updateAddress,
      ],
    );

  const handleMapClick =
    React.useCallback<DomEventHandler>(
      (_object, event): void => {
        setSearchError(null);

        const coordinates =
          event.coordinates;

        setSearchValue(
          formatCoordinates(coordinates),
        );

        handleCoordinatesChange(
          coordinates,
        );
      },
      [handleCoordinatesChange],
    );

  const handleMarkerDragEnd =
    React.useCallback(
      (coordinates: LngLat): void => {
        setSearchError(null);

        setSearchValue(
          formatCoordinates(coordinates),
        );

        handleCoordinatesChange(
          coordinates,
        );
      },
      [handleCoordinatesChange],
    );

  const handleSearch =
    React.useCallback(
      async (): Promise<void> => {
        const normalizedQuery =
          searchValue.trim();

        if (!normalizedQuery) {
          setSearchError(
            "Введите адрес или координаты.",
          );

          return;
        }

        setSearchError(null);

        /*
         * Сначала проверяем, не ввёл ли
         * пользователь готовые координаты
         * или ссылку на карту.
         */
        const parsedCoordinates =
          parseCoordinatesInput(
            normalizedQuery,
          );

        if (parsedCoordinates) {
          const {
            coordinates,
            latitude,
            longitude,
          } = parsedCoordinates;

          geocoderRequestIdRef.current += 1;

          setIsSearching(false);
          setIsResolvingAddress(false);

          onChange(coordinates);

          setSearchValue(
            `${latitude.toFixed(
              6,
            )}, ${longitude.toFixed(6)}`,
          );

          setLocation({
            center: coordinates,
            zoom: 16,
            duration: 600,
          });

          void resolveAddress(coordinates);

          return;
        }

        const requestId =
          geocoderRequestIdRef.current + 1;

        geocoderRequestIdRef.current =
          requestId;

        setIsSearching(true);
        setIsResolvingAddress(false);

        try {
          const regionName =
            region.name.trim();

          const query =
            normalizedQuery
              .toLocaleLowerCase("ru-RU")
              .includes(
                regionName.toLocaleLowerCase(
                  "ru-RU",
                ),
              )
              ? normalizedQuery
              : `${regionName}, ${normalizedQuery}`;

          const geoObject =
            await requestGeocoder(query);

          if (
            geocoderRequestIdRef.current !==
            requestId
          ) {
            return;
          }

          const coordinates =
            getGeoObjectCoordinates(
              geoObject,
            );

          if (!coordinates) {
            setSearchError(
              "Адрес не найден. Введите другой адрес, координаты или выберите точку на карте.",
            );

            return;
          }

          const address =
            getGeoObjectAddress(geoObject);

          onChange(coordinates);

          updateAddress(
            address || normalizedQuery,
          );

          setSearchValue(
            address || normalizedQuery,
          );

          setLocation({
            center: coordinates,
            zoom: 16,
            duration: 600,
          });
        } catch (error) {
          console.error(
            "Yandex forward geocoding error:",
            error,
          );

          if (
            geocoderRequestIdRef.current !==
            requestId
          ) {
            return;
          }

          setSearchError(
            error instanceof Error
              ? error.message
              : "Не удалось выполнить поиск адреса.",
          );
        } finally {
          if (
            geocoderRequestIdRef.current ===
            requestId
          ) {
            setIsSearching(false);
          }
        }
      },
      [
        onChange,
        region.name,
        resolveAddress,
        searchValue,
        updateAddress,
      ],
    );

  const handleSearchKeyDown =
    React.useCallback(
      (
        event: React.KeyboardEvent<HTMLInputElement>,
      ): void => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        void handleSearch();
      },
      [handleSearch],
    );

  if (mapError) {
    return (
      <div className="flex min-h-[430px] items-center justify-center rounded-[28px] border border-red-400/20 bg-red-400/5 px-6 text-center">
        <div className="max-w-lg">
          <p className="text-xl font-semibold">
            Карта временно недоступна
          </p>

          <p className="mt-3 text-sm leading-6 text-white/55">
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  if (!reactifiedApi) {
    return (
      <div className="flex min-h-[430px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.035]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-lime-400" />

          <p className="mt-4 text-sm text-white/60">
            Загружаем карту
          </p>
        </div>
      </div>
    );
  }

  const {
    YMap,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapListener,
    YMapMarker,
  } = reactifiedApi;

  return (
    <div>
      <div className="mb-4">
        <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
          <input
            aria-label="Поиск адреса или координат"
            className="min-w-0 flex-1 bg-white px-5 py-4 text-base text-neutral-900 outline-none placeholder:text-neutral-500"
            disabled={isSearching}
            onChange={(event) => {
              setSearchValue(
                event.target.value,
              );

              if (searchError) {
                setSearchError(null);
              }
            }}
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Введите адрес или координаты"
            type="text"
            value={searchValue}
          />

          <button
            className="flex shrink-0 items-center justify-center bg-lime-400 px-5 font-semibold text-neutral-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 md:px-7"
            disabled={
              isSearching ||
              !searchValue.trim()
            }
            onClick={() => {
              void handleSearch();
            }}
            type="button"
          >
            {isSearching
              ? "Ищем…"
              : "Найти"}
          </button>
        </div>

        <p className="mt-2 px-1 text-xs leading-5 text-white/40">
          Например: 59.964269, 30.552983
        </p>

        {searchError && (
          <p className="mt-2 px-1 text-sm leading-6 text-red-300">
            {searchError}
          </p>
        )}
      </div>

      <div className="location-picker-map relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="h-[430px] w-full md:h-[560px]">
          <YMap
            location={location}
            showScaleInCopyrights
          >
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />

            <YMapListener
              onClick={handleMapClick}
            />

            {value && (
              <YMapMarker
                coordinates={value}
                draggable
                onDragEnd={
                  handleMarkerDragEnd
                }
              >
                <div
                  aria-label="Выбранное место нарушения"
                  className="flex h-12 w-12 -translate-x-1/2 -translate-y-full cursor-grab items-center justify-center rounded-full border-[3px] border-white bg-lime-500 text-xl font-black text-neutral-950 shadow-[0_10px_30px_rgba(0,0,0,0.55)] active:cursor-grabbing"
                  role="img"
                >
                  !
                </div>
              </YMapMarker>
            )}
          </YMap>
        </div>

        {!value && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center md:bottom-6">
            <div className="rounded-full border border-white/15 bg-black/80 px-5 py-3 text-center text-sm font-medium text-white/80 shadow-xl backdrop-blur-xl">
              Введите адрес, вставьте
              координаты или нажмите на карту
            </div>
          </div>
        )}

        {value && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center md:bottom-6">
            <div className="rounded-full border border-lime-400/25 bg-black/80 px-5 py-3 text-center text-sm font-medium text-white/85 shadow-xl backdrop-blur-xl">
              {isResolvingAddress
                ? "Определяем адрес…"
                : "Точка выбрана — маркер можно передвинуть"}
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
            Выбранное место
          </p>

          <p className="mt-2 text-sm leading-6 text-white/75">
            {isResolvingAddress
              ? "Определяем адрес выбранной точки…"
              : selectedAddress ||
                `${region.name}, координаты: ${formatCoordinates(
                  value,
                )}`}
          </p>
        </div>
      )}
    </div>
  );
}