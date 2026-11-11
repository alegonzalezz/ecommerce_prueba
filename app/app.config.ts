import { TIENDA } from '#shared/utils/tienda'

// Único lugar del nombre de la tienda: shared/utils/tienda.ts (la usan también las rutas de servidor).
export default defineAppConfig({
  tienda: TIENDA,
})
