// src/components/layout/PublicHeader.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Image,
  useColorModeValue,
  useDisclosure,
  useColorMode,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun, FiUserPlus, FiHome, FiLogIn } from 'react-icons/fi';
import logoFull from '../../assets/MyExpo.svg';

const PublicHeader = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navigateToRoles = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const rolesSection = document.getElementById('roles');
        if (rolesSection) {
          rolesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const rolesSection = document.getElementById('roles');
      if (rolesSection) {
        rolesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = 'teal.500';
  const buttonBg = useColorModeValue('teal.400', 'teal.500');
  const buttonHoverBg = useColorModeValue('teal.500', 'teal.600');
  const mobileMenuBg = useColorModeValue('white', 'gray.800');
  const textShadow = colorMode === 'dark' ? '0 0 10px rgba(0,0,0,0.5)' : 'none';
  const headerShadow = scrolled ? useColorModeValue('sm', 'md') : 'none';
  const backdropFilter = scrolled ? "blur(10px)" : "none";
  const headerBorderBottom = scrolled ? `1px solid ${useColorModeValue('gray.200', 'gray.700')}` : 'none';

  return (
    <Box 
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      transition="all 0.3s ease"
      bg={bgColor}
      boxShadow={headerShadow}
      backdropFilter={backdropFilter}
      borderBottom={headerBorderBottom}
    >
      <Flex
        color={textColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 8 }}
        align={'center'}
        justifyContent="space-between"
        textShadow={textShadow}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'flex-start', md: 'start' }}>
          <Link as={RouterLink} to="/">
            <Image 
              src={logoFull}
              h={{ base: "35px", md: "50px" }}
              alt="MyExpo"
              transition="transform 0.3s ease"
              _hover={{ transform: 'scale(1.05)' }}
            />
          </Link>
        </Flex>

        <HStack spacing={8} as="nav" display={{ base: 'none', md: 'flex' }}>
          <Link
            as={RouterLink}
            to="/"
            fontSize="sm"
            fontWeight={600}
            color={isActive('/') ? accentColor : textColor}
            _hover={{ textDecoration: 'none', color: accentColor }}
          >
            Home
          </Link>
          <Link
            href="#"
            onClick={navigateToRoles}
            fontSize="sm"
            fontWeight={600}
            color={textColor}
            _hover={{ textDecoration: 'none', color: accentColor }}
          >
            Sign Up
          </Link>
        </HStack>

        <Flex align="center">
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
            color={textColor}
            _hover={{ bg: useColorModeValue('gray.200', 'whiteAlpha.200') }}
          />
          <Button
            as={RouterLink}
            to="/login"
            fontSize="sm"
            fontWeight={600}
            color="white"
            bg={buttonBg}
            leftIcon={<FiLogIn />}
            _hover={{ bg: buttonHoverBg }}
            size="sm"
            px={5}
          >
            Sign In
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PublicHeader;
