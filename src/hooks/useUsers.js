// src/hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import adminService from '../services/admin.service';

/**
 * Custom hook for managing users in the admin section
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Users state and methods
 */
const useUsers = (initialFilters = {}) => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    startDate: '',
    endDate: '',
    includeDeleted: false,
    ...initialFilters
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    itemsPerPage: 10
  });
  
  const toast = useToast();
  
  // Fetch users with current filters
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getUsers(filters);
      setUsers(data);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalUsers: data.length,
        totalPages: Math.ceil(data.length / prev.itemsPerPage)
      }));
      
      return data;
    } catch (err) {
      setError(err);
      toast({
        title: 'Error fetching users',
        description: err.message || 'Failed to load users. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);
  
  // Initialize data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Update filters and refetch
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
      role: '',
      startDate: '',
      endDate: '',
      includeDeleted: false
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Pagination
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Select/deselect users
  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);
  
  const selectAllUsers = useCallback((selected) => {
    if (selected) {
      const allUserIds = users.map(user => user._id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  }, [users]);
  
  // Move user to trash
  const moveToTrash = useCallback(async (userId) => {
    try {
      await adminService.moveUserToTrash(userId);
      
      // Update local state
      setUsers(prev => prev.filter(user => user._id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      
      toast({
        title: 'User moved to trash',
        description: 'The user has been moved to trash and will be deleted in 30 days.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error moving user to trash',
        description: err.message || 'Failed to move user to trash. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Move multiple users to trash
  const batchMoveToTrash = useCallback(async (userIds) => {
    try {
      await adminService.batchMoveToTrash(userIds);
      
      // Update local state
      setUsers(prev => prev.filter(user => !userIds.includes(user._id)));
      setSelectedUsers([]);
      
      toast({
        title: 'Users moved to trash',
        description: `${userIds.length} users have been moved to trash.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error moving users to trash',
        description: err.message || 'Failed to move users to trash. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Update user status
  const updateStatus = useCallback(async (userId, newStatus) => {
    try {
      const updatedUser = await adminService.updateUserStatus(userId, newStatus);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: 'Status updated',
        description: `User status changed to ${newStatus}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return updatedUser;
    } catch (err) {
      toast({
        title: 'Error updating status',
        description: err.message || 'Failed to update user status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);
  
  // Get current page data with pagination
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return users.slice(startIndex, endIndex);
  }, [users, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'includeDeleted') return value === true;
      return value !== '';
    }).length;
  }, [filters]);
  
  return {
    // State
    users,
    loading,
    error,
    filters,
    selectedUsers,
    paginationInfo,
    
    // Methods
    fetchUsers,
    updateFilters,
    resetFilters,
    changePage,
    toggleUserSelection,
    selectAllUsers,
    moveToTrash,
    batchMoveToTrash,
    updateStatus,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: users.length > 0 && selectedUsers.length === users.length,
    hasSelected: selectedUsers.length > 0
  };
};

export default useUsers;