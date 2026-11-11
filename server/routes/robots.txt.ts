import { generarRobots } from '../../shared/utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return generarRobots(useRuntimeConfig(event).public.siteUrl as string)
})
