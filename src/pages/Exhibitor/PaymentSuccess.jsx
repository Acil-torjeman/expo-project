// src/pages/Exhibitor/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import usePayment from '../../hooks/usePayment';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkPaymentStatus, loading, error } = usePayment();
  const [processingComplete, setProcessingComplete] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);
  
  // Background gradient
  const bgGradient = useColorModeValue(
    'linear(to-br, green.50, teal.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  
  // Card background
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Get PayPal order ID from URL query parameters
  const paypalOrderId = searchParams.get('token');
  
  useEffect(() => {
    const processPayment = async () => {
      if (paypalOrderId) {
        try {
          console.log('Processing payment with order ID:', paypalOrderId);
          const result = await checkPaymentStatus(paypalOrderId);
          
          console.log('Payment processing result:', result);
          
          if (result && result.success) {
            setProcessingComplete(true);
            // Get invoiceId from result if available
            if (result.invoiceId) {
              setInvoiceId(result.invoiceId);
            }
            
            // Auto redirect after 3 seconds
            setTimeout(() => {
              if (result.invoiceId) {
                navigate(`/exhibitor/invoices/${result.invoiceId}`);
              } else {
                navigate('/exhibitor/invoices');
              }
            }, 3000);
          }
        } catch (err) {
          console.error('Payment processing error:', err);
        }
      } else {
        console.warn('No PayPal order ID found in URL');
      }
    };
    
    processPayment();
  }, [paypalOrderId, checkPaymentStatus, navigate]);
  
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
              <Icon as={FiCheckCircle} w={16} h={16} color="green.500" />
              
              <Heading size="xl" textAlign="center">
                Payment Successful!
              </Heading>
              
              {loading ? (
                <Flex direction="column" align="center">
                  <Spinner size="lg" color="green.500" />
                  <Text mt={4}>Processing your payment...</Text>
                </Flex>
              ) : (
                <>
                  {error ? (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      <Text>{error}</Text>
                    </Alert>
                  ) : (
                    <Text fontSize="lg" textAlign="center">
                      Your payment has been processed successfully.
                      {processingComplete ? ' You will be redirected shortly.' : ''}
                    </Text>
                  )}
                </>
              )}
              
              <Button
                mt={4}
                leftIcon={<FiArrowLeft />}
                onClick={() => {
                  if (invoiceId) {
                    navigate(`/exhibitor/invoices/${invoiceId}`);
                  } else {
                    navigate('/exhibitor/invoices');
                  }
                }}
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

export default PaymentSuccess;