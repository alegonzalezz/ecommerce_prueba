import catalogo from '../../data/catalogo.json'
import type { Catalogo } from '../../shared/types/catalogo'
import { generarSitemap } from '../../shared/utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return generarSitemap(catalogo as Catalogo, useRuntimeConfig(event).public.siteUrl as string)
})
