// src/components/AppProviders.jsx
import React from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import theme from '../theme';
import { AuthProvider } from '../context/AuthContext';
import { SidebarProvider } from '../context/SidebarContext';
import { SearchProvider } from '../context/SearchContext';
import { DashboardProvider } from '../context/DashboardContext';

/**
 * Wraps the application with all required providers
 * This creates a clean hierarchy of contexts for the app
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Application content
 */
const AppProviders = ({ children }) => {
  return (
    <>
      {/* Add ColorModeScript with theme config to persist color mode */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <SidebarProvider>
              <SearchProvider>
                <DashboardProvider>
                  {children}
                </DashboardProvider>
              </SearchProvider>
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </>
  );
};

export default AppProviders;