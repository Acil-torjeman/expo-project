// src/pages/admin/Accounts.jsx
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
  Select,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiUsers,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import UserTable from '../../components/admin/users/UserTable';
import FilterModal from '../../components/common/ui/FilterModal';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import { motion } from 'framer-motion';
import useUsers from '../../hooks/useUsers';
import { UserRole, UserStatus } from "../../constants/roles";

/**
 * Admin Accounts Management page
 */
const AccountsPage = () => {
  // Use the custom hook
  const {
    users,
    loading,
    error,
    filters,
    selectedUsers,
    paginationInfo,
    updateFilters,
    resetFilters,
    fetchUsers,
    toggleUserSelection,
    selectAllUsers,
    changePage,
    moveToTrash,
    batchMoveToTrash,
    updateStatus,
    getCurrentPageData,
    getActiveFiltersCount,
    isAllSelected,
    hasSelected,
  } = useUsers();

  // Local state
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Manage modals with Chakra's useDisclosure
  const { 
    isOpen: isFilterOpen, 
    onOpen: onFilterOpen, 
    onClose: onFilterClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  // Handle user actions
  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    
    switch (action) {
      case 'view':
        // Navigate to user details page or open details modal
        console.log('View user:', user);
        break;
      case 'edit':
        // Open edit modal
        console.log('Edit user:', user);
        break;
      case 'delete':
        // Open delete confirmation
        onDeleteOpen();
        break;
      case 'status':
        if (user.newStatus) {
          updateStatus(user._id, user.newStatus);
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const success = await moveToTrash(selectedUser._id);
    
    if (success) {
      onDeleteClose();
      setSelectedUser(null);
    }
  };
  
  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    await batchMoveToTrash(selectedUsers);
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
  const currentUsers = getCurrentPageData();
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <DashboardLayout title="Accounts Management">
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
              Accounts Management
            </Heading>
            <Text color="gray.500">
              Manage all user accounts in the system
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
              onClick={fetchUsers}
            >
              Refresh
            </Button>
            
            {hasSelected && (
              <Button
                colorScheme="red"
                onClick={handleBatchDelete}
              >
                Move Selected to Trash
              </Button>
            )}
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by username or email ..."
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
                
                {filters.status && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {filters.status}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ status: '' })} />
                  </Tag>
                )}
                
                {filters.role && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Role: {filters.role}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ role: '' })} />
                  </Tag>
                )}
                
                {(filters.startDate || filters.endDate) && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Date range
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ startDate: '', endDate: '' })} />
                  </Tag>
                )}
                
                {filters.includeDeleted && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Include deleted
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ includeDeleted: false })} />
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
          </motion.div>
        )}
        
        {/* Main content */}
        <Card variant="outline" shadow="sm">
          <CardBody p={0}>
            {/* User Table */}
            <UserTable 
              users={currentUsers}
              loading={loading}
              pagination={{
                currentPage: paginationInfo.currentPage,
                totalPages: paginationInfo.totalPages,
                totalUsers: paginationInfo.totalUsers,
                itemsPerPage: paginationInfo.itemsPerPage,
              }}
              selectedUsers={selectedUsers}
              isAllSelected={isAllSelected}
              onUserSelect={toggleUserSelection}
              onSelectAll={selectAllUsers}
              onChangePage={changePage}
              onUserAction={handleUserAction}
              emptyStateProps={{
                title: 'No Users Found',
                description: 'No users match your current filters.',
                icon: FiUsers,
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
      >
        <FormControl mb={4}>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value={UserStatus.ACTIVE}>Active</option>
            <option value={UserStatus.PENDING}>Pending</option>
            <option value={UserStatus.INACTIVE}>Inactive</option>
            <option value={UserStatus.REJECTED}>Rejected</option>
          </Select>
        </FormControl>
        
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
          <FormLabel>Created From</FormLabel>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilters({ startDate: e.target.value })}
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Created To</FormLabel>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilters({ endDate: e.target.value })}
          />
        </FormControl>
      </FilterModal>
      
      {/* Delete Confirmation Dialog */}
      {selectedUser && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          title="Move to Trash"
          body={`Are you sure you want to move ${selectedUser.username} to trash? The user will be kept in trash for 30 days before permanent deletion.`}
          confirmText="Move to Trash"
          confirmColorScheme="red"
          onConfirm={handleDeleteUser}
        />
      )}
    </DashboardLayout>
  );
};

export default AccountsPage;