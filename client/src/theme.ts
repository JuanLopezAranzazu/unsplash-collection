import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#f0fdfa' }, 100: { value: '#ccfbf1' }, 200: { value: '#99f6e4' },
          300: { value: '#5eead4' }, 400: { value: '#2dd4bf' }, 500: { value: '#14b8a6' },
          600: { value: '#0d9488' }, 700: { value: '#0f766e' }, 800: { value: '#115e59' },
          900: { value: '#134e4a' }, 950: { value: '#042f2e' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: 'white' },
          fg: { value: { _light: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
          subtle: { value: { _light: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
          muted: { value: { _light: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
          emphasized: { value: { _light: '{colors.brand.300}', _dark: '{colors.brand.700}' } },
          solid: { value: { _light: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
