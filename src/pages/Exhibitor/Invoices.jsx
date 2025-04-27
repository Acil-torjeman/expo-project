// src/pages/Exhibitor/Invoices.jsx
import React from 'react';
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
  CardHeader,
  HStack,
  Icon,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiFilter, 
  FiRefreshCw, 
  FiCreditCard, 
  FiChevronRight,
  FiDollarSign,
  FiCalendar,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiX
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import Table from '../../components/common/ui/Table';
import InvoiceFilterForm from '../../components/exhibitor/invoices/InvoiceFilterForm';
import useInvoices from '../../hooks/useInvoices';
import { motion } from 'framer-motion';

// Use proper motion component
const MotionBox = motion.div;

const ExhibitorInvoices = () => {
  const navigate = useNavigate();
  
  // Use filter modal disclosure
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose
  } = useDisclosure();
  
  // Use invoices hook
  const {
    invoices,
    loading,
    filters,
    selectedInvoices,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchInvoices,
    toggleInvoiceSelection,
    selectAllInvoices,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
  } = useInvoices();
  
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
            colorScheme="blue"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/exhibitor/invoices/${item._id}`);
            }}
            leftIcon={<Icon as={FiChevronRight} />}
          >
            View
          </Button>
          
          {item.status === 'pending' && (
            <Button
              size="sm"
              colorScheme="green"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/exhibitor/payment/${item._id}`);
              }}
              leftIcon={<Icon as={FiCreditCard} />}
            >
              Pay
            </Button>
          )}
        </HStack>
      )
    }
  ];
  
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
      case 'paid': return FiCheckCircle;
      case 'cancelled': return FiXCircle;
      default: return FiClock;
    }
  };
  
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
              My Invoices
            </Heading>
            <Text color="gray.500">
              View and manage your invoices for events
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
            placeholder="Search by invoice number or event name..."
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
                  : 'You have no invoices yet. They will appear here after you register for events.',
                icon: FiFileText,
                actionButton: (
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiRefreshCw />}
                    onClick={activeFiltersCount > 0 ? resetFilters : () => navigate('/exhibitor/events')}
                  >
                    {activeFiltersCount > 0 ? 'Clear Filters' : 'Explore Events'}
                  </Button>
                ),
              }}
              onRowClick={(item) => navigate(`/exhibitor/invoices/${item._id}`)}
            />
          </CardBody>
        </Card>
        
        {/* Payment Information */}
        <Card mt={6}>
          <CardHeader pb={0}>
            <Heading size="md">Payment Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Text>
                Invoices are generated after you complete your registration process for an event.
                Payment is required to finalize your participation.
              </Text>
              
              <HStack>
                <Badge colorScheme="yellow" p={2} borderRadius="md">
                  <HStack>
                    <Icon as={FiClock} />
                    <Text>PENDING</Text>
                  </HStack>
                </Badge>
                <Text>Payment is required</Text>
              </HStack>
              
              <HStack>
                <Badge colorScheme="green" p={2} borderRadius="md">
                  <HStack>
                    <Icon as={FiCheckCircle} />
                    <Text>PAID</Text>
                  </HStack>
                </Badge>
                <Text>Payment has been completed</Text>
              </HStack>
              
              <HStack>
                <Badge colorScheme="red" p={2} borderRadius="md">
                  <HStack>
                    <Icon as={FiXCircle} />
                    <Text>CANCELLED</Text>
                  </HStack>
                </Badge>
                <Text>Invoice has been cancelled</Text>
              </HStack>
            </VStack>
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
        <InvoiceFilterForm filters={filters} setFilters={updateFilters} />
      </FilterModal>
    </DashboardLayout>
  );
};

export default ExhibitorInvoices;