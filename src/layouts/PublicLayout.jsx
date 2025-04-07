// src/layouts/PublicLayout.jsx
import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

/**
 * Layout component for public pages with consistent header and footer
 * Uses clean gradients that work well in both light and dark modes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.isFullHeight - Whether the content should take full viewport height
 */
const PublicLayout = ({ children, isFullHeight = false }) => {
  // Enhanced gradient background for better light/dark mode adaptation
  const bgGradient = useColorModeValue(
    'linear(to-b, white, gray.50, gray.100)',
    'linear(to-b, gray.800, gray.900)'
  );
  
  // Additional subtle pattern overlay for visual interest without images
  const patternColor = useColorModeValue(
    'rgba(236, 242, 247, 0.7)',
    'rgba(23, 25, 35, 0.7)'
  );

  return (
    <Flex 
      direction="column" 
      minH="100vh"
      position="relative"
    >
      {/* Main background with gradient */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={bgGradient}
        zIndex="-2"
      />
      
      {/* Subtle pattern overlay */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={patternColor}
        zIndex="-1"
        opacity="0.6"
        backgroundImage={`
          radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.2) 2%, transparent 0%),
          radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.2) 2%, transparent 0%)
        `}
        backgroundSize="100px 100px"
      />
      
      {/* Header */}
      <PublicHeader />
      
      {/* Main content */}
      <Box 
        flex="1" 
        width="100%" 
        py={8}
        minH={isFullHeight ? 'calc(100vh - 60px - 300px)' : 'auto'}
        display="flex"
        flexDirection="column"
        bg={useColorModeValue('transparent', 'gray.900')}
        position="relative"
        zIndex="1"
      >
        {children}
      </Box>
      
      {/* Footer */}
      <PublicFooter />
    </Flex>
  );
};

export default PublicLayout;