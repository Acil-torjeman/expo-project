// src/hooks/useTrash.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import adminService from '../services/admin.service';

/**
 * Custom hook for managing deleted users in the trash section
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Trash state and methods
 */
const useTrash = (initialFilters = {}) => {
  // State
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    startDate: '',
    endDate: '',
    expiringOnly: false,
    ...initialFilters
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const toast = useToast();
  
  // Fetch trashed items with current filters
  const fetchTrashedItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getTrashedUsers(filters);
      
      // Apply client-side filter for expiring items if needed
      const filteredData = filters.expiringOnly 
        ? data.filter(item => item.daysRemaining <= 7) 
        : data;
      
      setTrashedItems(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage)
      }));
      
      return filteredData;
    } catch (err) {
      setError(err);
      toast({
        title: 'Error fetching trashed items',
        description: err.message || 'Failed to load trashed items. Please try again.',
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
    fetchTrashedItems();
  }, [fetchTrashedItems]);
  
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
      role: '',
      startDate: '',
      endDate: '',
      expiringOnly: false
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Pagination
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Select/deselect items
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);
  
  const selectAllItems = useCallback((selected) => {
    if (selected) {
      const allItemIds = trashedItems.map(item => item._id);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  }, [trashedItems]);
  
  // Restore item from trash
  const restoreItem = useCallback(async (itemId) => {
    try {
      await adminService.restoreUser(itemId);
      
      // Update local state
      setTrashedItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      
      toast({
        title: 'Item restored',
        description: 'The item has been restored successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error restoring item',
        description: err.message || 'Failed to restore item. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Restore multiple items
  const batchRestoreItems = useCallback(async (itemIds) => {
    try {
      // Use batch endpoint if available, otherwise sequential restoration
      await adminService.batchRestoreUsers(itemIds);
      
      // Update local state
      setTrashedItems(prev => prev.filter(item => !itemIds.includes(item._id)));
      setSelectedItems([]);
      
      toast({
        title: 'Items restored',
        description: `${itemIds.length} items have been restored successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error restoring items',
        description: err.message || 'Failed to restore items. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Permanently delete an item
  const permanentlyDeleteItem = useCallback(async (itemId) => {
    try {
      await adminService.permanentlyDeleteUser(itemId);
      
      // Update local state
      setTrashedItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      
      toast({
        title: 'Item permanently deleted',
        description: 'The item has been permanently deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error deleting item',
        description: err.message || 'Failed to delete item permanently. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Permanently delete multiple items
  const batchPermanentlyDeleteItems = useCallback(async (itemIds) => {
    try {
      // Use batch endpoint if available, otherwise sequential deletion
      await adminService.batchPermanentlyDeleteUsers(itemIds);
      
      // Update local state
      setTrashedItems(prev => prev.filter(item => !itemIds.includes(item._id)));
      setSelectedItems([]);
      
      toast({
        title: 'Items permanently deleted',
        description: `${itemIds.length} items have been permanently deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error deleting items',
        description: err.message || 'Failed to delete items permanently. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);
  
  // Get current page data with pagination
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return trashedItems.slice(startIndex, endIndex);
  }, [trashedItems, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'expiringOnly') return value === true;
      return value !== '';
    }).length;
  }, [filters]);
  
  return {
    // State
    trashedItems,
    loading,
    error,
    filters,
    selectedItems,
    paginationInfo,
    
    // Methods
    fetchTrashedItems,
    updateFilters,
    resetFilters,
    changePage,
    toggleItemSelection,
    selectAllItems,
    restoreItem,
    batchRestoreItems,
    permanentlyDeleteItem,
    batchPermanentlyDeleteItems,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: trashedItems.length > 0 && selectedItems.length === trashedItems.length,
    hasSelected: selectedItems.length > 0
  };
};

export default useTrash;