// src/hooks/useEquipment.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import equipmentService from '../services/equipment.service';

const useEquipment = (initialFilters = {}) => {
  // State
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isAvailable: '',
    ...initialFilters
  });
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch equipment list for current organizer
  const fetchEquipment = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch equipment for the current organizer
      const data = await equipmentService.getOrganizerEquipment(user.id);
      
      // Filter equipment based on current filters
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.name && item.name.toLowerCase().includes(searchLower)) || 
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.category) {
        filteredData = filteredData.filter(item => item.category === filters.category);
      }
      
      if (filters.isAvailable !== '') {
        const isAvailableBool = filters.isAvailable === 'true';
        filteredData = filteredData.filter(item => item.isAvailable === isAvailableBool);
      }
      
      setEquipment(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage) || 1
      }));
      
      return filteredData;
    } catch (err) {
      setError(err.message || 'Failed to fetch equipment');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch equipment',
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
      fetchEquipment();
    }
  }, [fetchEquipment, user]);
  
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
      category: '',
      isAvailable: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Create new equipment with optional image upload
  const createEquipment = useCallback(async (equipmentData, imageFile = null) => {
    setLoading(true);
    let newEquipment = null;
    
    try {
      // Prepare data for API
      const preparedData = { ...equipmentData };
      
      // Convert price to number
      if (typeof preparedData.price === 'string') {
        const normalizedPrice = preparedData.price.replace(',', '.');
        preparedData.price = parseFloat(normalizedPrice);
        
        if (!isNaN(preparedData.price)) {
          preparedData.price = parseFloat(preparedData.price.toFixed(3));
        }
      }
      
      // First create equipment without image
      newEquipment = await equipmentService.createEquipment(preparedData);
      
      // If there's an image, upload it
      if (imageFile) {
        try {
          await equipmentService.uploadEquipmentImage(newEquipment._id, imageFile);
          
          toast({
            title: 'Success',
            description: 'Equipment created with image successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } catch (uploadError) {
          toast({
            title: 'Partial Success',
            description: 'Equipment created but image upload failed. You can upload the image later by editing this equipment.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Success',
          description: 'Equipment created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Refresh the list
      await fetchEquipment();
      return newEquipment;
      
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create equipment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEquipment, toast]);

  // Update equipment
  const updateEquipment = useCallback(async (id, equipmentData, imageFile = null) => {
    setLoading(true);
    try {
      // Prepare data for API
      const preparedData = { ...equipmentData };
      
      // Convert price to number
      if (typeof preparedData.price === 'string') {
        const normalizedPrice = preparedData.price.replace(',', '.');
        preparedData.price = parseFloat(normalizedPrice);
        
        if (!isNaN(preparedData.price)) {
          preparedData.price = parseFloat(preparedData.price.toFixed(3));
        }
      }
      
      // Update equipment data
      const updatedEquipment = await equipmentService.updateEquipment(id, preparedData);
      
      // Upload image if provided
      if (imageFile) {
        try {
          await equipmentService.uploadEquipmentImage(id, imageFile);
        } catch (uploadError) {
          toast({
            title: 'Partial Success',
            description: 'Equipment updated but image upload failed',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      // Refresh the list
      await fetchEquipment();
      
      toast({
        title: 'Success',
        description: 'Equipment updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return updatedEquipment;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update equipment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEquipment, toast]);
  
  // Delete equipment
  const deleteEquipment = useCallback(async (id) => {
    setLoading(true);
    try {
      await equipmentService.deleteEquipment(id);
      
      toast({
        title: 'Success',
        description: 'Equipment deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEquipment();
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete equipment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchEquipment, toast]);
  
  // Toggle equipment selection
  const toggleEquipmentSelection = useCallback((equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  }, []);
  
  // Select all equipment
  const selectAllEquipment = useCallback((selected) => {
    if (selected) {
      const allIds = equipment.map(item => item._id);
      setSelectedEquipment(allIds);
    } else {
      setSelectedEquipment([]);
    }
  }, [equipment]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return equipment.slice(startIndex, endIndex);
  }, [equipment, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'isAvailable') return value !== '';
      return value !== '';
    }).length;
  }, [filters]);
  
  return {
    // State
    equipment,
    loading,
    error,
    filters,
    selectedEquipment,
    paginationInfo,
    
    // Methods
    fetchEquipment,
    updateFilters,
    resetFilters,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    toggleEquipmentSelection,
    selectAllEquipment,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: equipment.length > 0 && selectedEquipment.length === equipment.length,
    hasSelected: selectedEquipment.length > 0
  };
};

export default useEquipment;