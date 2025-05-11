// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Box, useColorModeValue, Flex } from '@chakra-ui/react';
import Sidebar from '../components/common/navigation/Sidebar';
import Topbar from '../components/common/navigation/Topbar';
import { useSidebar } from '../context/SidebarContext';

/**
 * Main layout for dashboard pages with sidebar and topbar
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.title - Optional page title override
 */
const DashboardLayout = ({ children, title }) => {
  const { isOpen, isMobile } = useSidebar();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Calculate main content margin based on sidebar state and device type
  const getMainContentMargin = () => {
    if (isMobile) {
      return 0; // No margin on mobile regardless of sidebar state
    }
    return isOpen ? '240px' : '80px'; // Desktop margins
  };

  return (
    <Box height="100vh" overflow="hidden" position="relative" bg={bgColor}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <Box
        ml={{ base: 0, md: isOpen ? '240px' : '80px' }}
        transition="margin-left 0.3s ease"
        height="100vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {/* Topbar */}
        <Topbar title={title} />
        
        {/* Page content */}
        <Flex
          direction="column"
          flex="1"
          overflow="auto"
          p={4}
          pt={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 128, 128, 0.2)',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(0, 128, 128, 0.4)',
            },
          }}
        >
          {children}
        </Flex>
      </Box>
    </Box>
  );
};

export default DashboardLayout;