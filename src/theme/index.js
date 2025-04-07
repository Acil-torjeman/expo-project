// src/theme/index.js
import { extendTheme } from '@chakra-ui/react';

/**
 * Custom theme configuration for the application
 * Extends Chakra UI's default theme with our custom styles
 * Includes configuration for both light and dark modes
 */
const theme = extendTheme({
  // Enable color mode config for dark mode persistence
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  
  // Custom color palette with teal as primary color
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
  
  // Modern, clean font choices
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },

  // Round borders by default
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'medium',
      },
      defaultProps: {
        colorScheme: 'teal',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'md',
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: 'md',
          overflow: 'hidden',
        },
        item: {
          borderRadius: 'md',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'md',
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          borderRadius: 'md',
        },
      },
    },
    Tooltip: {
      baseStyle: {
        borderRadius: 'md',
      },
    },
  },
  
  // Styles that apply to the entire app
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
      // Make focus outlines visible but subtle
      '*:focus': {
        boxShadow: `0 0 0 2px var(--chakra-colors-teal-400) !important`,
        outline: 'none !important',
      },
      // Better scrollbar styling for modern browsers
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderRadius: '24px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      },
      // Ensure transitions are smooth for color mode changes
      'body, *': {
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
      },
    }),
  },

  // Semantic tokens for consistent theming
  semanticTokens: {
    colors: {
      // Define additional semantic colors for consistent theme changes
      "bg.primary": {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      "bg.secondary": {
        default: 'white',
        _dark: 'gray.800',
      },
      "bg.tertiary": {
        default: 'gray.100',
        _dark: 'gray.700',
      },
      "bg.hover": {
        default: 'gray.100',
        _dark: 'gray.700',
      },
      "text.primary": {
        default: 'gray.800',
        _dark: 'white',
      },
      "text.secondary": {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      "border.primary": {
        default: 'gray.200',
        _dark: 'gray.700',
      },
    },
  },
});

export default theme;