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
  FiX,
  FiCheck,
  FiClock
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import Table from '../../components/common/ui/Table';
import InvoiceFilterForm from '../../components/exhibitor/invoices/InvoiceFilterForm';
import { useAuth } from '../../context/AuthContext';
import { getInvoicePdfUrl } from '../../utils/fileUtils';

const MotionBox = motion.div;

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
    event: '',
    startDate: '',
    endDate: ''
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  // Modal states
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose
  } = useDisclosure();
  
  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user?.id) {
          const eventService = await import('../../services/event.service').then(m => m.default);
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
      // Import dynamically to avoid circular dependencies
      const invoiceService = await import('../../services/invoice.service').then(m => m.default);
      
      // Get all exhibitor invoices for events organized by this organizer
      let data = await invoiceService.getOrganizerInvoices();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array of invoices but got:', data);
        data = []; // Reset to empty array if not proper format
      }
      
      console.log(`Received ${data.length} invoices from backend`);
      
      // Apply filters only if we have data
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
      
      // Apply date filters
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        filteredData = filteredData.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= startDate;
        });
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt <= endDate;
        });
      }
      
      // Sort invoices by date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setInvoices(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage) || 1
      }));
      
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
  
  // Load data when filters change
  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
    }
  }, [fetchInvoices, user]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      event: '',
      startDate: '',
      endDate: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Toggle invoice selection
  const toggleInvoiceSelection = useCallback((invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  }, []);
  
  // Select all invoices
  const selectAllInvoices = useCallback((selected) => {
    if (selected) {
      const allIds = invoices.map(item => item._id);
      setSelectedInvoices(allIds);
    } else {
      setSelectedInvoices([]);
    }
  }, [invoices]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return invoices.slice(startIndex, endIndex);
  }, [invoices, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'status') return value !== '';
      if (key === 'event') return value !== '';
      if (key === 'startDate') return value !== '';
      if (key === 'endDate') return value !== '';
      return false;
    }).length;
  }, [filters]);
  
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
  
  // Define table columns
  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      render: (item) => (
        <HStack>
          <Icon as={FiFileText} color="blue.500" />
          <Text fontWeight="medium">{item.invoiceNumber}</Text>
        </HStack>
      )
    },
    {
      header: 'Company',
      accessor: 'exhibitor',
      render: (item) => {
        // Vérifier différentes structures possibles pour exhibitor et company
        let companyName = 'Unknown';
        
        // Structure 1: exhibitor → company → companyName (structure attendue)
        if (item.exhibitor?.company?.companyName) {
          companyName = item.exhibitor.company.companyName;
        }
        // Structure 2: exhibitor populated directement avec le document company
        else if (typeof item.exhibitor === 'object' && item.exhibitor?.companyName) {
          companyName = item.exhibitor.companyName;
        }
        // Structure 3: on examine si company a été renvoyé comme un champ séparé
        else if (item.company?.companyName) {
          companyName = item.company.companyName;
        }
        
        return <Text>{companyName}</Text>;
      }
    },
    {
      header: 'Event',
      accessor: 'event',
      render: (item) => (
        <Text>{item.event?.name || 'Unknown Event'}</Text>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (item) => (
        <HStack>
          <Icon as={FiCalendar} color="gray.500" size="sm" />
          <Text>{formatDate(item.createdAt)}</Text>
        </HStack>
      )
    },
    {
      header: 'Amount',
      accessor: 'total',
      isNumeric: true,
      render: (item) => (
        <HStack justify="flex-end">
          <Icon as={FiDollarSign} />
          <Text fontWeight="bold">${item.total?.toFixed(2) || '0.00'}</Text>
        </HStack>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        <Badge 
          colorScheme={getStatusColor(item.status)} 
          borderRadius="full"
          px={2}
          py={1}
          display="flex"
          alignItems="center"
          width="fit-content"
        >
          <Icon 
            as={getStatusIcon(item.status)} 
            mr={1} 
            fontSize="xs" 
          />
          {item.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (item) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            leftIcon={<Icon as={FiDownload} />}
            onClick={(e) => {
              e.stopPropagation();
              if (item.pdfPath) {
                window.open(getInvoicePdfUrl(item.pdfPath), '_blank');
              }
            }}
            isDisabled={!item.pdfPath}
          >
            PDF
          </Button>
        </HStack>
      )
    }
  ];
  
  // Handle search
  const handleSearch = (searchText) => {
    updateFilters({ search: searchText });
  };
  
  // Apply filters from modal
  const applyFilters = (newFilters) => {
    updateFilters(newFilters);
    onFilterClose();
  };
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Get current page data
  const currentInvoices = getCurrentPageData();
  
  // Check if selected all
  const isAllSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;

  return (
    <DashboardLayout title="Invoices">
      <Box p={4}>
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
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FiFilter />}
              colorScheme="teal"
              variant="outline"
              onClick={onFilterOpen}
              position="relative"
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  colorScheme="teal"
                  borderRadius="full"
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  boxSize="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="teal"
              variant="ghost"
              onClick={fetchInvoices}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by invoice number, company or event..."
            onSearch={handleSearch}
            value={filters.search}
          />
        </Box>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Flex 
              mb={4} 
              flexWrap="wrap" 
              alignItems="center" 
              bg="teal.50" 
              p={3} 
              borderRadius="md"
              position="relative"
            >
              <Text fontWeight="medium" color="teal.700" mr={2}>
                Active filters:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {filters.search && (
                  <Badge size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Search: {filters.search}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ search: '' })} />
                  </Badge>
                )}
                
                {filters.status && (
                  <Badge size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.status}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ status: '' })} />
                  </Badge>
                )}
                
                {filters.event && (
                  <Badge size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Event Filter
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ event: '' })} />
                  </Badge>
                )}
                
                {filters.startDate && (
                  <Badge size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    From: {new Date(filters.startDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ startDate: '' })} />
                  </Badge>
                )}
                
                {filters.endDate && (
                  <Badge size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    To: {new Date(filters.endDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ endDate: '' })} />
                  </Badge>
                )}
              </HStack>
              
              <Button 
                size="xs" 
                colorScheme="teal" 
                variant="link" 
                onClick={resetFilters}
                position={{ base: 'static', md: 'absolute' }}
                right="12px"
                mt={{ base: 2, md: 0 }}
                ml={{ base: 'auto', md: 0 }}
              >
                Clear all
              </Button>
            </Flex>
          </MotionBox>
        )}
        
        {/* Invoices Table */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            <Table
              columns={columns}
              data={currentInvoices}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedItems={selectedInvoices}
              isAllSelected={isAllSelected}
              onSelectItem={toggleInvoiceSelection}
              onSelectAll={selectAllInvoices}
              onChangePage={changePage}
              emptyState={{
                title: 'No Invoices Found',
                description: filters.search || filters.status || filters.event || filters.startDate || filters.endDate
                  ? 'No invoices match your current filters.'
                  : 'No invoices have been generated yet for your events.',
                icon: FiFileText,
                actionButton: (
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiRefreshCw />}
                    onClick={activeFiltersCount > 0 ? resetFilters : fetchInvoices}
                  >
                    {activeFiltersCount > 0 ? 'Clear Filters' : 'Refresh'}
                  </Button>
                ),
              }}
              showSelection={false}
            />
          </CardBody>
        </Card>
      </Box>
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={onFilterClose}
        onApply={applyFilters}
        onReset={resetFilters}
        initialFilters={filters}
        title="Filter Invoices"
      >
        <InvoiceFilterForm 
          filters={filters} 
          setFilters={updateFilters}
        />
      </FilterModal>
    </DashboardLayout>
  );
};

export default OrganizerInvoices;