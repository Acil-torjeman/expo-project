// src/pages/organizer/Stands.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  Flex,
  Text,
  HStack,
  Tag,
  Icon,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Center,
  VStack,
  Tooltip
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiPlus,
  FiGrid,
  FiChevronRight,
  FiArrowLeft,
  FiFileText
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import StandCard from '../../components/organizer/stands/StandCard';
import StandFormModal from '../../components/organizer/stands/StandFormModal';
import StandDetailsModal from '../../components/organizer/stands/StandDetailsModal';
import StandStatusDialog from '../../components/organizer/stands/StandStatusDialog';
import StandFilterForm from '../../components/organizer/stands/StandFilterForm';
import PlanViewerModal from '../../components/organizer/plans/PlanViewerModal';
import useStands from '../../hooks/useStands';
import planService from '../../services/plan.service';

// Use proper motion component
const MotionBox = motion.div;

const Stands = () => {
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // State
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewStandId, setViewStandId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Get stands data and functions from custom hook
  const {
    stands,
    loading,
    filters,
    updateFilters,
    resetFilters,
    fetchStands,
    createStand,
    updateStand,
    deleteStand,
    updateStandStatus,
    getActiveFiltersCount,
  } = useStands({}, planId);
  
  // Modal states using Chakra's useDisclosure
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose
  } = useDisclosure();
  
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose
  } = useDisclosure();
  
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();
  
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose
  } = useDisclosure();
  
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose
  } = useDisclosure();
  
  // Plan viewer modal
  const {
    isOpen: isPlanViewerOpen,
    onOpen: onPlanViewerOpen,
    onClose: onPlanViewerClose
  } = useDisclosure();
  
  // Get plan details if planId is provided
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setPlanLoading(false);
        return;
      }
      
      setPlanLoading(true);
      
      try {
        const planData = await planService.getPlanById(planId);
        setPlan(planData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load plan details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setPlanLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, toast]);
  
  // Handle view stand
  const handleViewStand = (stand) => {
    setViewStandId(stand._id);
    onDetailsOpen();
  };
  
  // Handle edit stand
  const handleEditStand = (stand) => {
    setSelectedItem(stand);
    onEditOpen();
  };
  
  // Handle delete stand
  const handleDeleteStand = (stand) => {
    setSelectedItem(stand);
    onDeleteOpen();
  };
  
  // Handle status change
  const handleStatusChange = (stand, status) => {
    setSelectedItem(stand);
    setNewStatus(status);
    onStatusOpen();
  };
  
  // Handle viewing plan PDF
  const handleViewPlanPdf = () => {
    if (plan?.pdfPath) {
      onPlanViewerOpen();
    } else {
      toast({
        title: 'No PDF Available',
        description: 'There is no PDF available for this plan.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await deleteStand(selectedItem._id);
      onDeleteClose();
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete stand',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Confirm status change
  const confirmStatusChange = async (id, status, reason) => {
    try {
      await updateStandStatus(id, status, reason);
      setSelectedItem(null);
      setNewStatus('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stand status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle form submission (create/edit)
  const handleFormSubmit = async (formData) => {
    try {
      if (isEditOpen) {
        await updateStand(selectedItem._id, formData);
        onEditClose();
      } else {
        await createStand(formData);
        onCreateClose();
      }
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
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
  
  // Navigation
  const handleGoBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/organizer/plans');
    }
  };
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Colors
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Page title
  const pageTitle = plan 
    ? `Stands - ${plan.name}`
    : 'Stands Management';

  return (
    <DashboardLayout title={pageTitle}>
      <Box as="section" py={4} px={2}>
        {/* Breadcrumb and navigation */}
        <Flex mb={6} justifyContent="space-between" alignItems="center">
          <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={handleGoBack}
                display="flex"
                alignItems="center"
              >
                <Icon as={FiArrowLeft} mr={1} /> Back to Plans
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>
                {planLoading ? (
                  <Skeleton height="20px" width="120px" />
                ) : (
                  plan?.name || 'All Stands'
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Flex>
        
        {/* Header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Flex align="center">
              {/* Icône pour afficher le PDF du plan avant le titre */}
              {plan?.pdfPath && !planLoading && (
                <Tooltip label="View Floor Plan" placement="top" hasArrow>
                  <IconButton
                    aria-label="View Floor Plan"
                    icon={<FiFileText />}
                    colorScheme="teal"
                    variant="ghost"
                    size="md"
                    mr={2}
                    onClick={handleViewPlanPdf}
                  />
                </Tooltip>
              )}
              
              <Heading size="lg" fontWeight="bold" mb={1}>
                {planLoading ? (
                  <Skeleton height="36px" width="200px" />
                ) : (
                  plan 
                    ? `Stands for ${plan.name}`
                    : 'All Stands'
                )}
              </Heading>
            </Flex>
            
            {planLoading ? (
              <Skeleton height="20px" width="300px" />
            ) : (
              <Text color="gray.500">
                {plan
                  ? `Manage stands for this floor plan`
                  : 'Manage all your exhibition stands'}
              </Text>
            )}
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
              onClick={fetchStands}
            >
              Refresh
            </Button>
            
            <Button
              leftIcon={<FiPlus />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              Add Stand
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by stand number or description..."
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
                
                {filters.type && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Type: {filters.type}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ type: '' })} />
                  </Tag>
                )}
                
                {filters.status && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.status}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ status: '' })} />
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
        
        {/* Stands Grid */}
        <Card variant="outline" shadow="sm" bg={cardBg}>
          <CardBody p={4}>
            {loading || planLoading ? (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} height="200px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : stands.length > 0 ? (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {stands.map(stand => (
                  <StandCard
                    key={stand._id}
                    stand={stand}
                    onView={handleViewStand}
                    onEdit={handleEditStand}
                    onDelete={handleDeleteStand}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Center py={10} bg={emptyStateBg} borderRadius="md">
                <VStack spacing={4}>
                  <Icon as={FiGrid} boxSize={12} color="teal.500" opacity={0.6} />
                  <Heading size="md">No Stands Found</Heading>
                  <Text textAlign="center" maxW="md" color="gray.500">
                    {activeFiltersCount > 0
                      ? "No stands match your current filters."
                      : plan
                        ? "You haven't created any stands for this plan yet."
                        : "You haven't created any stands yet."}
                  </Text>
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiPlus />}
                    onClick={activeFiltersCount > 0 ? resetFilters : onCreateOpen}
                  >
                    {activeFiltersCount > 0 ? 'Clear Filters' : 'Add First Stand'}
                  </Button>
                </VStack>
              </Center>
            )}
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
        title="Filter Stands"
      >
        <StandFilterForm filters={filters} setFilters={updateFilters} />
      </FilterModal>
      
      {/* Create/Edit Stand Modal */}
      <StandFormModal
        isOpen={isCreateOpen || isEditOpen}
        onClose={isEditOpen ? onEditClose : onCreateClose}
        stand={isEditOpen ? selectedItem : null}
        onSubmit={handleFormSubmit}
        planId={planId}
        planName={plan?.name}
      />
      
      {/* Stand Details Modal */}
      <StandDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        standId={viewStandId}
        onEdit={handleEditStand}
        onChangeStatus={handleStatusChange}
      />
      
      {/* Plan Viewer Modal */}
      <PlanViewerModal
        isOpen={isPlanViewerOpen}
        onClose={onPlanViewerClose}
        planId={planId}
      />
      
      {/* Delete Confirmation Dialog */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          title="Delete Stand"
          body={`Are you sure you want to delete Stand "${selectedItem.number}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmColorScheme="red"
          onConfirm={confirmDelete}
        />
      )}
      
      {/* Status Change Dialog */}
      {selectedItem && newStatus && (
        <StandStatusDialog
          isOpen={isStatusOpen}
          onClose={onStatusClose}
          stand={selectedItem}
          newStatus={newStatus}
          onConfirm={confirmStatusChange}
        />
      )}
    </DashboardLayout>
  );
};

export default Stands;