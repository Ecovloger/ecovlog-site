import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {videoType} from './videoType'
import {articleType} from './articleType'
import {newsType} from './newsType'
import {postType} from './postType'
import {contactType} from './contactType'


export const schema: { types: SchemaTypeDefinition[] } = {

  types: [

    blockContentType,

    videoType,

    articleType,

    newsType,

    postType,

    contactType,

  ],

}