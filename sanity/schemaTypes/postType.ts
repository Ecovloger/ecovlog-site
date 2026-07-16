import {defineField, defineType} from 'sanity'


export const postType = defineType({

  name: 'post',

  title: 'Публикации',

  type: 'document',


  fields: [


    defineField({

      name:'title',

      title:'Заголовок',

      type:'string',

    }),



    defineField({

      name:'slug',

      title:'URL адрес',

      type:'slug',

      options:{

        source:'title',

        maxLength:96

      }

    }),



    defineField({

      name:'images',

      title:'Изображения',

      type:'array',

      options:{

        layout:'grid'

      },

      of:[

        {

          type:'image',

          options:{

            hotspot:true

          }

        }

      ]

    }),



    defineField({

      name:'description',

      title:'Описание',

      type:'text',

      rows:5

    }),



    defineField({

      name:'date',

      title:'Дата публикации',

      type:'date'

    }),



    defineField({

      name:'category',

      title:'Категория',

      type:'string',

      options:{

        list:[

          {
            title:'Экология',
            value:'eco'
          },

          {
            title:'Животные',
            value:'animals'
          },

          {
            title:'Природа',
            value:'nature'
          },

          {
            title:'Другое',
            value:'other'
          }

        ]

      }

    })

  ]

})