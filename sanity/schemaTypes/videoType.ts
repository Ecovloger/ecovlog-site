import {defineField, defineType} from 'sanity'

export const videoType = defineType({
  name: 'video',
  title: 'Видео',
  type: 'document',

  fields: [
    defineField({
      name: 'slug',
      title: 'URL адрес',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Название видео',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Описание',
      type: 'text',
    }),

    defineField({
      name: 'youtubeUrl',
      title: 'Ссылка YouTube',
      type: 'url',
      description:
        'Необязательно. Можно указать обычную ссылку на видео, Shorts или youtu.be.',
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https']}).custom((value, context) => {
          const vkVideoUrl = context.document?.vkVideoUrl

          return value || vkVideoUrl
            ? true
            : 'Добавьте ссылку хотя бы на YouTube или VK Видео.'
        }),
    }),

    defineField({
      name: 'vkVideoUrl',
      title: 'Ссылка или код VK Видео',
      type: 'text',
      rows: 3,
      description:
        'Лучший вариант: в VK Видео нажмите «Поделиться» → «Экспортировать» и вставьте сюда код iframe. Также можно попробовать обычную ссылку на публичное видео.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const youtubeUrl = context.document?.youtubeUrl

          if (!value && !youtubeUrl) {
            return 'Добавьте ссылку хотя бы на YouTube или VK Видео.'
          }

          if (!value) {
            return true
          }

          const text = String(value)

          return /https?:\/\/(?:www\.)?(?:vk\.com|vk\.ru|vkvideo\.ru)\//i.test(
            text,
          )
            ? true
            : 'Укажите ссылку или код для встраивания видео с vk.com, vk.ru или vkvideo.ru.'
        }),
    }),

    defineField({
      name: 'date',
      title: 'Дата публикации',
      type: 'date',
    }),

    defineField({
      name: 'cover',
      title: 'Обложка',
      type: 'image',
      description:
        'Необязательно. Если обложка не загружена, сайт использует превью YouTube или стандартное изображение.',
      options: {
        hotspot: true,
      },
    }),
  ],
})
