// src/hooks/usePlans.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import planService from '../services/plan.service';

const usePlans = (initialFilters = {}) => {
  // State
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    startDate: '',
    endDate: '',
    ...initialFilters
  });
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch plans list for current organizer
  const fetchPlans = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch plans for the current organizer
      const data = await planService.getOrganizerPlans(user.id);
      
      // Filter plans based on current filters
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.name && item.name.toLowerCase().includes(searchLower)) || 
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.isActive !== '') {
        const isActiveBool = filters.isActive === 'true';
        filteredData = filteredData.filter(item => item.isActive === isActiveBool);
      }
      
      // Apply date filters if they exist
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        filteredData = filteredData.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= startDate;
        });
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt <= endDate;
        });
      }
      
      setPlans(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage) || 1
      }));
      
      return filteredData;
    } catch (err) {
      setError(err.message || 'Failed to fetch plans');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch plans',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, filters, toast]);
  
  // Load data when filters or user changes
  useEffect(() => {
    if (user && user.id) {
      fetchPlans();
    }
  }, [fetchPlans, user]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      isActive: '',
      startDate: '',
      endDate: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Create new plan
  const createPlan = useCallback(async (planData, pdfFile) => {
    setLoading(true);
    
    try {
      // Validate PDF file
      if (!pdfFile) {
        toast({
          title: 'Error',
          description: 'PDF file is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        throw new Error('PDF file is required');
      }
      
      // Prepare the data - remove isActive for new plan creation
      const planDataToSend = { ...planData };
      delete planDataToSend.isActive; // Remove isActive as it will be set by the backend
      
      // Create the plan with PDF
      const newPlan = await planService.createPlan(planDataToSend, pdfFile);
      
      toast({
        title: 'Success',
        description: 'Plan created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchPlans();
      return newPlan;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPlans, toast]);

  // Update plan
  const updatePlan = useCallback(async (id, planData, pdfFile = null) => {
    setLoading(true);
    try {
      // Update the plan with optional PDF
      const updatedPlan = await planService.updatePlan(id, planData, pdfFile);
      
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchPlans();
      return updatedPlan;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPlans, toast]);
  
  // Delete plan
  const deletePlan = useCallback(async (id) => {
    setLoading(true);
    try {
      await planService.deletePlan(id);
      
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchPlans();
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPlans, toast]);
  
  // Toggle plan selection
  const togglePlanSelection = useCallback((planId) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      } else {
        return [...prev, planId];
      }
    });
  }, []);
  
  // Select all plans
  const selectAllPlans = useCallback((selected) => {
    if (selected) {
      const allIds = plans.map(item => item._id);
      setSelectedPlans(allIds);
    } else {
      setSelectedPlans([]);
    }
  }, [plans]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return plans.slice(startIndex, endIndex);
  }, [plans, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'isActive') return value !== '';
      if (key === 'startDate') return value !== '';
      if (key === 'endDate') return value !== '';
      return value !== '';
    }).length;
  }, [filters]);
  
  // Get PDF URL
  const getPlanPdfUrl = useCallback((pdfPath) => {
    return planService.getPlanPdfUrl(pdfPath);
  }, []);
  
  return {
    // State
    plans,
    loading,
    error,
    filters,
    selectedPlans,
    paginationInfo,
    
    // Methods
    fetchPlans,
    updateFilters,
    resetFilters,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanSelection,
    selectAllPlans,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    getPlanPdfUrl,
    
    // Utility
    isAllSelected: plans.length > 0 && selectedPlans.length === plans.length,
    hasSelected: selectedPlans.length > 0
  };
};

export default usePlans;