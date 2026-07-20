import {
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_SOURCES,
  COMPLAINT_STATUSES,
  getComplaintCategoryTitle,
  getComplaintStatusTitle,
} from "@/lib/complaints";

export const complaintType = defineType({
  name: "complaint",
  title: "Экологические обращения",
  type: "document",

  initialValue: () => ({
    status: "moderation",
    source: "website",
    isPublic: false,
    createdAt: new Date().toISOString(),
  }),

  fields: [
    defineField({
      name: "complaintId",
      title: "Номер обращения",
      type: "string",
      description:
        "Уникальный публичный номер обращения, например GF-000001.",
      readOnly: true,
      validation: (Rule) =>
        Rule.required().regex(/^GF-\d{6}$/, {
          name: "номер обращения",
          invert: false,
        }),
    }),

    defineField({
      name: "title",
      title: "Название проблемы",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .max(140)
          .error(
            "Укажите название проблемы длиной не более 140 символов.",
          ),
    }),

    defineField({
      name: "description",
      title: "Описание проблемы",
      type: "text",
      rows: 8,
      validation: (Rule) =>
        Rule.required()
          .max(2000)
          .error(
            "Укажите описание проблемы длиной не более 2000 символов.",
          ),
    }),

    defineField({
      name: "category",
      title: "Категория нарушения",
      type: "string",
      options: {
        list: COMPLAINT_CATEGORIES.map((category) => ({
          title: category.title,
          value: category.value,
        })),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "region",
      title: "Регион",
      type: "string",
      validation: (Rule) => Rule.required().max(150),
    }),

    defineField({
      name: "address",
      title: "Адрес или описание места",
      type: "string",
      description:
        "Адрес определяется по выбранной точке на карте или уточняется вручную.",
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(500)
          .error(
            "Укажите адрес или описание места нарушения.",
          ),
    }),

    defineField({
      name: "location",
      title: "Координаты",
      type: "geopoint",
      description:
        "Точка, которая будет отображаться на Экокарте.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "photos",
      title: "Фотографии",
      type: "array",
      description: "Можно загрузить до пяти фотографий.",
      options: {
        layout: "grid",
      },
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: false,
          },
          fields: [
            defineField({
              name: "alt",
              title: "Описание фотографии",
              type: "string",
              validation: (Rule) => Rule.max(250),
            }),
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(5)
          .error(
            "Добавьте от одной до пяти фотографий.",
          ),
    }),

    defineField({
      name: "videoUrl",
      title: "Ссылка на видео",
      type: "url",
      description:
        "Необязательная ссылка на видео с места нарушения.",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "reporter",
      title: "Данные заявителя",
      type: "object",
      description:
        "Эти данные не отображаются на публичной Экокарте.",
      fields: [
        defineField({
          name: "name",
          title: "Имя",
          type: "string",
          validation: (Rule) => Rule.max(150),
        }),

        defineField({
          name: "phone",
          title: "Телефон",
          type: "string",
          validation: (Rule) => Rule.max(50),
        }),

        defineField({
          name: "email",
          title: "Электронная почта",
          type: "email",
        }),
      ],
      validation: (Rule) =>
        Rule.custom((reporter) => {
          if (!reporter || typeof reporter !== "object") {
            return "Укажите электронную почту или телефон заявителя.";
          }

          const phone =
            "phone" in reporter &&
            typeof reporter.phone === "string"
              ? reporter.phone.trim()
              : "";

          const email =
            "email" in reporter &&
            typeof reporter.email === "string"
              ? reporter.email.trim()
              : "";

          if (!phone && !email) {
            return "Укажите электронную почту или телефон заявителя.";
          }

          return true;
        }),
    }),

    defineField({
      name: "source",
      title: "Источник обращения",
      type: "string",
      options: {
        list: COMPLAINT_SOURCES.map((source) => ({
          title: source.title,
          value: source.value,
        })),
      },
      initialValue: "website",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "status",
      title: "Статус",
      type: "string",
      options: {
        list: COMPLAINT_STATUSES.map((status) => ({
          title: status.title,
          value: status.value,
        })),
        layout: "radio",
      },
      initialValue: "moderation",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "isPublic",
      title: "Опубликовано на Экокарте",
      type: "boolean",
      description:
        "Включите после проверки обращения. Контактные данные заявителя публично не отображаются.",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "createdAt",
      title: "Дата поступления",
      type: "datetime",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "publishedAt",
      title: "Дата публикации",
      type: "datetime",
      description:
        "Заполняется после публикации обращения на Экокарте.",
      hidden: ({ document }) =>
        document?.isPublic !== true,
    }),

    defineField({
      name: "adminComment",
      title: "Внутренний комментарий",
      type: "text",
      rows: 5,
      description:
        "Служебная информация. На публичной Экокарте не отображается.",
    }),
  ],

  orderings: [
    {
      title: "Сначала новые",
      name: "createdAtDesc",
      by: [
        {
          field: "createdAt",
          direction: "desc",
        },
      ],
    },
    {
      title: "Сначала старые",
      name: "createdAtAsc",
      by: [
        {
          field: "createdAt",
          direction: "asc",
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      complaintId: "complaintId",
      status: "status",
      category: "category",
      region: "region",
      isPublic: "isPublic",
      media: "photos.0",
    },

    prepare(selection) {
      const {
        title,
        complaintId,
        status,
        category,
        region,
        isPublic,
        media,
      } = selection;

      const publicId =
        typeof complaintId === "string" && complaintId
          ? complaintId
          : "Без номера";

      const statusTitle = getComplaintStatusTitle(
        typeof status === "string"
          ? status
          : undefined,
      );

      const categoryTitle = getComplaintCategoryTitle(
        typeof category === "string"
          ? category
          : undefined,
      );

      const publicationTitle =
        isPublic === true
          ? "На Экокарте"
          : "Не опубликовано";

      const regionTitle =
        typeof region === "string" && region
          ? ` · ${region}`
          : "";

      return {
        title:
          typeof title === "string" && title
            ? title
            : "Без названия",
        subtitle: `${publicId} · ${statusTitle} · ${categoryTitle} · ${publicationTitle}${regionTitle}`,
        media,
      };
    },
  },
});