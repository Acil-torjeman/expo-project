// src/pages/Exhibitor/PaymentCancel.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FiXCircle, FiArrowLeft } from 'react-icons/fi';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Background gradient
  const bgGradient = useColorModeValue(
    'linear(to-br, red.50, orange.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  
  // Card background
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Extract invoice ID from token if available
  const token = searchParams.get('token');
  
  // Auto redirect after a delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/exhibitor/invoices');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  return (
    <Box minH="100vh" bgGradient={bgGradient} py={10}>
      <Container maxW="container.md">
        <Flex direction="column" align="center">
          <Box
            w="full"
            bg={cardBg}
            borderRadius="xl"
            boxShadow="xl"
            overflow="hidden"
            p={8}
          >
            <VStack spacing={6} align="center">
              <Icon as={FiXCircle} w={16} h={16} color="red.500" />
              
              <Heading size="xl" textAlign="center">
                Payment Cancelled
              </Heading>
              
              <Text fontSize="lg" textAlign="center">
                Your payment was cancelled. No charges have been made.
              </Text>
              
              <Text color="gray.500">
                You will be redirected to your invoices in a few seconds.
              </Text>
              
              <Button
                mt={4}
                leftIcon={<FiArrowLeft />}
                onClick={() => navigate('/exhibitor/invoices')}
              >
                Return to Invoices
              </Button>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default PaymentCancel;