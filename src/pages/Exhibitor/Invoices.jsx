// src/pages/exhibitor/Invoices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiCalendar,
  FiDollarSign,
  FiChevronRight,
  FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import invoiceService from '../../services/invoice.service';

const ExhibitorInvoices = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getMyInvoices();
      setInvoices(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoices',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'green';
      case 'cancelled': return 'red';
      default: return 'yellow';
    }
  };
  
  return (
    <DashboardLayout title="Invoices">
      <Box p={4}>
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
        >
          <Box>
            <Heading size="lg" mb={1}>My Invoices</Heading>
            <Text color="gray.500">
              View and manage your event invoices and payments
            </Text>
          </Box>
          <Button 
            colorScheme="teal" 
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={fetchInvoices}
            isLoading={loading}
            mt={{ base: 4, md: 0 }}
          >
            Refresh
          </Button>
        </Flex>
        
        <Card mb={6}>
          <CardHeader pb={0}>
            <Heading size="md">Invoices</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Flex justify="center" align="center" my={10}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
              </Flex>
            ) : invoices.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text>No invoices found. They'll appear here after you complete an event registration.</Text>
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Invoice #</Th>
                      <Th>Event</Th>
                      <Th>Date</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoices.map((invoice) => (
                      <Tr key={invoice._id}>
                        <Td>
                          <HStack>
                            <Icon as={FiFileText} color="blue.500" />
                            <Text fontWeight="medium">{invoice.invoiceNumber}</Text>
                          </HStack>
                        </Td>
                        <Td>{invoice.event?.name || 'Unknown Event'}</Td>
                        <Td>
                          <HStack>
                            <Icon as={FiCalendar} color="gray.500" size="sm" />
                            <Text>{formatDate(invoice.createdAt)}</Text>
                          </HStack>
                        </Td>
                        <Td isNumeric>
                          <HStack justify="flex-end">
                            <Icon as={FiDollarSign} />
                            <Text fontWeight="bold">{invoice.total.toFixed(2)}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiExternalLink />}
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => window.open(invoiceService.getInvoicePdfUrl(invoice._id), '_blank')}
                            >
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              rightIcon={<FiChevronRight />}
                              colorScheme="teal"
                              onClick={() => navigate(`/exhibitor/invoices/${invoice._id}`)}
                            >
                              View
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">Payment Information</Heading>
          </CardHeader>
          <CardBody>
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">About Payments</Text>
                <Text>
                  Once you've completed your registration, an invoice will be generated automatically.
                  You can view and download your invoice, then proceed to payment.
                </Text>
              </Box>
            </Alert>
            
            <Button
              colorScheme="blue"
              leftIcon={<FiDollarSign />}
              onClick={() => navigate('/exhibitor/payments')}
              width={{ base: 'full', md: 'auto' }}
            >
              View Payment Methods
            </Button>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default ExhibitorInvoices;