import catalogo from '../../data/catalogo.json'
import type { Catalogo } from '../../shared/types/catalogo'
import { generarLlms } from '../../shared/utils/seo'
import { TIENDA } from '../../shared/utils/tienda'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return generarLlms(catalogo as Catalogo, useRuntimeConfig(event).public.siteUrl as string, TIENDA)
})
