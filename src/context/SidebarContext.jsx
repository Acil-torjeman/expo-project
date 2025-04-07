// src/context/SidebarContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    } else if (!isMobile && !isOpen) {
      setIsOpen(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };
  
  const openSidebar = () => {
    setIsOpen(true);
  };
  
  const closeSidebar = () => {
    setIsOpen(false);
  };
  
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