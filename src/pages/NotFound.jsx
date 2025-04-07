// src/pages/NotFound.jsx
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Icon,
  Container,
  VStack,
} from '@chakra-ui/react';
import { FiAlertCircle, FiHome, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Colors
  const bgGradient = useColorModeValue(
    'linear(to-br, teal.50, blue.50)',
    'linear(to-br, gray.800, teal.900)'
  );
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  
  // Determine where to go back to
  const goBack = () => {
    navigate(-1);
  };
  
  // Go to user's dashboard based on role
  const goToDashboard = () => {
    if (user && user.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <DashboardLayout title="Page Not Found">
      <Box
        h="full"
        w="full"
        bgGradient={bgGradient}
        borderRadius="lg"
        p={{ base: 4, md: 8 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="container.md">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="center"
            gap={{ base: 8, md: 12 }}
          >
            {/* Left side with the 404 number */}
            <Flex 
              direction="column" 
              alignItems="center"
              justify="center"
            >
              <Box position="relative" mb={4}>
                <Text
                  fontSize={{ base: '8rem', md: '12rem' }}
                  fontWeight="bold"
                  color={accentColor}
                  lineHeight="1"
                  opacity="0.15"
                >
                  404
                </Text>
                <Icon 
                  as={FiAlertCircle} 
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color={accentColor}
                  boxSize={{ base: "4rem", md: "6rem" }}
                />
              </Box>
            </Flex>
            
            {/* Right side with text and actions */}
            <VStack spacing={6} align="flex-start" maxW="480px">
              <Heading 
                as="h1" 
                size="xl" 
                color={textColor}
                fontWeight="bold"
              >
                Page Not Found
              </Heading>
              
              <Text color={textColor} fontSize="lg">
                We couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
              </Text>
              
              <Text color="gray.500" fontSize="md">
                URL: <Text as="span" fontWeight="medium">{location.pathname}</Text>
              </Text>
              
              <Flex 
                gap={4} 
                mt={4} 
                flexDir={{ base: 'column', sm: 'row' }}
                w={{ base: 'full', sm: 'auto' }}
              >
                <Button
                  leftIcon={<FiArrowLeft />}
                  onClick={goBack}
                  colorScheme="gray"
                  size="lg"
                  variant="outline"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Go Back
                </Button>
                
                <Button
                  leftIcon={<FiHome />}
                  onClick={goToDashboard}
                  colorScheme="teal"
                  size="lg"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Go to Dashboard
                </Button>
              </Flex>
            </VStack>
          </Flex>
          
          {/* Additional decorative elements - geometric shapes */}
          <Box
            position="absolute"
            top="20%"
            left="10%"
            w="20px"
            h="20px"
            bg={accentColor}
            opacity="0.2"
            borderRadius="full"
            zIndex="-1"
          />
          
          <Box
            position="absolute"
            bottom="20%"
            right="10%"
            w="50px"
            h="50px"
            bg={accentColor}
            opacity="0.1"
            transform="rotate(45deg)"
            zIndex="-1"
          />
          
          <Box
            position="absolute"
            bottom="30%"
            left="20%"
            w="30px"
            h="30px"
            border="2px solid"
            borderColor={accentColor}
            opacity="0.2"
            borderRadius="md"
            zIndex="-1"
          />
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default NotFoundPage;