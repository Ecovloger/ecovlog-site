import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  isComplaintCategory,
  type ComplaintCategory,
} from "@/lib/complaints";
import { findRegion } from "@/lib/regions";
import { writeClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_COMPLAINT_ID_ATTEMPTS = 10;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type UploadedPhoto = {
  _key: string;
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
};

type Reporter = {
  _type: "reporter";
  name?: string;
  phone?: string;
  email?: string;
};

type ComplaintDocument = {
  _id: string;
  _type: "complaint";
  complaintId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  region: string;
  address: string;
  location: {
    _type: "geopoint";
    lat: number;
    lng: number;
  };
  photos: UploadedPhoto[];
  videoUrl?: string;
  reporter: Reporter;
  source: "website";
  status: "moderation";
  isPublic: false;
  createdAt: string;
};

type SanityErrorLike = {
  statusCode?: number;
  response?: {
    statusCode?: number;
    status?: number;
  };
};

class ComplaintValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplaintValidationError";
  }
}

function getRequiredText(
  formData: FormData,
  fieldName: string,
  maxLength: number,
  label: string,
): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    throw new ComplaintValidationError(
      `Поле «${label}» не заполнено`,
    );
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new ComplaintValidationError(
      `Поле «${label}» не заполнено`,
    );
  }

  if (normalizedValue.length > maxLength) {
    throw new ComplaintValidationError(
      `Поле «${label}» не должно превышать ${maxLength} символов`,
    );
  }

  return normalizedValue;
}

function getOptionalText(
  formData: FormData,
  fieldName: string,
  maxLength: number,
  label: string,
): string | undefined {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.length > maxLength) {
    throw new ComplaintValidationError(
      `Поле «${label}» не должно превышать ${maxLength} символов`,
    );
  }

  return normalizedValue;
}

function getCoordinate(
  formData: FormData,
  fieldName: "latitude" | "longitude",
): number {
  const rawValue = formData.get(fieldName);

  if (
    typeof rawValue !== "string" ||
    !rawValue.trim()
  ) {
    throw new ComplaintValidationError(
      "Необходимо указать место нарушения на карте",
    );
  }

  const coordinate = Number(rawValue);

  if (!Number.isFinite(coordinate)) {
    throw new ComplaintValidationError(
      "Переданы некорректные координаты",
    );
  }

  if (
    fieldName === "latitude" &&
    (coordinate < -90 || coordinate > 90)
  ) {
    throw new ComplaintValidationError(
      "Передана некорректная широта",
    );
  }

  if (
    fieldName === "longitude" &&
    (coordinate < -180 || coordinate > 180)
  ) {
    throw new ComplaintValidationError(
      "Передана некорректная долгота",
    );
  }

  return coordinate;
}

function getCategory(formData: FormData): ComplaintCategory {
  const value = formData.get("category");

  if (
    typeof value !== "string" ||
    !isComplaintCategory(value)
  ) {
    throw new ComplaintValidationError(
      "Выберите корректную категорию нарушения",
    );
  }

  return value;
}

function validateRegion(region: string): void {
  if (!findRegion(region)) {
    throw new ComplaintValidationError(
      "Выберите корректный регион",
    );
  }
}

function validateEmail(email: string | undefined): void {
  if (!email) {
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new ComplaintValidationError(
      "Укажите корректный адрес электронной почты",
    );
  }
}

function validateVideoUrl(
  videoUrl: string | undefined,
): void {
  if (!videoUrl) {
    return;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    throw new ComplaintValidationError(
      "Укажите корректную ссылку на видео",
    );
  }

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    throw new ComplaintValidationError(
      "Ссылка на видео должна начинаться с http:// или https://",
    );
  }
}

function validateFiles(files: File[]): void {
  if (files.length < MIN_PHOTOS) {
    throw new ComplaintValidationError(
      "Добавьте хотя бы одну фотографию",
    );
  }

  if (files.length > MAX_PHOTOS) {
    throw new ComplaintValidationError(
      `Можно загрузить не более ${MAX_PHOTOS} фотографий`,
    );
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new ComplaintValidationError(
        `Файл «${file.name}» имеет неподдерживаемый формат изображения`,
      );
    }

    if (file.size === 0) {
      throw new ComplaintValidationError(
        `Файл «${file.name}» пустой`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ComplaintValidationError(
        `Размер файла «${file.name}» превышает 10 мегабайт`,
      );
    }
  }
}

async function uploadPhotos(
  files: File[],
): Promise<UploadedPhoto[]> {
  const uploadedPhotos: UploadedPhoto[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await writeClient.assets.upload(
      "image",
      buffer,
      {
        filename: file.name,
        contentType: file.type,
      },
    );

    uploadedPhotos.push({
      _key: randomUUID(),
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    });
  }

  return uploadedPhotos;
}

async function removeUploadedAssets(
  photos: UploadedPhoto[],
): Promise<void> {
  if (photos.length === 0) {
    return;
  }

  await Promise.allSettled(
    photos.map((photo) =>
      writeClient.delete(photo.asset._ref),
    ),
  );
}

