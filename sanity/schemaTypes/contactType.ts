import {defineField, defineType} from 'sanity'


export const contactType = defineType({

  name: 'contact',

  title: 'Контакты',

  type: 'document',


  fields: [


    defineField({

      name: 'name',

      title: 'Имя',

      type: 'string',

    }),



    defineField({

      name: 'photo',

      title: 'Фото',

      type: 'image',

      options:{
        hotspot:true
      }

    }),



    defineField({

      name:'description',

      title:'Описание',

      type:'text'

    }),



    defineField({

      name:'youtube',

      title:'YouTube',

      type:'url'

    }),



    defineField({

      name:'instagram',

      title:'Instagram',

      type:'url'

    }),



    defineField({

      name:'tiktok',

      title:'TikTok',

      type:'url'

    }),



    defineField({

      name:'telegram',

      title:'Telegram',

      type:'url'

    }),



    defineField({

      name:'email',

      title:'Email',

      type:'string'

    }),



    defineField({

      name:'phone',

      title:'Телефон',

      type:'string'

    }),


  ]

})