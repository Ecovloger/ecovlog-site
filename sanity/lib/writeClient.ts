import {createClient} from 'next-sanity'

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-07-16',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
})