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

      S.documentTypeListItem('complaint').title('Жалобы граждан'),
    ])