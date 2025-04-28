// src/pages/organizer/Invoices.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  Card,
  CardBody,
  HStack,
  Icon,
  useDisclosure,
  Alert,
  AlertIcon,
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Stack,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiFilter, 
  FiRefreshCw, 
  FiChevronRight,
  FiDownload,
  FiDollarSign,
  FiCalendar,
  FiSearch,
  FiCheck,
  FiClock,
  FiX
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../utils/fileUtils';
import invoiceService from '../../services/invoice.service';
import eventService from '../../services/event.service';

const OrganizerInvoices = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  // State
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    event: ''
  });
  
  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user?.id) {
          const data = await eventService.getOrganizerEvents(user.id);
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, [user]);
  
  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get invoices from backend
      // In a real implementation, we would have a dedicated API endpoint for this
      // For now, we'll just fetch from a mock function that would be implemented later
      // const data = await invoiceService.getOrganizerInvoices(user.id);
      
      // Placeholder for actual implementation
      // This would be replaced with actual backend call
      const data = [];
      
      // Apply filters
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchLower)) || 
          (item.event?.name && item.event.name.toLowerCase().includes(searchLower)) ||
          (item.exhibitor?.company?.companyName && item.exhibitor.company.companyName.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }
      
      if (filters.event) {
        filteredData = filteredData.filter(item => 
          item.event && (
            (typeof item.event === 'object' && item.event._id === filters.event) ||
            (typeof item.event === 'string' && item.event === filters.event)
          )
        );
      }
      
      setInvoices(filteredData);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch invoices',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user, filters, toast]);
  
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  
  // Handle search
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'green';
      case 'cancelled': return 'red';
      default: return 'yellow';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return FiCheck;
      case 'cancelled': return FiX;
      default: return FiClock;
    }
  };
  
  return (
    <DashboardLayout title="Invoices">
      <Box p={4}>
        {/* Header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg" fontWeight="bold" mb={1}>
              Exhibitor Invoices
            </Heading>
            <Text color="gray.500">
              View and manage invoices for exhibitors participating in your events
            </Text>
          </Box>
          
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="teal"
            onClick={fetchInvoices}
          >
            Refresh
          </Button>
        </Flex>
        
        {/* Filters */}
        <Card mb={6}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box flex="1">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search by invoice #, company name..." 
                    value={filters.search}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Box>
              
              <Select 
                placeholder="All Statuses" 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                maxW="200px"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              
              <Select 
                placeholder="All Events" 
                name="event"
                value={filters.event}
                onChange={handleFilterChange}
                maxW="250px"
              >
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </Select>
            </Stack>
          </CardBody>
        </Card>
        
        {/* Error message if any */}
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Error loading invoices</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
            <Button size="sm" onClick={fetchInvoices}>
              Retry
            </Button>
          </Alert>
        )}
        
        {/* Development Message - Remove in production */}
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Future Implementation</Text>
            <Text>This page will display invoices from all exhibitors participating in your events. It is currently under development.</Text>
          </Box>
        </Alert>
        
        {/* Invoices Table */}
        <Card variant="outline">
          <CardBody p={0}>
            {loading ? (
              <Flex justify="center" align="center" p={10}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
              </Flex>
            ) : invoices.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Invoice #</Th>
                    <Th>Company</Th>
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
                      <Td>{invoice.exhibitor?.company?.companyName || 'Unknown'}</Td>
                      <Td>{invoice.event?.name || 'Unknown'}</Td>
                      <Td>{formatDate(invoice.createdAt)}</Td>
                      <Td isNumeric>${invoice.total?.toFixed(2) || '0.00'}</Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(invoice.status)} 
                          display="flex"
                          alignItems="center"
                          width="fit-content"
                        >
                          <Icon as={getStatusIcon(invoice.status)} mr={1} boxSize={3} />
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          leftIcon={<FiDownload />}
                          onClick={() => {
                            if (invoice.pdfPath) {
                              window.open(getFileUrl(`/uploads/invoices/${invoice.pdfPath}`), '_blank');
                            }
                          }}
                          isDisabled={!invoice.pdfPath}
                        >
                          PDF
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                p={10}
              >
                <Icon as={FiFileText} boxSize={10} color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No Invoices Found</Heading>
                <Text color="gray.500" textAlign="center" mb={6}>
                  {filters.search || filters.status || filters.event 
                    ? 'No invoices match your current filters.' 
                    : 'No invoices have been generated yet for your events.'}
                </Text>
                <Button 
                  colorScheme="teal" 
                  onClick={() => setFilters({ search: '', status: '', event: '' })}
                  isDisabled={!filters.search && !filters.status && !filters.event}
                >
                  Clear Filters
                </Button>
              </Flex>
            )}
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default OrganizerInvoices;