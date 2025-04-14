// src/hooks/useRegistrations.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import registrationService from '../services/registration.service';
import eventService from '../services/event.service';

const useRegistrations = (initialFilters = {}) => {
  // State
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    event: '',
    status: '',
    startDate: '',
    endDate: '',
    ...initialFilters
  });
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch organizer's events first
  const fetchEvents = useCallback(async () => {
    if (!user || !user.id) return [];
    
    try {
      const data = await eventService.getEventsByOrganizer(user.id);
      setEvents(data);
      return data;
    } catch (err) {
      console.error('Error fetching events:', err);
      return [];
    }
  }, [user]);
  
  // Fetch registrations for the organizer
  const fetchRegistrations = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First ensure we have the events
      const userEvents = events.length ? events : await fetchEvents();
      
      // If no events, return empty array
      if (!userEvents.length) {
        setRegistrations([]);
        setPaginationInfo(prev => ({
          ...prev,
          totalItems: 0,
          totalPages: 1
        }));
        setLoading(false);
        return [];
      }
      
      // Fetch registrations for the specified event or all events
      let allRegistrations = [];
      
      if (filters.event) {
        // Fetch for specific event
        const eventRegs = await registrationService.findByEvent(filters.event);
        allRegistrations = eventRegs;
      } else {
        // Fetch for all events
        for (const event of userEvents) {
          try {
            // Use findByEvent method that we added to the service
            const eventRegs = await registrationService.findByEvent(event._id);
            // Add event data to each registration for easier filtering
            const registrationsWithEvent = eventRegs.map(reg => ({
              ...reg,
              eventName: event.name,
              eventId: event._id
            }));
            allRegistrations = [...allRegistrations, ...registrationsWithEvent];
          } catch (error) {
            console.error(`Error fetching registrations for event ${event._id}:`, error);
          }
        }
      }
      
      // Apply filters
      let filteredRegistrations = [...allRegistrations];
      
      // Filter by search term
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRegistrations = filteredRegistrations.filter(item => {
          const exhibitor = item.exhibitor;
          const company = exhibitor?.company;
          
          return (
            (exhibitor?.user?.username && exhibitor.user.username.toLowerCase().includes(searchLower)) ||
            (exhibitor?.user?.email && exhibitor.user.email.toLowerCase().includes(searchLower)) ||
            (company?.companyName && company.companyName.toLowerCase().includes(searchLower)) ||
            (item.eventName && item.eventName.toLowerCase().includes(searchLower))
          );
        });
      }
      
      // Filter by status
      if (filters.status) {
        filteredRegistrations = filteredRegistrations.filter(item => 
          item.status === filters.status
        );
      }
      
      // Filter by date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        filteredRegistrations = filteredRegistrations.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= startDate;
        });
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredRegistrations = filteredRegistrations.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt <= endDate;
        });
      }
      
      // Sort registrations by created date (newest first)
      filteredRegistrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRegistrations(filteredRegistrations);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredRegistrations.length,
        totalPages: Math.ceil(filteredRegistrations.length / prev.itemsPerPage) || 1
      }));
      
      return filteredRegistrations;
    } catch (err) {
      setError(err.message || 'Failed to fetch registrations');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch registrations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, events, filters, fetchEvents, toast]);
  
  // Load data when filters or user changes
  useEffect(() => {
    if (user && user.id) {
      fetchRegistrations();
    }
  }, [fetchRegistrations, user]);
  
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
      event: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Review registration (approve or reject)
  const reviewRegistration = useCallback(async (registrationId, reviewData) => {
    setLoading(true);
    
    try {
      const response = await registrationService.reviewRegistration(registrationId, reviewData);
      
      toast({
        title: 'Success',
        description: `Registration ${reviewData.status} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchRegistrations();
      return response;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${reviewData.status} registration`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRegistrations, toast]);
  
  // Toggle registration selection
  const toggleRegistrationSelection = useCallback((registrationId) => {
    setSelectedRegistrations(prev => {
      if (prev.includes(registrationId)) {
        return prev.filter(id => id !== registrationId);
      } else {
        return [...prev, registrationId];
      }
    });
  }, []);
  
  // Select all registrations
  const selectAllRegistrations = useCallback((selected) => {
    if (selected) {
      const allIds = registrations.map(item => item._id);
      setSelectedRegistrations(allIds);
    } else {
      setSelectedRegistrations([]);
    }
  }, [registrations]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return registrations.slice(startIndex, endIndex);
  }, [registrations, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'event') return value !== '';
      if (key === 'status') return value !== '';
      if (key === 'startDate') return value !== '';
      if (key === 'endDate') return value !== '';
      return false;
    }).length;
  }, [filters]);
  
  return {
    // State
    registrations,
    events,
    loading,
    error,
    filters,
    selectedRegistrations,
    paginationInfo,
    
    // Methods
    fetchRegistrations,
    fetchEvents,
    updateFilters,
    resetFilters,
    reviewRegistration,
    toggleRegistrationSelection,
    selectAllRegistrations,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: registrations.length > 0 && selectedRegistrations.length === registrations.length,
    hasSelected: selectedRegistrations.length > 0
  };
};

export default useRegistrations;