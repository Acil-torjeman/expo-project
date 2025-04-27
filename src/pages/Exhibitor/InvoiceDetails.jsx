// src/pages/Exhibitor/InvoiceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  HStack,
  VStack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiChevronRight,
  FiCheck,
  FiClock,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import invoiceService from '../../services/invoice.service';
import paymentService from '../../services/payment.service'; // Add payment service
import InvoiceViewer from '../../components/exhibitor/invoices/InvoiceViewer';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false); // Add payment loading state
  
  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await invoiceService.getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (error) {
        setError(error.message || 'Failed to load invoice details');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load invoice details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId, toast]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle payment directly
  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      // Create base URL for the frontend routes
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const returnUrl = `${baseUrl}/exhibitor/payments/success`;
      const cancelUrl = `${baseUrl}/exhibitor/payments/cancel`;
      
      const paymentData = await paymentService.createPayment(invoiceId, returnUrl, cancelUrl);
      
      if (paymentData && paymentData.paymentUrl) {
        // Redirect to Stripe checkout directly
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('No payment URL returned from server');
      }
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPaymentLoading(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <Flex justify="center" align="center" minH="500px">
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Flex>
      </DashboardLayout>
    );
  }
  
  if (error || !invoice) {
    return (
      <DashboardLayout>
        <Box p={8} textAlign="center">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>Invoice not found or failed to load</Text>
          </Alert>
          <Button 
            mt={6} 
            colorScheme="teal" 
            onClick={() => navigate('/exhibitor/registrations')}
          >
            Back to Registrations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
  const event = invoice.event || {};
  const status = invoice.status;
  
  return (
    <DashboardLayout>
      <Box p={4}>
        {/* Breadcrumb navigation */}
        <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/exhibitor/registrations')}>
              Registrations
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${invoice.registration?._id || invoice.registration}`)}>
              Registration Details
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Invoice</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          wrap="wrap"
        >
          <Heading size="lg" mb={{ base: 2, md: 0 }}>
            Invoice #{invoice.invoiceNumber}
          </Heading>
          
          <Badge 
            colorScheme={status === 'paid' ? 'green' : status === 'cancelled' ? 'red' : 'yellow'} 
            fontSize="md" 
            px={3} 
            py={1} 
            borderRadius="full"
          >
            {status.toUpperCase()}
          </Badge>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
          {/* Invoice Information */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Invoice Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiFileText} color="teal.500" />
                  <Text fontWeight="medium">Invoice Number:</Text>
                  <Text>{invoice.invoiceNumber}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiCalendar} color="teal.500" />
                  <Text fontWeight="medium">Invoice Date:</Text>
                  <Text>{formatDate(invoice.createdAt)}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiUser} color="teal.500" />
                  <Text fontWeight="medium">Exhibitor:</Text>
                  <Text>
                    {invoice.exhibitor?.company?.companyName || 'Not specified'}
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiBriefcase} color="teal.500" />
                  <Text fontWeight="medium">Event:</Text>
                  <Text>{event.name || 'Not specified'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiCalendar} color="teal.500" />
                  <Text fontWeight="medium">Event Dates:</Text>
                  <Text>
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiClock} color="teal.500" />
                  <Text fontWeight="medium">Status:</Text>
                  <Badge colorScheme={status === 'paid' ? 'green' : status === 'cancelled' ? 'red' : 'yellow'}>
                    {status.toUpperCase()}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Payment Summary */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Payment Summary</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <Stat>
                  <StatLabel>Subtotal</StatLabel>
                  <StatNumber>${invoice.subtotal?.toFixed(2) || '0.00'}</StatNumber>
                  <StatHelpText>Before taxes</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</StatLabel>
                  <StatNumber>${invoice.taxAmount?.toFixed(2) || '0.00'}</StatNumber>
                  <StatHelpText>VAT</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Total</StatLabel>
                  <StatNumber>${invoice.total?.toFixed(2) || '0.00'}</StatNumber>
                  <StatHelpText>
                    <HStack>
                      <Icon as={FiDollarSign} />
                      <Text>USD</Text>
                    </HStack>
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <Divider my={4} />
              
              <Button 
                colorScheme="blue" 
                width="full" 
                leftIcon={<Icon as={FiCreditCard} />}
                onClick={handlePayment}
                isLoading={paymentLoading}
                loadingText="Processing..."
                isDisabled={status === 'paid' || status === 'cancelled'}
                mb={4}
              >
                {status === 'paid' ? 'Payment Complete' : 'Proceed to Payment'}
              </Button>
              
              {status === 'paid' && (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <HStack>
                    <Icon as={FiCheck} />
                    <Text>Paid on {formatDate(invoice.updatedAt)}</Text>
                  </HStack>
                </Alert>
              )}
              
              {status === 'pending' && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text>Please complete the payment to finalize your registration</Text>
                </Alert>
              )}
              
              {status === 'cancelled' && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text>This invoice has been cancelled</Text>
                </Alert>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {/* Invoice Items */}
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Invoice Items</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" mb={4}>
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Quantity</Th>
                  <Th isNumeric>Price</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoice.items?.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <HStack>
                        <Badge colorScheme={item.type === 'stand' ? 'orange' : 'purple'}>
                          {item.type.toUpperCase()}
                        </Badge>
                        <Text>{item.name}</Text>
                      </HStack>
                    </Td>
                    <Td>{item.description || '-'}</Td>
                    <Td isNumeric>{item.quantity}</Td>
                    <Td isNumeric>${item.price?.toFixed(2)}</Td>
                    <Td isNumeric>${(item.price * item.quantity).toFixed(2)}</Td>
                  </Tr>
                ))}
                <Tr fontWeight="bold">
                  <Td colSpan={4}>Subtotal</Td>
                  <Td isNumeric>${invoice.subtotal?.toFixed(2) || '0.00'}</Td>
                </Tr>
                <Tr>
                  <Td colSpan={4}>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</Td>
                  <Td isNumeric>${invoice.taxAmount?.toFixed(2) || '0.00'}</Td>
                </Tr>
                <Tr fontWeight="bold" fontSize="lg">
                  <Td colSpan={4}>Total</Td>
                  <Td isNumeric>${invoice.total?.toFixed(2) || '0.00'}</Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        
        {/* PDF Viewer */}
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Invoice Document</Heading>
          </CardHeader>
          <CardBody p={6} height="100px">
            <InvoiceViewer pdfPath={invoice?.pdfPath} />
          </CardBody>
        </Card>
        
        {/* Action Buttons */}
        <Flex justify="center" mb={6}>
          <Button 
            mr={4} 
            variant="outline"
            onClick={() => navigate(`/exhibitor/registrations/${invoice.registration?._id || invoice.registration}`)}
          >
            Back to Registration
          </Button>
          
          <Button 
            colorScheme="blue" 
            leftIcon={<Icon as={FiCreditCard} />}
            onClick={handlePayment}
            isLoading={paymentLoading}
            isDisabled={status === 'paid' || status === 'cancelled'}
          >
            {status === 'paid' ? 'View Payment History' : 'Proceed to Payment'}
          </Button>
        </Flex>
      </Box>
    </DashboardLayout>
  );
};

export default InvoiceDetails;