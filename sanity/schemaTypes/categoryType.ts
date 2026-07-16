import {defineField, defineType} from 'sanity'

export const videoType = defineType({
  name: 'video',
  title: 'Видео',
  type: 'document',

  fields: [

    defineField({
      name: 'title',
      title: 'Название видео',
      type: 'string',
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
      options: {
        hotspot: true,
      },
    }),

  ],
})