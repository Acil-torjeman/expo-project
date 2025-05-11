// src/components/common/navigation/Sidebar.jsx
import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Flex,
  Text,
  useColorModeValue,
  Divider,
  Image,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenuForRole } from '../../../constants/sidebarConfig';
import { useAuth } from '../../../context/AuthContext';
import { useSidebar } from '../../../context/SidebarContext';
import logoSquare from '../../../assets/MyExpo carré.svg';

/**
 * Sidebar navigation component that adapts based on user role
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get user role from auth context
  const userRole = user?.role || 'admin'; 
  
  // Get menu items based on user role
  const menuItems = getMenuForRole(userRole);
  
  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMobile && isOpen && !e.target.closest('.sidebar')) {
        closeSidebar();
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobile, isOpen, closeSidebar]);

  // Animation variants for sidebar
  const sidebarVariants = {
    open: { width: '240px', x: 0, transition: { duration: 0.3 } },
    closed: { width: isMobile ? '0px' : '80px', x: isMobile ? '-100%' : 0, transition: { duration: 0.3 } }
  };

  // Don't render anything if on mobile and sidebar is closed
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <motion.div
      className="sidebar"
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      style={{
        position: 'fixed',
        zIndex: 100,
        height: '100vh',
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box
        h="100%"
        w={isOpen ? '240px' : isMobile ? '0' : '80px'}
        bg={bgColor}
        borderRight="1px"
        borderRightColor={borderColor}
        pt="4"
        overflowX="hidden"
        overflowY="auto"
        className="sidebar-inner"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-teal-200)',
            borderRadius: '24px',
          },
        }}
      >
        {/* Logo section */}
        <Flex justifyContent="center" alignItems="center" mb="8">
          <Image 
            src={logoSquare} 
            alt="MyExpo Logo" 
            h={isOpen ? "40px" : "32px"} 
            transition="all 0.3s"
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Text 
                  ml={2} 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="teal.500"
                  display={isOpen ? "block" : "none"}
                >
                  MyExpo
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </Flex>
        
        <Divider mb="6" />
        
        {/* Navigation items */}
        <VStack spacing="1" align="stretch" px="2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
              isOpen={isOpen}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  closeSidebar();
                }
              }}
            />
          ))}
        </VStack>
      </Box>
    </motion.div>
  );
};

export default Sidebar;