// src/pages/organizer/Plans.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiMap,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import Table from '../../components/common/ui/Table';
import PlanFormModal from '../../components/organizer/plans/PlanFormModal';
import PlanFilterForm from '../../components/organizer/plans/PlanFilterForm';
import PlanViewerModal from '../../components/organizer/plans/PlanViewerModal';
import usePlans from '../../hooks/usePlans';

// Use proper motion component
const MotionBox = motion.div;

const Plans = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get plans data and functions from custom hook
  const {
    plans,
    loading,
    filters,
    selectedPlans,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchPlans,
    togglePlanSelection,
    selectAllPlans,
    changePage,
    createPlan,
    updatePlan,
    deletePlan,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
    hasSelected,
  } = usePlans();
  
  // Local state
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewPlanId, setViewPlanId] = useState(null);
  
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
    isOpen: isViewerOpen,
    onOpen: onViewerOpen,
    onClose: onViewerClose
  } = useDisclosure();
  
  // Define table columns
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (item) => (
        <Text fontWeight="medium">{item.name}</Text>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (item) => (
        <Text noOfLines={2}>
          {item.description || 'No description'}
        </Text>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (item) => (
        <Badge colorScheme={item.isActive ? 'green' : 'red'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (item) => (
        <Text>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (item) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="View plan"
            icon={<FiEye />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleAction('view', item);
            }}
          />
          
          <IconButton
            aria-label="Edit plan"
            icon={<FiEdit2 />}
            size="sm"
            colorScheme="teal"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleAction('edit', item);
            }}
          />
          
          <IconButton
            aria-label="Delete plan"
            icon={<FiTrash2 />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleAction('delete', item);
            }}
          />
          
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAction('stands', item);
            }}
          >
            Manage Stands
          </Button>
        </HStack>
      )
    }
  ];
  
  // Handle plan actions (view, edit, delete, etc.)
  const handleAction = (action, item) => {
    setSelectedItem(item);
    
    switch (action) {
      case 'view':
        setViewPlanId(item._id);
        onViewerOpen();
        break;
      case 'edit':
        onEditOpen();
        break;
      case 'delete':
        onDeleteOpen();
        break;
      case 'stands':
        navigate(`/organizer/plans/${item._id}/stands`, { state: { from: location.pathname } });
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  // Handle plan deletion
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await deletePlan(selectedItem._id);
      onDeleteClose();
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle form submission (create/edit)
  const handleFormSubmit = async (formData, pdfFile) => {
    try {
      if (isEditOpen) {
        await updatePlan(selectedItem._id, formData, pdfFile);
        onEditClose();
      } else {
        await createPlan(formData, pdfFile);
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
  
  // Handle row click
  const handleRowClick = (item) => {
    setViewPlanId(item._id);
    onViewerOpen();
  };
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Get current page data
  const currentPlans = [...getCurrentPageData()].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <DashboardLayout title="Floor Plans">
      <Box as="section" py={4} px={2}>
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
              Floor Plans
            </Heading>
            <Text color="gray.500">
              Manage your floor plans for events
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
              onClick={fetchPlans}
            >
              Refresh
            </Button>
            
            <Button
              leftIcon={<FiPlus />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              Add Plan
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by name or description..."
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
                
                {filters.isActive !== '' && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.isActive === 'true' ? 'Active' : 'Inactive'}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ isActive: '' })} />
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
        
        {/* Plans Table */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            <Table
              columns={columns}
              data={currentPlans}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedItems={selectedPlans}
              isAllSelected={isAllSelected}
              onSelectItem={togglePlanSelection}
              onSelectAll={selectAllPlans}
              onChangePage={changePage}
              emptyState={{
                title: 'No Floor Plans Found',
                description: filters.search || filters.isActive !== '' 
                  ? 'No plans match your current filters.' 
                  : 'You have not added any floor plans yet.',
                icon: FiMap,
                actionButton: (
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiPlus />}
                    onClick={activeFiltersCount > 0 ? resetFilters : onCreateOpen}
                  >
                    {activeFiltersCount > 0 ? 'Clear Filters' : 'Add First Plan'}
                  </Button>
                ),
              }}
              onRowClick={handleRowClick}
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
        title="Filter Floor Plans"
      >
        <PlanFilterForm filters={filters} setFilters={updateFilters} />
      </FilterModal>
      
      {/* Create/Edit Plan Modal */}
      <PlanFormModal
        isOpen={isCreateOpen || isEditOpen}
        onClose={isEditOpen ? onEditClose : onCreateClose}
        plan={isEditOpen ? selectedItem : null}
        onSubmit={handleFormSubmit}
      />
      
      {/* Plan Viewer Modal */}
      <PlanViewerModal
        isOpen={isViewerOpen}
        onClose={onViewerClose}
        planId={viewPlanId}
      />
      
      {/* Delete Confirmation Dialog */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          title="Delete Floor Plan"
          body={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmColorScheme="red"
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default Plans;