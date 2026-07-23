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
const NOTIFICATION_EMAIL = "planetwakeupnow@gmail.com";
const RESEND_API_URL = "https://api.resend.com/emails";

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

    const complaintId =
      createPublicComplaintId(latestNumber + 1);

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

function escapeHtml(value: string | undefined): string {
  if (!value) {
    return "Не указано";
  }

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStudioComplaintUrl(complaint: ComplaintDocument): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://www.ecovloger.ru";

  return `${siteUrl}/studio/structure/complaint;${encodeURIComponent(complaint._id)}`;
}

async function sendNewComplaintNotification(
  complaint: ComplaintDocument,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "Эковлог <notifications@ecovloger.ru>";

  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not configured. Complaint notification was not sent.",
    );
    return;
  }

  const studioUrl = getStudioComplaintUrl(complaint);
  const coordinates = `${complaint.location.lat}, ${complaint.location.lng}`;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "ecovlog-site/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [NOTIFICATION_EMAIL],
      subject: `Новая жалоба на Экокарте — ${complaint.complaintId}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
          <h2 style="margin:0 0 16px">Новая жалоба на Экокарте</h2>
          <p><strong>Номер:</strong> ${escapeHtml(complaint.complaintId)}</p>
          <p><strong>Название:</strong> ${escapeHtml(complaint.title)}</p>
          <p><strong>Категория:</strong> ${escapeHtml(complaint.category)}</p>
          <p><strong>Регион:</strong> ${escapeHtml(complaint.region)}</p>
          <p><strong>Адрес:</strong> ${escapeHtml(complaint.address)}</p>
          <p><strong>Координаты:</strong> ${escapeHtml(coordinates)}</p>
          <p><strong>Описание:</strong><br>${escapeHtml(complaint.description).replaceAll("\n", "<br>")}</p>
          <hr style="border:0;border-top:1px solid #ddd;margin:20px 0">
          <p><strong>Заявитель:</strong> ${escapeHtml(complaint.reporter.name)}</p>
          <p><strong>Телефон:</strong> ${escapeHtml(complaint.reporter.phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(complaint.reporter.email)}</p>
          <p><strong>Ссылка на видео:</strong> ${escapeHtml(complaint.videoUrl)}</p>
          <p><strong>Фотографий:</strong> ${complaint.photos.length}</p>
          <p style="margin-top:24px">
            <a href="${escapeHtml(studioUrl)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#166534;color:#fff;text-decoration:none">
              Открыть жалобу в админке
            </a>
          </p>
        </div>
      `,
      text: [
        "Новая жалоба на Экокарте",
        `Номер: ${complaint.complaintId}`,
        `Название: ${complaint.title}`,
        `Категория: ${complaint.category}`,
        `Регион: ${complaint.region}`,
        `Адрес: ${complaint.address}`,
        `Координаты: ${coordinates}`,
        `Описание: ${complaint.description}`,
        `Заявитель: ${complaint.reporter.name || "Не указано"}`,
        `Телефон: ${complaint.reporter.phone || "Не указано"}`,
        `Email: ${complaint.reporter.email || "Не указано"}`,
        `Ссылка на видео: ${complaint.videoUrl || "Не указано"}`,
        `Фотографий: ${complaint.photos.length}`,
        `Админка: ${studioUrl}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Resend returned ${response.status}: ${responseText}`,
    );
  }
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
      2000,
      "Описание проблемы",
    );

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

    try {
      await sendNewComplaintNotification(complaint);
    } catch (notificationError) {
      console.error(
        "Complaint notification error:",
        notificationError,
      );
    }

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
