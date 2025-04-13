// src/hooks/useExhibitorEvents.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import eventService from '../services/event.service';

const useExhibitorEvents = (initialFilters = {}) => {
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    upcoming: true, // Default to show only upcoming events
    ...initialFilters
  });
  
  const toast = useToast();
  
  // Fetch all public events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get public events that match the filters
      const data = await eventService.getPublicEvents(
        filters.search,
        filters.sector,
        filters.upcoming
      );
      
      setEvents(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch events',
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
    fetchEvents();
  }, [fetchEvents]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      sector: '',
      upcoming: true,
    });
  }, []);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'sector') return value !== '';
      if (key === 'upcoming') return value === false; // Default is true
      return false;
    }).length;
  }, [filters]);
  
  return {
    events,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    fetchEvents,
    getActiveFiltersCount,
  };
};

export default useExhibitorEvents;