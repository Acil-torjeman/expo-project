// src/hooks/useInvoices.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import invoiceService from '../services/invoice.service';

const useInvoices = (initialFilters = {}) => {
  // State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    event: '',
    startDate: '',
    endDate: '',
    ...initialFilters
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  const toast = useToast();
  
  // Fetch invoices list
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching invoices from hook...');
      const data = await invoiceService.getMyInvoices();
      console.log('Raw invoices data:', data);
      
      // Check if data is valid array
      if (!Array.isArray(data)) {
        console.error('Invalid invoices data received:', data);
        setError('Received invalid data format from server');
        setInvoices([]);
        setLoading(false);
        return [];
      }
      
      // Filter invoices based on current filters
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchLower)) || 
          (item.event?.name && item.event.name.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }
      
      if (filters.event) {
        filteredData = filteredData.filter(item => 
          item.event && (
            (typeof item.event === 'object' && item.event._id === filters.event) ||
            (typeof item.event === 'string' && item.event === filters.event)
          )
        );
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
      
      // Sort invoices by date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setInvoices(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage) || 1
      }));
      
      return filteredData;
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch invoices',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);
  
  // Load data when filters change
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  
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
      status: '',
      event: '',
      startDate: '',
      endDate: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Toggle invoice selection
  const toggleInvoiceSelection = useCallback((invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  }, []);
  
  // Select all invoices
  const selectAllInvoices = useCallback((selected) => {
    if (selected) {
      const allIds = invoices.map(item => item._id);
      setSelectedInvoices(allIds);
    } else {
      setSelectedInvoices([]);
    }
  }, [invoices]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return invoices.slice(startIndex, endIndex);
  }, [invoices, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'status') return value !== '';
      if (key === 'event') return value !== '';
      if (key === 'startDate') return value !== '';
      if (key === 'endDate') return value !== '';
      return false;
    }).length;
  }, [filters]);
  
  return {
    // State
    invoices,
    loading,
    error,
    filters,
    selectedInvoices,
    paginationInfo,
    
    // Methods
    fetchInvoices,
    updateFilters,
    resetFilters,
    toggleInvoiceSelection,
    selectAllInvoices,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: invoices.length > 0 && selectedInvoices.length === invoices.length,
    hasSelected: selectedInvoices.length > 0
  };
};

export default useInvoices;