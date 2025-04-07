// src/pages/admin/Trash.jsx
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
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Select,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiAlertCircle,
  FiRotateCcw,
  FiTrash,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import TrashTable from '../../components/admin/trash/TrashTable';
import FilterModal from '../../components/common/ui/FilterModal';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import { motion } from 'framer-motion';
import useTrash from '../../hooks/useTrash';
import { UserRole } from "../../constants/roles";

/**
 * Admin Trash Management page
 */
const TrashPage = () => {
  // Use the custom hook
  const {
    trashedItems,
    loading,
    error,
    filters,
    selectedItems,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchTrashedItems,
    toggleItemSelection,
    selectAllItems,
    changePage,
    restoreItem,
    batchRestoreItems,
    permanentlyDeleteItem,
    batchPermanentlyDeleteItems,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
    hasSelected,
  } = useTrash();

  // Local state
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Manage modals with Chakra's useDisclosure
  const { 
    isOpen: isFilterOpen, 
    onOpen: onFilterOpen, 
    onClose: onFilterClose 
  } = useDisclosure();
  
  const { 
    isOpen: isRestoreOpen, 
    onOpen: onRestoreOpen, 
    onClose: onRestoreClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  // Handle item actions
  const handleItemAction = (action, item) => {
    setSelectedItem(item);
    
    switch (action) {
      case 'restore':
        onRestoreOpen();
        break;
      case 'delete':
        onDeleteOpen();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  // Handle restore item
  const handleRestoreItem = async () => {
    if (!selectedItem) return;
    
    const success = await restoreItem(selectedItem._id);
    
    if (success) {
      onRestoreClose();
      setSelectedItem(null);
    }
  };
  
  // Handle permanent delete
  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    
    const success = await permanentlyDeleteItem(selectedItem._id);
    
    if (success) {
      onDeleteClose();
      setSelectedItem(null);
    }
  };
  
  // Handle batch restore
  const handleBatchRestore = async () => {
    if (selectedItems.length === 0) return;
    
    await batchRestoreItems(selectedItems);
  };
  
  // Handle batch permanent delete
  const handleBatchPermanentDelete = async () => {
    if (selectedItems.length === 0) return;
    
    await batchPermanentlyDeleteItems(selectedItems);
  };
  
  // Apply filters from modal
  const applyFilters = (newFilters) => {
    updateFilters(newFilters);
    onFilterClose();
  };
  
  // Handle search input change
  const handleSearch = (searchText) => {
    updateFilters({ ...filters, search: searchText });
  };
  
  // Get current page data
  const currentItems = getCurrentPageData();
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <DashboardLayout title="Trash Management">
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
              Trash
            </Heading>
            <Text color="gray.500">
              Items here will be permanently deleted after 30 days
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
              onClick={fetchTrashedItems}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search trashed items by name or email..."
            onSearch={handleSearch}
            value={filters.search}
          />
        </Box>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Flex 
              mb={4} 
              flexWrap="wrap" 
              alignItems="center" 
              bg="red.50" 
              p={3} 
              borderRadius="md"
              position="relative"
            >
              <Text fontWeight="medium" color="red.700" mr={2}>
                Active filters:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {filters.search && (
                  <Tag size="md" borderRadius="full" colorScheme="red" variant="subtle">
                    Search: {filters.search}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ search: '' })} />
                  </Tag>
                )}
                
                {filters.role && (
                  <Tag size="md" borderRadius="full" colorScheme="red" variant="subtle">
                    Role: {filters.role}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ role: '' })} />
                  </Tag>
                )}
                
                {(filters.startDate || filters.endDate) && (
                  <Tag size="md" borderRadius="full" colorScheme="red" variant="subtle">
                    Deleted date range
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ startDate: '', endDate: '' })} />
                  </Tag>
                )}
                
                {filters.expiringOnly && (
                  <Tag size="md" borderRadius="full" colorScheme="red" variant="subtle">
                    Expiring soon (7 days)
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ expiringOnly: false })} />
                  </Tag>
                )}
              </HStack>
              
              <Button 
                size="xs" 
                colorScheme="red" 
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
          </motion.div>
        )}
        
        {/* Action buttons for batch operations */}
        {hasSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box 
              mb={4} 
              p={3} 
              borderRadius="md" 
              bg="gray.50"
              boxShadow="sm"
            >
              <Flex 
                justify="space-between" 
                align="center"
              >
                <Text>
                  <strong>{selectedItems.length}</strong> items selected
                </Text>
                <HStack>
                  <Button
                    leftIcon={<FiRotateCcw />}
                    colorScheme="green"
                    size="sm"
                    onClick={handleBatchRestore}
                  >
                    Restore
                  </Button>
                  <Button
                    leftIcon={<FiTrash />}
                    colorScheme="red"
                    size="sm"
                    onClick={onDeleteOpen}
                  >
                    Delete Permanently
                  </Button>
                </HStack>
              </Flex>
            </Box>
          </motion.div>
        )}
        
        {/* Main content */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            <TrashTable 
              items={currentItems}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalItems: paginationInfo.totalItems,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedItems={selectedItems}
              isAllSelected={isAllSelected}
              onItemSelect={toggleItemSelection}
              onSelectAll={selectAllItems}
              onChangePage={changePage}
              onItemAction={handleItemAction}
              emptyStateProps={{
                title: 'Trash is Empty',
                description: 'No items in trash match your current filters.',
                icon: FiTrash2,
                actionButton: (
                  <Button colorScheme="teal" onClick={resetFilters}>
                    Reset Filters
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
        title="Trash Filters"
      >
        <FormControl mb={4}>
          <FormLabel>Role</FormLabel>
          <Select
            placeholder="Select role"
            value={filters.role}
            onChange={(e) => updateFilters({ role: e.target.value })}
          >
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.ORGANIZER}>Organizer</option>
            <option value={UserRole.EXHIBITOR}>Exhibitor</option>
          </Select>
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Deleted From</FormLabel>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilters({ startDate: e.target.value })}
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Deleted To</FormLabel>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilters({ endDate: e.target.value })}
          />
        </FormControl>
        
        <FormControl mb={4} display="flex" alignItems="center">
          <Checkbox
            id="expiringOnly"
            isChecked={filters.expiringOnly}
            onChange={(e) => updateFilters({ expiringOnly: e.target.checked })}
            colorScheme="red"
          />
          <FormLabel htmlFor="expiringOnly" mb="0" ml="2">
            Show only items expiring soon (7 days)
          </FormLabel>
        </FormControl>
      </FilterModal>
      
      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRestoreOpen}
        onClose={onRestoreClose}
        title="Restore Item"
        body={`Are you sure you want to restore ${selectedItem ? selectedItem.username : selectedItems.length + ' item(s)'}?`}
        confirmText="Restore"
        confirmColorScheme="green"
        onConfirm={selectedItem ? handleRestoreItem : handleBatchRestore}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Delete Permanently"
        body={
          <Box>
            <Flex align="center" color="red.500" mb={4}>
              <Icon as={FiAlertCircle} mr={2} />
              <Text fontWeight="semibold">This action cannot be undone.</Text>
            </Flex>
            <Text>
              Are you sure you want to permanently delete {selectedItem ? 'this item' : selectedItems.length + ' item(s)'}?
            </Text>
          </Box>
        }
        confirmText="Delete Permanently"
        confirmColorScheme="red"
        onConfirm={selectedItem ? handlePermanentDelete : handleBatchPermanentDelete}
      />
    </DashboardLayout>
  );
};

export default TrashPage;