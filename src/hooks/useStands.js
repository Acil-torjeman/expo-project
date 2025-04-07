import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import standService from '../services/stand.service';

const useStands = (initialFilters = {}, planId = null) => {
  // State
  const [stands, setStands] = useState([]);
  const [filteredStands, setFilteredStands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    ...initialFilters
  });
  const [selectedStands, setSelectedStands] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12 // Changed to 12 for better grid layout
  });
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch stands list
  const fetchStands = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      // If planId is provided, fetch stands for this specific plan
      if (planId) {
        data = await standService.getStandsByPlan(planId);
      } else {
        // Otherwise, fetch all stands without server-side filtering
        data = await standService.getStands();
      }
      
      setStands(data);
      
      // Apply client-side filtering
      applyFilters(data);
      
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch stands');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch stands',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, planId, toast]);
  
  // Apply filters to the data
  const applyFilters = useCallback((data) => {
    // Start with all data
    let result = [...data];
    
    // Filter by search if provided
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        (item.number && item.number.toLowerCase().includes(searchLower)) || 
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by type if provided
    if (filters.type && filters.type !== '') {
      result = result.filter(item => item.type === filters.type);
    }
    
    // Filter by status if provided
    if (filters.status && filters.status !== '') {
      result = result.filter(item => item.status === filters.status);
    }
    
    // Update filtered data
    setFilteredStands(result);
    
    // Update pagination information
    setPaginationInfo(prev => ({
      ...prev,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage) || 1,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [filters]);
  
  // Apply filters when filters or stands change
  useEffect(() => {
    if (stands.length) {
      applyFilters(stands);
    }
  }, [filters, stands, applyFilters]);
  
  // Load data when user or planId changes
  useEffect(() => {
    if (user && user.id) {
      fetchStands();
    }
  }, [fetchStands, user, planId]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      status: '',
    });
  }, []);
  
  // Create new stand
  const createStand = useCallback(async (standData) => {
    setLoading(true);
    
    try {
      // If planId is provided and not in standData, add it
      if (planId && !standData.plan) {
        standData.plan = planId;
      }
      
      // Remove status property - backend will set default value
      const dataToSend = { ...standData };
      if ('status' in dataToSend) {
        delete dataToSend.status;
      }
      
      const newStand = await standService.createStand(dataToSend);
      
      toast({
        title: 'Success',
        description: 'Stand created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchStands();
      return newStand;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create stand',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStands, planId, toast]);

  // Update stand
  const updateStand = useCallback(async (id, standData) => {
    setLoading(true);
    try {
      const updatedStand = await standService.updateStand(id, standData);
      
      toast({
        title: 'Success',
        description: 'Stand updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchStands();
      return updatedStand;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update stand',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStands, toast]);
  
  // Update stand status
  const updateStandStatus = useCallback(async (id, status, reason = '') => {
    setLoading(true);
    try {
      const updatedStand = await standService.updateStandStatus(id, status, reason);
      
      toast({
        title: 'Success',
        description: `Stand status updated to ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchStands();
      return updatedStand;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update stand status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStands, toast]);
  
  // Delete stand
  const deleteStand = useCallback(async (id) => {
    setLoading(true);
    try {
      await standService.deleteStand(id);
      
      toast({
        title: 'Success',
        description: 'Stand deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchStands();
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete stand',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStands, toast]);
  
  // Toggle stand selection
  const toggleStandSelection = useCallback((standId) => {
    setSelectedStands(prev => {
      if (prev.includes(standId)) {
        return prev.filter(id => id !== standId);
      } else {
        return [...prev, standId];
      }
    });
  }, []);
  
  // Select all stands
  const selectAllStands = useCallback((selected) => {
    if (selected) {
      const allIds = filteredStands.map(item => item._id);
      setSelectedStands(allIds);
    } else {
      setSelectedStands([]);
    }
  }, [filteredStands]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredStands.slice(startIndex, endIndex);
  }, [filteredStands, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'type') return value !== '';
      if (key === 'status') return value !== '';
      return false; // Ignore other properties
    }).length;
  }, [filters]);
  
  return {
    // State
    stands: filteredStands, // Return filtered stands instead of all stands
    loading,
    error,
    filters,
    selectedStands,
    paginationInfo,
    
    // Methods
    fetchStands,
    updateFilters,
    resetFilters,
    createStand,
    updateStand,
    updateStandStatus,
    deleteStand,
    toggleStandSelection,
    selectAllStands,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: filteredStands.length > 0 && selectedStands.length === filteredStands.length,
    hasSelected: selectedStands.length > 0
  };
};

export default useStands;