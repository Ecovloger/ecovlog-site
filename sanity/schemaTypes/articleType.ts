import {
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

export const articleType = defineType({
  name: "article",
  title: "Статьи",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Заголовок",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "URL адрес",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Категория",
      type: "string",
      options: {
        list: [
          {
            title: "Новости",
            value: "news",
          },
          {
            title: "Расследования",
            value: "investigation",
          },
          {
            title: "Научные материалы",
            value: "science",
          },
          {
            title: "Аналитика",
            value: "analytics",
          },
        ],
      },
    }),

    defineField({
      name: "cover",
      title: "Главное изображение",
      type: "image",
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: "description",
      title: "Краткое описание",
      type: "text",
      rows: 4,
    }),

    defineField({
      name: "content",
      title: "Полный текст",
      type: "array",

      of: [
        defineArrayMember({
          type: "block",

          styles: [
            {
              title: "Обычный текст",
              value: "normal",
            },
            {
              title: "По ширине",
              value: "justify",
            },
            {
              title: "Заголовок 2",
              value: "h2",
            },
            {
              title: "Заголовок 3",
              value: "h3",
            },
            {
              title: "Цитата",
              value: "blockquote",
            },
          ],

          lists: [
            {
              title: "Маркированный список",
              value: "bullet",
            },
            {
              title: "Нумерованный список",
              value: "number",
            },
          ],

          marks: {
            decorators: [
              {
                title: "Жирный",
                value: "strong",
              },
              {
                title: "Курсив",
                value: "em",
              },
              {
                title: "Подчеркнутый",
                value: "underline",
              },
              {
                title: "Зачеркнутый",
                value: "strike-through",
              },
            ],

            annotations: [
              defineField({
                name: "link",
                title: "Ссылка",
                type: "object",

                fields: [
                  defineField({
                    name: "href",
                    title: "Адрес ссылки",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: [
                          "http",
                          "https",
                          "mailto",
                          "tel",
                        ],
                      }),
                  }),

                  defineField({
                    name: "blank",
                    title: "Открывать в новой вкладке",
                    type: "boolean",
                    initialValue: true,
                  }),
                ],
              }),
            ],
          },
        }),

        defineArrayMember({
          type: "image",
          title: "Изображение",
          options: {
            hotspot: true,
          },

          fields: [
            defineField({
              name: "alt",
              title: "Описание изображения",
              type: "string",
              description:
                "Кратко опишите, что изображено на фотографии.",
            }),

            defineField({
              name: "caption",
              title: "Подпись под изображением",
              type: "string",
            }),
          ],
        }),
      ],

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "date",
      title: "Дата публикации",
      type: "date",
    }),
  ],
});