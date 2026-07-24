import ComplaintAdminList from './components/ComplaintAdminList'
import {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.documentTypeListItem('video').title('Видео'),

      S.documentTypeListItem('article').title('Статьи'),

      S.documentTypeListItem('post').title('Публикации'),

      S.documentTypeListItem('contact').title('Контакты'),

      S.divider(),

      S.listItem()
        .id('complaints-admin')
        .title('Жалобы граждан')
        .schemaType('complaint')
        .child(
          S.component(ComplaintAdminList)
            .id('complaints-admin-list')
            .title('Жалобы граждан'),
        ),
    ])
