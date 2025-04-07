// src/components/auth/VerifyEmail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Spinner,
  Link,
  useToast,
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'expired', 'already-verified', 'error'
  const [message, setMessage] = useState('');
  
  // Using a ref to avoid multiple API calls
  const verificationAttempted = useRef(false);
  
  // Colors based on color mode
  const formBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  useEffect(() => {
    // Email verification function
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      // Don't attempt verification if already done
      if (verificationAttempted.current) return;
      
      // Mark that we've attempted verification
      verificationAttempted.current = true;
      
      try {
        console.log('Verifying email with token:', token);
        
        // Make API request to backend
        const response = await fetch(`http://localhost:5001/auth/verify-email?token=${encodeURIComponent(token)}`);
        
        console.log('Response status:', response.status);
        
        // Get raw response text first for debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Try to parse JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } catch (parseError) {
          console.error('Error parsing response as JSON:', parseError);
          // If parsing fails, use raw text as message
          data = { message: responseText };
        }
        
        // Check if request was successful
        if (!response.ok) {
          // Handle different HTTP error codes
          if (response.status === 400) {
            // Check if token is expired
            if (data.message && data.message.includes('expired')) {
              setStatus('expired');
              setMessage(data.message || 'Your verification link has expired. Please register again.');
            } 
            // Check if email is already verified
            else if (data.message && data.message.includes('already verified')) {
              setStatus('already-verified');
              setMessage(data.message || 'This email has already been verified. You can now log in.');
            } 
            // Check if token is invalid or already used
            else if (data.message && (data.message.includes('already been used') || data.message.includes('invalid'))) {
              setStatus('error');
              setMessage(data.message || 'This verification link has already been used or is invalid.');
            }
            // Other validation errors
            else {
              setStatus('error');
              setMessage(data.message || 'There was a problem with your verification link.');
            }
          } else {
            // Server or other errors
            setStatus('error');
            setMessage(data.message || 'An error occurred during verification. Please try again later or contact support.');
          }
          return;
        }
        
        console.log('Server response:', data);
        
        // Update status and message
        setStatus('success');
        setMessage(data.message || 'Your email has been successfully verified. You can now log in to your account.');
        
        // Show success toast
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error during verification:', error);
        
        // If request failed (e.g., server unreachable)
        setStatus('error');
        setMessage('The server is not responding. Please try again later or contact support.');
        
        toast({
          title: 'Verification Failed',
          description: 'Unable to connect to the server. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Run verification if status is 'loading' and token exists
    if (status === 'loading' && token) {
      verifyEmailToken();
    }
  }, [token, status, toast]);

  // Navigate to login page
  const goToLogin = () => {
    navigate('/login');
  };

  // Navigate to signup page
  const goToSignup = () => {
    navigate('/signup/exhibitor');
  };

  // Render content based on status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="teal.400" thickness="4px" />
            <Text fontSize="lg" color={textColor}>Verifying your email...</Text>
          </VStack>
        );
      
      case 'success':
        return (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={8}
            borderRadius="md"
            bg={useColorModeValue("teal.50", "rgba(129, 230, 217, 0.12)")}
          >
            <Icon as={FiCheckCircle} boxSize="50px" color="teal.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2} color={headingColor}>Email Verified!</AlertTitle>
            <AlertDescription maxWidth="md" color={textColor}>
              <Text mb={4}>{message}</Text>
              <Button 
                colorScheme="teal"
                size="lg"
                onClick={goToLogin}
                mt={4}
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}`,
                  bgGradient: "linear(to-r, teal.500, teal.600)"
                }}
                transition="all 0.2s"
                bgGradient="linear(to-r, teal.400, teal.500)"
              >
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'expired':
        return (
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={8}
            borderRadius="md"
            bg={useColorModeValue("orange.50", "rgba(251, 211, 141, 0.12)")}
          >
            <Icon as={FiAlertTriangle} boxSize="50px" color="orange.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2} color={headingColor}>Verification Link Expired</AlertTitle>
            <AlertDescription maxWidth="md" color={textColor}>
              <Text mb={4}>{message}</Text>
              <Text mb={4}>
                If you still want to register, please create a new account.
              </Text>
              <Button 
                colorScheme="teal"
                size="lg"
                onClick={goToSignup}
                mt={4}
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}` 
                }}
                transition="all 0.2s"
              >
                Create New Account
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'already-verified':
        return (
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={8}
            borderRadius="md"
            bg={useColorModeValue("blue.50", "rgba(144, 205, 244, 0.12)")}
          >
            <Icon as={FiInfo} boxSize="50px" color="blue.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2} color={headingColor}>Already Verified</AlertTitle>
            <AlertDescription maxWidth="md" color={textColor}>
              <Text mb={4}>{message}</Text>
              <Button 
                colorScheme="teal"
                size="lg"
                onClick={goToLogin}
                mt={4}
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}` 
                }}
                transition="all 0.2s"
              >
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'error':
        return (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={8}
            borderRadius="md"
            bg={useColorModeValue("red.50", "rgba(254, 178, 178, 0.12)")}
          >
            <Icon as={FiAlertTriangle} boxSize="50px" color="red.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2} color={headingColor}>Verification Failed</AlertTitle>
            <AlertDescription maxWidth="md" color={textColor}>
              <Text mb={4}>{message}</Text>
              <Button 
                colorScheme="teal"
                size="lg"
                onClick={goToSignup}
                mt={4}
                boxShadow={`0 4px 6px ${shadowColor}`}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  boxShadow: `0 6px 10px ${shadowColor}` 
                }}
                transition="all 0.2s"
              >
                Create New Account
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <Flex align="center" justify="center" width="100%" maxW="600px" mx="auto">
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
            Email Verification
          </Heading>
          
          {renderContent()}
          
          <Flex justify="center" width="100%" mt={4}>
            <Link 
              color="teal.500"
              onClick={() => navigate(-1)}
              fontWeight="medium"
              _hover={{ textDecoration: 'underline', color: 'teal.600' }}
              display="inline-flex"
              alignItems="center"
              cursor="pointer"
            >
              <Icon as={FiArrowLeft} mr={1} />
              Go Back
            </Link>
          </Flex>
          
          <Box mt={4} textAlign="center" width="100%">
            <Text color={textColor} fontSize="sm">
              Need help? <Link color="teal.500" href="mailto:support@myexpo.com">Contact Support</Link>
            </Text>
          </Box>
        </VStack>
      </MotionBox>
    </Flex>
  );
};

export default VerifyEmail;