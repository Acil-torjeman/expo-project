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
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import { motion } from 'framer-motion';
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
      if (isMobile && isOpen && !e.target.closest('.sidebar') && !e.target.closest('.toggle-button')) {
        closeSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobile, isOpen, closeSidebar]);

  // If mobile and sidebar is closed, don't render anything
  if (isMobile && !isOpen) {
    return null;
  }

  // Mobile sidebar has a different style - full screen overlay
  if (isMobile) {
    return (
      <Box
        className="sidebar"
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100vh"
        zIndex="200"
        bg="rgba(0, 0, 0, 0.4)"
        onClick={(e) => {
          // Close sidebar when clicking on the overlay but not the content
          if (e.target === e.currentTarget) {
            closeSidebar();
          }
        }}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          width="240px"
          height="100%"
          bg={bgColor}
          borderRight="1px"
          borderRightColor={borderColor}
          pt="4"
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
          {/* Logo section with close button for mobile */}
          <Flex justifyContent="space-between" alignItems="center" mb="8" px="4">
            <Flex alignItems="center">
              <Image 
                src={logoSquare} 
                alt="MyExpo Logo" 
                h="32px" 
              />
              <Text 
                ml={2} 
                fontSize="xl" 
                fontWeight="bold" 
                color="teal.500"
              >
                MyExpo
              </Text>
            </Flex>
            
            <IconButton
              size="sm"
              variant="ghost"
              icon={<CloseIcon />}
              onClick={closeSidebar}
              aria-label="Close menu"
            />
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
                isOpen={true}  // Always show labels in mobile view
                onClick={() => {
                  navigate(item.path);
                  closeSidebar(); // Always close sidebar on mobile when clicking an item
                }}
              />
            ))}
          </VStack>
        </Box>
      </Box>
    );
  }

  // Desktop sidebar
  return (
    <Box
      className="sidebar"
      position="fixed"
      top="0"
      left="0"
      width={isOpen ? '240px' : '80px'}
      height="100vh"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      pt="4"
      overflowX="hidden"
      overflowY="auto"
      transition="width 0.3s ease"
      zIndex="100"
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
        {isOpen && (
          <Text 
            ml={2} 
            fontSize="xl" 
            fontWeight="bold" 
            color="teal.500"
          >
            MyExpo
          </Text>
        )}
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
            onClick={() => navigate(item.path)}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;