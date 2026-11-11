import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Dirección visual "Mostrador": verde bosque, crema y kraft; ladrillo como acento (se usa en CSS propio).
export default definePreset(Aura, {
  semantic: {
    primary: {
      50: '#F1F6F2',
      100: '#DDEAE0',
      200: '#B9D3C0',
      300: '#8DB59A',
      400: '#5F9374',
      500: '#3F7557',
      600: '#2E5C43',
      700: '#254B37',
      800: '#1F3D2B',
      900: '#172E20',
      950: '#0E1C14',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#FFFDF8',
          50: '#F6F0E4',
          100: '#EFE6D3',
          200: '#E7DAC0',
          300: '#D7C7A5',
          400: '#B3A27F',
          500: '#8C7E62',
          600: '#6B5F49',
          700: '#4F4636',
          800: '#35302A',
          900: '#22201C',
          950: '#161512',
        },
        primary: {
          color: '{primary.800}',
          contrastColor: '#FFFDF8',
          hoverColor: '{primary.900}',
          activeColor: '{primary.950}',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '999px',
        paddingX: '1.35rem',
        paddingY: '0.7rem',
        label: { fontWeight: '600' },
      },
    },
  },
})
