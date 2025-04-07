// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
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
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const MotionBox = motion(Box);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    
    // Simple regex for email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Call forgot password service
      await authService.forgotPassword({ email });
      
      // Success - don't reveal if email exists for security reasons
      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'If this email address is associated with an account, you will receive a password reset link shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      // Always show the same message to prevent information leakage
      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'If this email address is associated with an account, you will receive a password reset link shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Log error in development only
      console.error("Error requesting password reset:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Forgot Password
          </Heading>

          {emailSent ? (
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
              <AlertIcon boxSize="40px" color="teal.400" />
              <AlertTitle mt={4} mb={1} fontSize="lg" color={headingColor}>
                Check Your Email
              </AlertTitle>
              <AlertDescription maxWidth="sm" color={textColor}>
                If this email address is associated with an account, we have sent a password reset link.
                <Button 
                  mt={6}
                  colorScheme="teal"
                  onClick={() => navigate('/login')}
                  leftIcon={<FiArrowLeft />}
                  size="md"
                >
                  Return to Login
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <VStack spacing={6} as="form" onSubmit={handleSubmit} width="100%">
              <Text color={textColor} align="left" width="100%">
                Enter your email address below and we'll send you a link to reset your password.
              </Text>
              
              <FormControl isInvalid={!!error} width="100%">
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  leftIcon={<FiMail />}
                  _hover={{ borderColor: 'teal.300' }}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              
              <Button
                w="100%"
                colorScheme="teal"
                size="lg"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Sending"
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
                Send Reset Link
              </Button>
              
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

export default ForgotPassword;