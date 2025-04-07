// src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Link,
  InputGroup,
  InputRightElement,
  Icon,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiArrowLeft, FiLock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Colors based on color mode
  const formBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setTokenError(true);
      toast({
        title: 'Invalid Link',
        description: 'The password reset link is invalid or has expired.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [token, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    // Password confirmation validation
    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call reset password service
      await authService.resetPassword({
        token,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      });
      
      setResetSuccess(true);
      toast({
        title: 'Password Reset Successfully',
        description: 'Your password has been reset. You can now log in with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      
      if (error.message && error.message.includes('expired')) {
        setTokenError(true);
        toast({
          title: 'Link Expired',
          description: 'The password reset link has expired. Please request a new one.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Reset Failed',
          description: error.message || 'An error occurred during password reset.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (tokenError) {
    return (
      <Flex align="center" justify="center" width="100%" maxW="500px" mx="auto">
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          width="100%"
          bg={formBg}
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
          p={{ base: 6, md: 8 }}
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="8px"
            bgGradient="linear(to-r, red.400, red.600)"
          />

          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
            bg={useColorModeValue("red.50", "rgba(254, 178, 178, 0.12)")}
            my={4}
          >
            <Icon as={FiAlertTriangle} boxSize="40px" color="red.400" />
            <AlertTitle mt={4} mb={1} fontSize="lg" color={headingColor}>
              Invalid Reset Link
            </AlertTitle>
            <AlertDescription maxWidth="sm" color={textColor}>
              The password reset link is invalid or has expired.
              <Button 
                mt={6}
                colorScheme="teal"
                onClick={() => navigate('/forgot-password')}
                size="md"
              >
                Request New Link
              </Button>
            </AlertDescription>
          </Alert>
        </MotionBox>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" width="100%" maxW="500px" mx="auto">
      <MotionBox 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        width="100%"
        bg={formBg}
        borderRadius="xl"
        boxShadow="xl"
        overflow="hidden"
        p={{ base: 6, md: 8 }}
        position="relative"
      >
        {/* Decorative gradient overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="8px"
          bgGradient="linear(to-r, teal.400, teal.600)"
        />

        <VStack spacing={6} align="flex-start" w="100%">
          <Heading as="h1" size="xl" color={headingColor} mb={1} mt={2}>
            Reset Password
          </Heading>

          {resetSuccess ? (
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="md"
              bg={useColorModeValue("teal.50", "rgba(129, 230, 217, 0.12)")}
            >
              <Icon as={FiCheckCircle} boxSize="40px" color="teal.400" />
              <AlertTitle mt={4} mb={1} fontSize="lg" color={headingColor}>
                Password Reset Successful
              </AlertTitle>
              <AlertDescription maxWidth="sm" color={textColor}>
                Your password has been successfully reset.
                <Button 
                  mt={6}
                  colorScheme="teal"
                  onClick={() => navigate('/login')}
                  size="md"
                >
                  Go to Login
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <VStack spacing={6} as="form" onSubmit={handleSubmit} width="100%">
              <Text color={textColor} align="left" width="100%">
                Enter your new password below to reset your account password.
              </Text>
              
              {/* Password field */}
              <FormControl isInvalid={!!errors.password} width="100%">
                <FormLabel htmlFor="password">New Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    size="lg"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pr="4.5rem"
                    pl="2.5rem"
                  />
                  <Box position="absolute" left="1rem" top="50%" transform="translateY(-50%)" zIndex="1">
                    <Icon as={FiLock} color={useColorModeValue("gray.400", "gray.500")} />
                  </Box>
                  <InputRightElement width="4.5rem" h="100%">
                    <Button h="80%" size="sm" onClick={toggleShowPassword} variant="ghost">
                      <Icon as={showPassword ? FaEyeSlash : FaEye} color={useColorModeValue("gray.400", "gray.500")} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              {/* Confirm password field */}
              <FormControl isInvalid={!!errors.passwordConfirmation} width="100%">
                <FormLabel htmlFor="passwordConfirmation">Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    size="lg"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pr="4.5rem"
                    pl="2.5rem"
                  />
                  <Box position="absolute" left="1rem" top="50%" transform="translateY(-50%)" zIndex="1">
                    <Icon as={FiLock} color={useColorModeValue("gray.400", "gray.500")} />
                  </Box>
                  <InputRightElement width="4.5rem" h="100%">
                    <Button h="80%" size="sm" onClick={toggleShowConfirmPassword} variant="ghost">
                      <Icon as={showConfirmPassword ? FaEyeSlash : FaEye} color={useColorModeValue("gray.400", "gray.500")} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.passwordConfirmation}</FormErrorMessage>
              </FormControl>
              
              {/* Submit button */}
              <Button
                w="100%"
                colorScheme="teal"
                size="lg"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Resetting"
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}`,
                  bgGradient: "linear(to-r, teal.500, teal.600)"
                }}
                _active={{ 
                  transform: 'translateY(0)', 
                  boxShadow: `0 4px 6px ${shadowColor}` 
                }}
                transition="all 0.2s"
                bgGradient="linear(to-r, teal.400, teal.500)"
              >
                Reset Password
              </Button>
              
              {/* Back to login link */}
              <Flex justify="center" width="100%" mt={2}>
                <Link 
                  as={RouterLink} 
                  to="/login" 
                  color="teal.500"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline', color: 'teal.600' }}
                  display="inline-flex"
                  alignItems="center"
                >
                  <Icon as={FiArrowLeft} mr={1} />
                  Back to Login
                </Link>
              </Flex>
            </VStack>
          )}
        </VStack>
      </MotionBox>
    </Flex>
  );
};

export default ResetPassword;