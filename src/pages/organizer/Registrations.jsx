// src/pages/organizer/Registrations.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  HStack,
  Tag,
  Icon,
  Badge,
  Card,
  CardBody,
  IconButton,
  useToast,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiUsers,
  FiEye,
  FiCheckSquare,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import Table from '../../components/common/ui/Table';
import RegistrationFilterForm from '../../components/organizer/registrations/RegistrationFilterForm';
import ReviewRegistrationModal from '../../components/organizer/registrations/ReviewRegistrationModal';
import RegistrationStats from '../../components/organizer/registrations/RegistrationStats';
import useRegistrations from '../../hooks/useRegistrations';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';

// Use proper motion component
const MotionBox = motion(Box);

const Registrations = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  // Get registrations data and functions from custom hook
  const {
    registrations,
    events,
    loading,
    filters,
    selectedRegistrations,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchRegistrations,
    toggleRegistrationSelection,
    selectAllRegistrations,
    changePage,
    reviewRegistration,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
    hasSelected,
  } = useRegistrations();
  
  // Local state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states using Chakra's useDisclosure
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose
  } = useDisclosure();
  
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose
  } = useDisclosure();
  
  // Define table columns with simplified actions
  const columns = [
    {
      header: 'Company',
      accessor: 'exhibitor',
      render: (item) => {
        // Check if exhibitor exists and has a company
        const exhibitor = item.exhibitor;
        
        if (!exhibitor) {
          return <Text fontWeight="medium">No exhibitor data</Text>;
        }
        
        const company = exhibitor.company || {};
        const companyName = company.companyName || 'Unknown company';
        const sector = company.sector || 'No sector';
        
        return (
          <HStack>
            <Text fontWeight="medium">{companyName}</Text>
            <Badge size="sm" colorScheme="blue">
              {sector}
            </Badge>
          </HStack>
        );
      }
    },
    {
      header: 'Event',
      accessor: 'event',
      render: (item) => (
        <Text>{item.event?.name || item.eventName || 'Unknown'}</Text>
      )
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (item) => {
        const exhibitor = item.exhibitor;
        
        if (!exhibitor) {
          return <Text>No contact info</Text>;
        }
        
        const user = exhibitor.user || {};
        return <Text>{user.email || 'No email'}</Text>;
      }
    },
    {
      header: 'Registration Date',
      accessor: 'createdAt',
      render: (item) => (
        <Text>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => (
        <Badge colorScheme={getStatusColorScheme(item.status)}>
          {getStatusDisplayText(item.status)}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (item) => (
        <HStack spacing={2}>
          {/* View details icon - navigate to details page */}
          <IconButton
            aria-label="View details"
            icon={<FiEye />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/organizer/registrations/${item._id}`);
            }}
          />
          
          {/* Decision icon - only shown for pending registrations */}
          {item.status === 'pending' && (
            <IconButton
              aria-label="Review registration"
              icon={<FiCheckSquare />}
              size="sm"
              colorScheme="teal"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleAction('review', item);
              }}
            />
          )}
        </HStack>
      )
    }
  ];
  
  // Handle registration actions (view, review)
  const handleAction = (action, item) => {
    setSelectedItem(item);
    
    switch (action) {
      case 'review':
        onReviewOpen();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  // Handle approve action
  const handleApprove = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await reviewRegistration(selectedItem._id, { 
        status: 'approved' 
      });
      setSelectedItem(null);
      onReviewClose();
      
      toast({
        title: 'Registration Approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reject action
  const handleReject = async (reason) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await reviewRegistration(selectedItem._id, {
        status: 'rejected',
        reason
      });
      setSelectedItem(null);
      onReviewClose();
      
      toast({
        title: 'Registration Rejected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
  
  // Handle row click - navigate to details page
  const handleRowClick = (item) => {
    navigate(`/organizer/registrations/${item._id}`);
  };
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Get current page data
  const currentRegistrations = getCurrentPageData();

  return (
    <DashboardLayout title="Registrations">
      <Box as="section" py={4} px={2}>
        {/* Registration Stats */}
        <Box mb={6}>
          <RegistrationStats registrations={registrations} />
        </Box>
        
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
              Registration Requests
            </Heading>
            <Text color="gray.500">
              Manage exhibitor registrations for your events
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
              onClick={fetchRegistrations}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by company name, email, or event..."
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
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Search: {filters.search}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ search: '' })} />
                  </Tag>
                )}
                
                {filters.event && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Event: {events.find(e => e._id === filters.event)?.name || filters.event}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ event: '' })} />
                  </Tag>
                )}
                
                {filters.status && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ status: '' })} />
                  </Tag>
                )}
                
                {filters.startDate && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    From: {new Date(filters.startDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ startDate: '' })} />
                  </Tag>
                )}
                
                {filters.endDate && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    To: {new Date(filters.endDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ endDate: '' })} />
                  </Tag>
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
        
        {/* Registrations Table */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            <Table
              columns={columns}
              data={currentRegistrations}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedItems={selectedRegistrations}
              isAllSelected={isAllSelected}
              onSelectItem={toggleRegistrationSelection}
              onSelectAll={selectAllRegistrations}
              onChangePage={changePage}
              emptyState={{
                title: 'No Registrations Found',
                description: filters.search || filters.event || filters.status 
                  ? 'No registrations match your current filters.' 
                  : 'You have not received any registration requests yet.',
                icon: FiUsers,
                actionButton: activeFiltersCount > 0 ? (
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiX />}
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </Button>
                ) : null,
              }}
              onRowClick={handleRowClick}
              showSelection={false} // Hide selection checkboxes
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
        title="Filter Registrations"
      >
        <RegistrationFilterForm 
          filters={filters} 
          setFilters={updateFilters} 
          events={events}
        />
      </FilterModal>
      
      {/* Review Registration Modal - only for quick actions, full review on details page */}
      {selectedItem && (
        <ReviewRegistrationModal
          isOpen={isReviewOpen}
          onClose={onReviewClose}
          registration={selectedItem}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

export default Registrations;