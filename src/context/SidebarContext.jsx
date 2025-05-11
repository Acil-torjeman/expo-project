// src/context/SidebarContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  // Initial state depends on screen size
  const currentBreakpoint = useBreakpointValue({ base: 'base', md: 'md' });
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update isMobile state when breakpoint changes
  useEffect(() => {
    setIsMobile(currentBreakpoint === 'base');
    
    // On mobile, sidebar should initially be closed
    if (currentBreakpoint === 'base') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [currentBreakpoint]);
  
  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };
  
  // Force sidebar open
  const openSidebar = () => {
    setIsOpen(true);
  };
  
  // Force sidebar closed
  const closeSidebar = () => {
    setIsOpen(false);
  };
  
  // Value to be provided by context
  const contextValue = {
    isOpen,
    isMobile,
    toggleSidebar,
    openSidebar,
    closeSidebar,
  };
  
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}