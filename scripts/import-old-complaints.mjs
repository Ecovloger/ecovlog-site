import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { createClient } from "@sanity/client";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error(
    "Укажите путь к JSON-файлу: node --env-file=.env.local scripts/import-old-complaints.mjs ./greenfront-complaints-2841-3340.json",
  );
  process.exit(1);
}

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
  process.env.SANITY_PROJECT_ID;

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ??
  process.env.SANITY_DATASET;

const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "В .env.local должны быть NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET и SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-01",
  useCdn: false,
});

const CATEGORY_MAP = {
  "1": "illegalDump",
  "2": "waterPollution",
  "3": "airPollution",
  "4": "soilPollution",
  "5": "other",
  "6": "other",
};

const STATUS_MAP = {
  "0": "accepted",
  "1": "resolved",
  "2": "inProgress",
};

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TITLE_LENGTH = 140;
const MAX_PHOTOS = 5;
const FETCH_TIMEOUT_MS = 30000;
const REQUEST_DELAY_MS = 120;

function sleep(ms) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
    : "";
}

function truncate(value, maxLength) {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function toIsoDate(dateValue) {
  if (
    typeof dateValue !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    return new Date().toISOString();
  }

  return `${dateValue}T12:00:00.000Z`;
}

function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function createDocumentId(complaintId) {
  return `complaint-${complaintId.toLowerCase()}`;
}

function getExtensionFromContentType(contentType) {
  const normalized = contentType?.split(";")[0]?.trim().toLowerCase();

  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return map[normalized] ?? "jpg";
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/*",
        "User-Agent":
          "Mozilla/5.0 EcoVlog Sanity Importer/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType =
      response.headers.get("content-type") ?? "image/jpeg";

    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(
        `Получен не файл изображения: ${contentType}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error("Пустой файл");
    }

    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadImage(url, complaintId, index) {
  const { buffer, contentType } = await fetchImage(url);
  const extension = getExtensionFromContentType(contentType);
  const hash = createHash("sha1")
    .update(url)
    .digest("hex")
    .slice(0, 10);

  const asset = await client.assets.upload(
    "image",
    buffer,
    {
      filename: `${complaintId}-${index + 1}-${hash}.${extension}`,
      contentType,
    },
  );

  return {
    _key: randomUUID(),
    _type: "image",
    asset: {
      _type: "reference",
      _ref: asset._id,
    },
  };
}

async function uploadPhotos(complaint) {
  const urls = Array.isArray(complaint.images)
    ? complaint.images.slice(0, MAX_PHOTOS)
    : [];

  const photos = [];
  const errors = [];

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];

    try {
      const photo = await uploadImage(
        url,
        complaint.complaintId,
        index,
      );

      photos.push(photo);
    } catch (error) {
      errors.push({
        url,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return {
    photos,
    errors,
  };
}

function buildDocument(complaint, photos) {
  const latitude = Number(
    complaint.coordinates?.latitude,
  );

  const longitude = Number(
    complaint.coordinates?.longitude,
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Некорректные координаты");
  }

  const complaintId =
    typeof complaint.complaintId === "string" &&
    /^GF-\d{6}$/.test(complaint.complaintId)
      ? complaint.complaintId
      : `GF-${String(complaint.legacyId).padStart(6, "0")}`;

  const createdAt = toIsoDate(complaint.date);

  return {
    _id: createDocumentId(complaintId),
    _type: "complaint",
    complaintId,
    legacyId: Number(complaint.legacyId),
    legacyUrl:
      typeof complaint.publicUrl === "string"
        ? complaint.publicUrl
        : undefined,
    title:
      truncate(complaint.title, MAX_TITLE_LENGTH) ||
      `Экологическое обращение ${complaintId}`,
    description:
      truncate(
        complaint.description,
        MAX_DESCRIPTION_LENGTH,
      ) || "Описание отсутствует.",
    category:
      CATEGORY_MAP[String(complaint.categoryLegacyId)] ??
      "other",
    region:
      truncate(complaint.region, 150) ||
      "Регион не указан",
    address: `${truncate(complaint.region, 150) || "Место нарушения"}, координаты: ${formatCoordinates(
      latitude,
      longitude,
    )}`,
    location: {
      _type: "geopoint",
      lat: latitude,
      lng: longitude,
    },
    photos,
    videoUrl:
      typeof complaint.videoUrl === "string" &&
      complaint.videoUrl.trim()
        ? complaint.videoUrl.trim()
        : undefined,
    source: "import",
    status:
      STATUS_MAP[String(complaint.statusLegacyId)] ??
      "accepted",
    isPublic: true,
    createdAt,
    publishedAt: createdAt,
    adminComment:
      "Автоматически импортировано со старой Экокарты.",
  };
}

const absolutePath = resolve(inputPath);
const raw = await readFile(absolutePath, "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data.complaints)) {
  console.error(
    `В файле ${basename(absolutePath)} отсутствует массив complaints.`,
  );
  process.exit(1);
}

const report = {
  total: data.complaints.length,
  imported: 0,
  skippedExisting: 0,
  failed: 0,
  imageErrors: 0,
  failures: [],
};

console.log(
  `Начинаю импорт ${report.total} обращений из ${basename(absolutePath)}.`,
);

for (
  let index = 0;
  index < data.complaints.length;
  index += 1
) {
  const complaint = data.complaints[index];
  const complaintId =
    complaint.complaintId ??
    `GF-${String(complaint.legacyId).padStart(6, "0")}`;
  const documentId = createDocumentId(complaintId);

  process.stdout.write(
    `[${index + 1}/${report.total}] ${complaintId}: `,
  );

  try {
    const existing = await client.getDocument(documentId);

    if (existing) {
      report.skippedExisting += 1;
      console.log("уже существует, пропускаю");
      continue;
    }

    const { photos, errors } =
      await uploadPhotos(complaint);

    report.imageErrors += errors.length;

    const document = buildDocument(
      complaint,
      photos,
    );

    await client.createIfNotExists(document);

    report.imported += 1;

    if (errors.length > 0) {
      console.log(
        `импортировано, фото: ${photos.length}, ошибок фото: ${errors.length}`,
      );
    } else {
      console.log(
        `импортировано, фото: ${photos.length}`,
      );
    }
  } catch (error) {
    report.failed += 1;

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    report.failures.push({
      legacyId: complaint.legacyId,
      complaintId,
      error: message,
    });

    console.log(`ошибка: ${message}`);
  }

  await sleep(REQUEST_DELAY_MS);
}

console.log("\nИмпорт завершён.");
console.log(`Всего: ${report.total}`);
console.log(`Импортировано: ${report.imported}`);
console.log(
  `Уже существовало: ${report.skippedExisting}`,
);
console.log(`Ошибок документов: ${report.failed}`);
console.log(`Ошибок фотографий: ${report.imageErrors}`);

if (report.failures.length > 0) {
  console.log("\nНе импортированные записи:");
  console.table(report.failures);
  process.exitCode = 1;
}
