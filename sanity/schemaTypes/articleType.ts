import {defineField, defineType} from 'sanity'


export const articleType = defineType({

  name: 'article',

  title: 'Статьи',

  type: 'document',


  fields: [


    defineField({

      name: 'title',

      title: 'Заголовок',

      type: 'string',

      validation: Rule => Rule.required()

    }),



    defineField({

      name: 'slug',

      title: 'URL адрес',

      type: 'slug',

      options: {

        source: 'title',

        maxLength: 96,

      },

      validation: Rule => Rule.required()

    }),



    defineField({

      name: 'category',

      title: 'Категория',

      type: 'string',

      options: {

        list: [

          {
            title: 'Новости',
            value: 'news'
          },

          {
            title: 'Расследования',
            value: 'investigation'
          },

          {
            title: 'Научные материалы',
            value: 'science'
          },

          {
            title: 'Аналитика',
            value: 'analytics'
          }

        ]

      }

    }),



    defineField({

      name: 'cover',

      title: 'Главное изображение',

      type: 'image',

      options: {

        hotspot: true,

      }

    }),



    defineField({

      name: 'description',

      title: 'Краткое описание',

      type: 'text',

      rows: 4,

    }),



    defineField({

      name: 'content',

      title: 'Полный текст',

      type: 'array',

      of: [

        {

          type: 'block'

        },

        {

          type: 'image',

          options: {

            hotspot: true

          }

        }

      ]

    }),



    defineField({

      name: 'date',

      title: 'Дата публикации',

      type: 'date'

    })


  ]

})