function isConflictError(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const sanityError = error as SanityErrorLike;

  return (
    sanityError.statusCode === 409 ||
    sanityError.response?.statusCode === 409 ||
    sanityError.response?.status === 409
  );
}

async function getLatestComplaintNumber(): Promise<number> {
  const latestComplaintId =
    await writeClient.fetch<string | null>(
      `
        *[
          _type == "complaint" &&
          defined(complaintId) &&
          complaintId match "GF-*"
        ]
        | order(complaintId desc)[0].complaintId
      `,
    );

  const numberMatch =
    latestComplaintId?.match(/^GF-(\d{6})$/);

  if (!numberMatch) {
    return 0;
  }

  const complaintNumber = Number(numberMatch[1]);

  return Number.isSafeInteger(complaintNumber)
    ? complaintNumber
    : 0;
}

function createPublicComplaintId(
  complaintNumber: number,
): string {
  return `GF-${String(complaintNumber).padStart(6, "0")}`;
}

function createSanityDocumentId(
  complaintId: string,
): string {
  return `complaint-${complaintId.toLowerCase()}`;
}

async function createComplaintDocument(
  complaintData: Omit<
    ComplaintDocument,
    "_id" | "complaintId"
  >,
): Promise<ComplaintDocument> {
  for (
    let attempt = 0;
    attempt < MAX_COMPLAINT_ID_ATTEMPTS;
    attempt += 1
  ) {
    const latestNumber =
      await getLatestComplaintNumber();

    const complaintNumber =
      latestNumber + 1 + attempt;

    const complaintId =
      createPublicComplaintId(complaintNumber);

    const document: ComplaintDocument = {
      ...complaintData,
      _id: createSanityDocumentId(complaintId),
      complaintId,
    };

    try {
      return await writeClient.create(document);
    } catch (error) {
      if (isConflictError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Не удалось присвоить номер обращению",
  );
}

export async function POST(request: Request) {
  let uploadedPhotos: UploadedPhoto[] = [];

  try {
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.error(
        "SANITY_API_WRITE_TOKEN is not configured",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Сервер не настроен для приёма обращений",
        },
        {
          status: 500,
        },
      );
    }

    const formData = await request.formData();

    const title = getRequiredText(
      formData,
      "title",
      140,
      "Название проблемы",
    );

    const description = getRequiredText(
      formData,
      "description",
      3000,
      "Описание проблемы",
    );

    if (description.length < 20) {
      throw new ComplaintValidationError(
        "Описание должно содержать не менее 20 символов",
      );
    }

    const category = getCategory(formData);

    const region = getRequiredText(
      formData,
      "region",
      150,
      "Регион",
    );

    validateRegion(region);

    const address = getRequiredText(
      formData,
      "address",
      500,
      "Адрес или описание места",
    );

    const latitude = getCoordinate(
      formData,
      "latitude",
    );

    const longitude = getCoordinate(
      formData,
      "longitude",
    );

    const name = getOptionalText(
      formData,
      "name",
      150,
      "Имя",
    );

    const phone = getOptionalText(
      formData,
      "phone",
      50,
      "Телефон",
    );

    const email = getOptionalText(
      formData,
      "email",
      254,
      "Электронная почта",
    );

    const videoUrl = getOptionalText(
      formData,
      "videoUrl",
      2048,
      "Ссылка на видео",
    );

    validateEmail(email);
    validateVideoUrl(videoUrl);

    if (!phone && !email) {
      throw new ComplaintValidationError(
        "Укажите хотя бы один способ связи: телефон или электронную почту",
      );
    }

    const files = formData
      .getAll("photos")
      .filter(
        (value): value is File =>
          value instanceof File,
      );

    validateFiles(files);

    uploadedPhotos = await uploadPhotos(files);

    const complaint =
      await createComplaintDocument({
        _type: "complaint",
        title,
        description,
        category,
        region,
        address,
        location: {
          _type: "geopoint",
          lat: latitude,
          lng: longitude,
        },
        photos: uploadedPhotos,
        videoUrl,
        reporter: {
          _type: "reporter",
          name,
          phone,
          email,
        },
        source: "website",
        status: "moderation",
        isPublic: false,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json(
      {
        success: true,
        complaintId: complaint.complaintId,
        documentId: complaint._id,
        message:
          "Обращение успешно отправлено на модерацию",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Complaint submission error:",
      error,
    );

    await removeUploadedAssets(uploadedPhotos);

    const isValidationError =
      error instanceof ComplaintValidationError;

    const message =
      error instanceof Error
        ? error.message
        : "Не удалось отправить обращение";

    return NextResponse.json(
      {
        success: false,
        error: isValidationError
          ? message
          : "Не удалось отправить обращение. Попробуйте ещё раз.",
      },
      {
        status: isValidationError ? 400 : 500,
      },
    );
  }
}