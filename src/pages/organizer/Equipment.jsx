// src/pages/organizer/Equipment.jsx
import React, { useState } from 'react';
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
  Card,
  CardBody,
  Badge,
  Avatar,
  IconButton,
  Center,
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiBox,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import EquipmentFormModal from '../../components/organizer/equipment/EquipmentFormModal';
import useEquipment from '../../hooks/useEquipment';
import EquipmentFilterForm from '../../components/organizer/equipment/EquipmentFilterForm';
import Table from '../../components/common/ui/Table';
import { getEquipmentImageUrl } from '../../utils/fileUtils';


// Use proper motion component
const MotionBox = motion.div;

const Equipment = () => {
  // Get user from auth context

  
  // Get equipment data and functions from custom hook
  const {
    equipment,
    loading,
    filters,
    selectedEquipment,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchEquipment,
    toggleEquipmentSelection,
    selectAllEquipment,
    changePage,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
    hasSelected,
  } = useEquipment();
  
  // Local state
  const [selectedItem, setSelectedItem] = useState(null);
  
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
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose
  } = useDisclosure();
  
  // Define table columns
  const columns = [
    {
      header: '',
      accessor: 'imageUrl',
      render: (item) => (
        item.imageUrl ? (
          <Avatar 
            size="md" 
            src={getEquipmentImageUrl(item.imageUrl)}
            borderRadius="full"
          />
        ) : (
          <Avatar 
            size="md" 
            bg="gray.100"
            icon={<Icon as={FiBox} color="gray.400" boxSize="1.5rem" />}
          />
        )
      ),
    },
    
    {
      header: 'Name',
      accessor: 'name',
      render: (item) => (
        <Text fontWeight="medium">{item.name}</Text>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (item) => (
        <Badge 
          colorScheme="teal" 
          variant="subtle"
          borderRadius="full"
        >
          {formatCategory(item.category)}
        </Badge>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      isNumeric: true,
      render: (item) => (
        <Text>{formatPrice(item.price, item.unit)}</Text>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      isNumeric: true,
      render: (item) => (
        <Text>{item.quantity}</Text>
      ),
    },
    {
      header: 'Status',
      accessor: 'isAvailable',
      render: (item) => (
        <Badge 
          colorScheme={item.isAvailable ? 'green' : 'red'}
          variant="subtle"
          borderRadius="full"
        >
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (item) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit equipment"
            icon={<FiEdit2 />}
            size="sm"
            colorScheme="teal"
            variant="ghost"
            onClick={() => handleAction('edit', item)}
          />
          
          <IconButton
            aria-label={item.isAvailable ? "Disable equipment" : "Enable equipment"}
            icon={item.isAvailable ? <FiX /> : <FiCheck />}
            size="sm"
            colorScheme={item.isAvailable ? "red" : "green"}
            variant="ghost"
            onClick={() => handleAction('toggleStatus', item)}
          />
          
          <IconButton
            aria-label="Delete equipment"
            icon={<FiTrash2 />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => handleAction('delete', item)}
          />
        </HStack>
      ),
    },
  ];
  
  // Format price with unit
  const formatPrice = (price, unit) => {
    if (price === undefined || price === null) return 'N/A';
    
    const unitMap = {
      'hour': '/hour',
      'day': '/day',
      'event': '/event',
      'piece': '/piece',
      'square_meter': '/m²'
    };
    
    // Format price to show up to 3 decimal places, but only if needed
    const formattedPrice = price % 1 === 0 
      ? price.toFixed(0) 
      : price.toFixed(3).replace(/\.?0+$/, '');
    
    return `$${formattedPrice}${unitMap[unit] || ''}`;
  };
  
  
  // Format category
  const formatCategory = (category) => {
    if (!category) return 'Other';
    
    // Convert from snake_case to Title Case
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Handle equipment actions (view, edit, delete, etc.)
  const handleAction = (action, item) => {
    setSelectedItem(item);
    
    switch (action) {
      case 'edit':
        onEditOpen();
        break;
      case 'delete':
        onDeleteOpen();
        break;
      case 'toggleStatus':
        onStatusOpen();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  // Handle equipment deletion
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    await deleteEquipment(selectedItem._id);
    onDeleteClose();
    setSelectedItem(null);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedItem) return;
    
    await updateEquipment(selectedItem._id, { isAvailable: !selectedItem.isAvailable });
    onStatusClose();
    setSelectedItem(null);
  };
  
  // Handle form submission (create/edit)
  const handleFormSubmit = async (formData, imageFile) => {
    if (isEditOpen) {
      await updateEquipment(selectedItem._id, formData, imageFile);
      onEditClose();
    } else {
      await createEquipment(formData, imageFile);
      onCreateClose();
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
  const currentEquipment = [...getCurrentPageData()].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <DashboardLayout title="Equipment Management">
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
              Equipment Management
            </Heading>
            <Text color="gray.500">
              Manage your equipment inventory for events
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
              onClick={fetchEquipment}
            >
              Refresh
            </Button>
            
            <Button
              leftIcon={<FiPlus />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              Add Equipment
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
                
                {filters.category && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Category: {formatCategory(filters.category)}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ category: '' })} />
                  </Tag>
                )}
                
                {filters.isAvailable !== '' && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.isAvailable === 'true' ? 'Available' : 'Unavailable'}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ isAvailable: '' })} />
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
        
        {/* Equipment Table */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            <Table
              columns={columns}
              data={currentEquipment}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedItems={selectedEquipment}
              isAllSelected={isAllSelected}
              onSelectItem={toggleEquipmentSelection}
              onSelectAll={selectAllEquipment}
              onChangePage={changePage}
              emptyState={{
                title: 'No Equipment Found',
                description: filters.search || filters.category || filters.isAvailable !== '' 
                  ? 'No equipment matches your current filters.' 
                  : 'You have not added any equipment yet.',
                icon: FiBox,
                actionButton: (
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiPlus />}
                    onClick={activeFiltersCount > 0 ? resetFilters : onCreateOpen}
                  >
                    {activeFiltersCount > 0 ? 'Clear Filters' : 'Add First Equipment'}
                  </Button>
                ),
              }}
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
        title="Filter Equipment"
      >
        <EquipmentFilterForm 
          filters={filters} 
          setFilters={updateFilters} 
        />
      </FilterModal>
      
      {/* Create/Edit Equipment Modal */}
      <EquipmentFormModal
        isOpen={isCreateOpen || isEditOpen}
        onClose={isEditOpen ? onEditClose : onCreateClose}
        equipment={isEditOpen ? selectedItem : null}
        onSubmit={handleFormSubmit}
      />
      
      {/* Delete Confirmation Dialog */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          title="Delete Equipment"
          body={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmColorScheme="red"
          onConfirm={handleDelete}
        />
      )}
      
      {/* Status Change Confirmation Dialog */}
      {selectedItem && (
        <ConfirmDialog
          isOpen={isStatusOpen}
          onClose={onStatusClose}
          title={selectedItem.isAvailable ? "Disable Equipment" : "Enable Equipment"}
          body={`Are you sure you want to ${selectedItem.isAvailable ? "disable" : "enable"} "${selectedItem.name}"?`}
          confirmText={selectedItem.isAvailable ? "Disable" : "Enable"}
          confirmColorScheme={selectedItem.isAvailable ? "red" : "green"}
          onConfirm={handleStatusChange}
        />
      )}
    </DashboardLayout>
  );
};

export default Equipment;