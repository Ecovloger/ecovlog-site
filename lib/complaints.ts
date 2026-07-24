export const COMPLAINT_CATEGORIES = [
  {
    value: "illegalDump",
    title: "Несанкционированная свалка",
  },
  {
    value: "wasteCollection",
    title: "Нарушение вывоза отходов",
  },
  {
    value: "wasteBurning",
    title: "Сжигание отходов",
  },
  {
    value: "waterPollution",
    title: "Загрязнение водного объекта",
  },
  {
    value: "airPollution",
    title: "Загрязнение воздуха",
  },
  {
    value: "soilPollution",
    title: "Загрязнение или повреждение почвы",
  },
  {
    value: "illegalLogging",
    title: "Незаконная вырубка",
  },
  {
    value: "protectedArea",
    title: "Нарушение на особо охраняемой природной территории",
  },
  {
    value: "animalCruelty",
    title: "Жестокое обращение с животными",
  },
  {
    value: "other",
    title: "Другое экологическое нарушение",
  },
] as const;

export const COMPLAINT_STATUSES = [
  {
    value: "moderation",
    title: "На модерации",
  },
  {
    value: "inProgress",
    title: "В работе",
  },
  {
    value: "resolved",
    title: "Решено",
  },
] as const;

export const COMPLAINT_SOURCES = [
  {
    value: "website",
    title: "Сайт",
  },
  {
    value: "admin",
    title: "Добавлено вручную",
  },
  {
    value: "import",
    title: "Импорт со старой Экокарты",
  },
  {
    value: "telegram",
    title: "Telegram",
  },
  {
    value: "email",
    title: "Электронная почта",
  },
  {
    value: "other",
    title: "Другой источник",
  },
] as const;

export type ComplaintCategory =
  (typeof COMPLAINT_CATEGORIES)[number]["value"];

export type ComplaintStatus =
  (typeof COMPLAINT_STATUSES)[number]["value"];

export type ComplaintSource =
  (typeof COMPLAINT_SOURCES)[number]["value"];

export function isComplaintCategory(
  value: unknown,
): value is ComplaintCategory {
  return COMPLAINT_CATEGORIES.some(
    (category) => category.value === value,
  );
}

export function isComplaintStatus(
  value: unknown,
): value is ComplaintStatus {
  return COMPLAINT_STATUSES.some(
    (status) => status.value === value,
  );
}

export function isComplaintSource(
  value: unknown,
): value is ComplaintSource {
  return COMPLAINT_SOURCES.some(
    (source) => source.value === value,
  );
}

export function getComplaintCategoryTitle(
  value: string | undefined,
): string {
  return (
    COMPLAINT_CATEGORIES.find(
      (category) => category.value === value,
    )?.title ?? "Категория не указана"
  );
}

export function getComplaintStatusTitle(
  value: string | undefined,
): string {
  if (value === "accepted") {
    return "В работе";
  }

  if (value === "rejected") {
    return "Отклонено";
  }

  return (
    COMPLAINT_STATUSES.find(
      (status) => status.value === value,
    )?.title ?? "Статус не указан"
  );
}

export function getComplaintSourceTitle(
  value: string | undefined,
): string {
  return (
    COMPLAINT_SOURCES.find(
      (source) => source.value === value,
    )?.title ?? "Источник не указан"
  );
}
