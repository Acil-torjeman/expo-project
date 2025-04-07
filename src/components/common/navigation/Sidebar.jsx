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
 * Composant de navigation latérale qui s'adapte en fonction du rôle de l'utilisateur
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Récupération du rôle depuis le contexte d'authentification
  const userRole = user?.role || 'admin'; // Fallback à admin pour le développement
  
  // Récupération des éléments de menu en fonction du rôle
  const menuItems = getMenuForRole(userRole);
  
  // Gestion des clics en dehors pour le mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMobile && isOpen && !e.target.closest('.sidebar')) {
        closeSidebar();
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobile, isOpen, closeSidebar]);

  // Variantes d'animation pour la sidebar
  const sidebarVariants = {
    open: { width: '240px', transition: { duration: 0.3 } },
    closed: { width: '80px', transition: { duration: 0.3 } },
  };

  // Ne pas afficher sur mobile si fermée
  if (isMobile && !isOpen) return null;

  return (
    <AnimatePresence>
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
          {/* Section du logo */}
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
          
          {/* Éléments de navigation */}
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
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;