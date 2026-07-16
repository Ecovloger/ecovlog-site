import {defineField, defineType} from 'sanity'


export const newsType = defineType({

  name: 'news',

  title: 'Новости',

  type: 'document',

  fields: [

    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
    }),

    defineField({
      name: 'text',
      title: 'Текст новости',
      type: 'blockContent',
    }),

    defineField({
      name: 'date',
      title: 'Дата',
      type: 'date',
    }),

    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      options:{
        hotspot:true,
      },
    }),

  ],

})