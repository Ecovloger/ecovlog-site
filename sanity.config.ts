'use client'

/**
 * This configuration is used for the Sanity Studio that’s mounted
 * on the `/app/studio/[[...tool]]/page.tsx` route.
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

const COMPLAINT_ID_PREFIX = 'GF-'
const COMPLAINT_ID_LENGTH = 6

function createComplaintId(number: number): string {
  return `${COMPLAINT_ID_PREFIX}${String(number).padStart(
    COMPLAINT_ID_LENGTH,
    '0',
  )}`
}

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,

  schema: {
    ...schema,

    templates: (previousTemplates, context) => {
      const templatesWithoutDefaultComplaint =
        previousTemplates.filter(
          (template) => template.schemaType !== 'complaint',
        )

      return [
        ...templatesWithoutDefaultComplaint,
        {
          id: 'complaint',
          title: 'Экологическое обращение',
          description:
            'Создать новое экологическое обращение с автоматическим номером',
          schemaType: 'complaint',

          value: async () => {
            const client = context.getClient({
              apiVersion,
            })

            const latestComplaintId =
              await client.fetch<string | null>(
                `
                  *[
                    _type == "complaint" &&
                    defined(complaintId) &&
                    complaintId match "GF-*"
                  ]
                  | order(complaintId desc)[0].complaintId
                `,
              )

            const match =
              latestComplaintId?.match(/^GF-(\d{6})$/)

            const latestNumber = match
              ? Number(match[1])
              : 0

            const nextNumber =
              Number.isSafeInteger(latestNumber)
                ? latestNumber + 1
                : 1

            return {
              complaintId:
                createComplaintId(nextNumber),
              status: 'moderation',
              source: 'admin',
              isPublic: false,
              createdAt: new Date().toISOString(),
            }
          },
        },
      ]
    },
  },

  plugins: [
    structureTool({
      structure,
    }),

    visionTool({
      defaultApiVersion: apiVersion,
    }),
  ],
})