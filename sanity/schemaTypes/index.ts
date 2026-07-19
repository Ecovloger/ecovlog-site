import {type SchemaTypeDefinition} from 'sanity'

import {blockContentType} from './blockContentType'
import {videoType} from './videoType'
import {articleType} from './articleType'
import {postType} from './postType'
import {contactType} from './contactType'
import {complaintType} from './complaintType'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    blockContentType,
    videoType,
    articleType,
    postType,
    contactType,
    complaintType,
  ],
}