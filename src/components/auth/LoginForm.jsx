// src/components/auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserCircle } from 'react-icons/fa';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const LoginForm = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  
  // Auth context
  const { login, isAuthenticated, user } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Colors based on color mode
  const formBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');
  const illustrationBg = useColorModeValue('teal.50', 'gray.700');
  const illustrationGradient = useColorModeValue(
    "linear(to-br, teal.100, teal.50, blue.50)",
    "linear(to-br, teal.900, teal.800, gray.800)"
  );

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Get the redirect path based on user role
      const redirectPath = `/${user.role}/dashboard`;
      
      // Use a small timeout to ensure all state is properly updated
      setTimeout(() => {
        // Navigate to the dashboard
        navigate(redirectPath);
      }, 100);
    }
  }, [isAuthenticated, user, navigate]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Use login from Auth context
      const success = await login({ email, password });
      
      if (success) {
        // Success is handled in the useEffect above
        console.log('Login successful, redirect will happen in useEffect');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <Flex 
      align="center" 
      justify="center" 
      minH="100vh"
      minW="100vw"
      
      maxW="1200px" 
      px={4}
      bg={useColorModeValue('transparent', 'gray.900')}
    >
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        idth="100%"
        overflow="hidden"
        boxShadow="xl"
        borderRadius="xl"
        bg={formBg}
      >
        {/* Left side - stylized illustration using gradients (no images) */}
        <MotionBox 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          width={{ base: '100%', lg: '50%' }}
          bg={illustrationBg}
          p={{ base: '6', lg: '10' }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          borderRight={{ base: 'none', lg: '1px solid' }}
          borderBottom={{ base: '1px solid', lg: 'none' }}
          borderColor={borderColor}
          position="relative"
          overflow="hidden"
          backgroundColor={useColorModeValue("rgba(237, 242, 247, 0.8)", "rgba(23, 25, 35, 0.8)")}
          _after={{
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundImage: `radial-gradient(circle at 30% 30%, ${useColorModeValue("rgba(129, 230, 217, 0.4)", "rgba(45, 55, 72, 0.6)")}, transparent)`,
            zIndex: '0',
          }}
        >
          {/* Stylized element instead of an image */}
          <Box
            position="relative"
            zIndex="1"
            width="200px"
            height="200px"
            mb={6}
            borderRadius="full"
            bgGradient={illustrationGradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="lg"
          >
            <Icon 
              as={FaUserCircle} 
              w="100px" 
              h="100px" 
              color={useColorModeValue("teal.500", "teal.200")} 
            />
          </Box>
          
          <VStack spacing={3} align="center" textAlign="center" zIndex="1">
            <Heading as="h2" size="lg" color={useColorModeValue("teal.600", "teal.300")}>
              Welcome Back!
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")} fontSize="md">
              Manage your exhibitions and events with our comprehensive platform.
            </Text>
          </VStack>
        </MotionBox>
        
        {/* Right side - login form */}
        <MotionBox 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          width={{ base: '100%', lg: '50%' }}
          p={{ base: '6', md: '12' }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <VStack 
            spacing={8} 
            align="flex-start" 
            w="100%" 
            maxW="450px"
            mx="auto"
          >
            <Box w="100%">
              <Heading as="h1" size="xl" mb={2} bgGradient="linear(to-r, teal.400, teal.600)" bgClip="text">
                Log in
              </Heading>
              <Text color={useColorModeValue("gray.600", "gray.400")}>
                Enter your credentials to access your account
              </Text>
            </Box>
            
            {/* Login form */}
            <VStack as="form" spacing={5} w="100%" onSubmit={handleSubmit}>
              {/* Email field */}
              <FormControl isInvalid={errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaEnvelope} color={useColorModeValue("gray.400", "gray.500")} />
                  </InputLeftElement>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              {/* Password field */}
              <FormControl isInvalid={errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLock} color={useColorModeValue("gray.400", "gray.500")} />
                  </InputLeftElement>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                  />
                  <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                    <Icon as={showPassword ? FaEyeSlash : FaEye} color={useColorModeValue("gray.400", "gray.500")} />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              {/* Remember me and forgot password */}
              <Flex w="100%" justify="space-between" align="center">
                <Checkbox
                  colorScheme="teal"
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  <Text fontSize="sm">Remember me</Text>
                </Checkbox>
                <Link 
                  as={RouterLink} 
                  to="/forgot-password" 
                  color="teal.500"
                  fontSize="sm" 
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline', color: 'teal.600' }}
                >
                  Forgot password?
                </Link>
              </Flex>
              
              {/* Login error alert */}
              {loginError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {loginError}
                </Alert>
              )}
              
              {/* Login button */}
              <Button
                type="submit"
                w="100%"
                colorScheme="teal"
                size="lg"
                borderRadius="md"
                isLoading={isLoading}
                loadingText="Logging in"
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}`,
                  bgGradient: "linear(to-r, teal.500, teal.600)",
                }}
                _active={{ 
                  transform: 'translateY(0)', 
                  boxShadow: `0 4px 6px ${shadowColor}` 
                }}
                transition="all 0.2s"
                bgGradient="linear(to-r, teal.400, teal.500)"
              >
                Log in
              </Button>
              
              {/* Registration options */}
              <Box w="100%" textAlign="center" mt={4}>
                <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                  Don't have an account yet?
                </Text>
                <Flex 
                  justify="center" 
                  gap={4} 
                  mt={3} 
                  flexWrap={{ base: 'wrap', sm: 'nowrap' }}
                >
                  <Link
                    as={RouterLink}
                    to="/signup/exhibitor"
                    fontWeight="medium"
                    color="teal.500"
                    _hover={{ color: 'teal.600', textDecoration: 'underline' }}
                  >
                    Register as Exhibitor
                  </Link>
                  <Link
                    as={RouterLink}
                    to="/signup/organizer"
                    fontWeight="medium"
                    color="teal.500"
                    _hover={{ color: 'teal.600', textDecoration: 'underline' }}
                  >
                    Register as Organizer
                  </Link>
                </Flex>
              </Box>
            </VStack>
          </VStack>
        </MotionBox>
      </Flex>
    </Flex>
  );
};

export default LoginForm;