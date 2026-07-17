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

      title:'Картинки публикации',

      type:'array',

      validation: Rule =>
        Rule.max(20),


      options:{

        layout:'grid'

      },


      of:[

        {

          type:'image',

          options:{

            hotspot:false

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