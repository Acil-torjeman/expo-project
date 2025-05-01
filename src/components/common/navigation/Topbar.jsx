// src/components/common/navigation/Topbar.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Icon,
  Badge,
  Divider,
  HStack,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiBell,
  FiMessageCircle,
} from 'react-icons/fi';

import ThemeToggleButton from '../ui/ThemeToggleButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSidebar } from '../../../context/SidebarContext';
import { useDashboard } from '../../../context/DashboardContext';
import axios from '../../../utils/api';
import { getRoleColorScheme } from '../../../constants/roles';

/**
 * Top navigation bar component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title to display (optional, will use context if not provided)
 */
const Topbar = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();
  const { currentPageTitle } = useDashboard();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Use provided title or get from dashboard context
  const pageTitle = title || currentPageTitle;
  
  // UI colors
  const bgBlur = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadowColor = useColorModeValue(
    '0 2px 8px rgba(0, 0, 0, 0.1)',
    '0 2px 8px rgba(0, 0, 0, 0.35)'
  );
  
  // Fetch the latest user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.id) {
        setLoading(true);
        try {
          const response = await axios.get(`/users/${user.id}`);
          if (response.data) {
            setUserData(response.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Format role name for display
  const formatRoleName = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  // Get the appropriate role color scheme
  const getRoleColor = (role) => {
    return getRoleColorScheme(role || 'admin');
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled in the logout function
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  // Get the display name from the user data
  const getDisplayName = () => {
    if (loading) return "Loading...";
    
    // Try to get the username from the userData (fetched from backend)
    if (userData && userData.username) {
      return userData.username;
    }
    
    // Otherwise, try to get it from the auth context
    if (user && user.username) {
      return user.username;
    }
    
    // Check for email as a fallback
    if (userData && userData.email) {
      // Use the part before @ as a username fallback
      return userData.email.split('@')[0];
    }
    
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    
    // Default fallback
    return "User";
  };
  
  // Get the active user data (prefer fresher data from backend)
  const activeUser = userData || user;
  const roleName = formatRoleName(activeUser?.role);
  const roleColor = getRoleColor(activeUser?.role);
  const displayName = getDisplayName();

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="10"
      backdropFilter="blur(10px)"
      background={bgBlur}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow={shadowColor}
      height="64px"
    >
      <Flex
        px={4}
        h="100%"
        align="center"
        justify="space-between"
      >
        {/* Left side - Menu toggle & Title */}
        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle Sidebar"
            icon={<FiMenu />}
            onClick={toggleSidebar}
            variant="ghost"
            color="teal.500"
            size="md"
          />
          <Text 
            fontSize="xl" 
            fontWeight="semibold"
            display={{ base: isMobile ? 'none' : 'block', md: 'block' }}
          >
            {pageTitle}
          </Text>
        </HStack>

        

        {/* Right side - Theme toggle, profile */}
        <HStack spacing={3}>
          {/* Theme toggle button */}
          <ThemeToggleButton size="sm" />

          {/* User Profile Menu */}
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack spacing="3">
                {loading ? (
                  <Spinner size="sm" color="teal.500" />
                ) : (
                  <Avatar
                    size="sm"
                    name={displayName}
                    src={activeUser?.avatar}
                    bg={`${roleColor}.500`}
                  />
                )}
                <Flex alignItems="flex-start" flexDir="column" display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {displayName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {roleName}
                  </Text>
                </Flex>
                <Box display={{ base: 'none', md: 'inline-block' }}>
                  <Icon as={FiChevronDown} />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={borderColor}
              minWidth="180px"
              p={2}
              boxShadow="lg"
              borderRadius="lg"
            >
              <MenuItem 
                icon={<FiLogOut />}
                onClick={handleLogout}
                borderRadius="md"
                color="red.500"
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Topbar;