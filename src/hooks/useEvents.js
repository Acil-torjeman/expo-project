// src/hooks/useEvents.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/event.service';
import equipmentService from '../services/equipment.service';

const useEvents = (initialFilters = {}) => {
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    upcoming: false,
    startDate: '',
    endDate: '',
    ...initialFilters
  });
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch events list for current organizer
  const fetchEvents = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch events for the current organizer
      const data = await eventService.getOrganizerEvents(user.id);
      
      // Filter events based on current filters
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.name && item.name.toLowerCase().includes(searchLower)) || 
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.location && item.location.city && item.location.city.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }
      
      // Filter upcoming events
      if (filters.upcoming) {
        const now = new Date();
        filteredData = filteredData.filter(item => new Date(item.startDate) >= now);
      }
      
      // Apply date filters if they exist
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        filteredData = filteredData.filter(item => {
          const eventDate = new Date(item.startDate);
          return eventDate >= startDate;
        });
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(item => {
          const eventDate = new Date(item.startDate);
          return eventDate <= endDate;
        });
      }
      
      setEvents(filteredData);
      
      // Update pagination info
      setPaginationInfo(prev => ({
        ...prev,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / prev.itemsPerPage) || 1
      }));
      
      return filteredData;
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
  }, [user, filters, toast]);
  
  // Load data when filters or user changes
  useEffect(() => {
    if (user && user.id) {
      fetchEvents();
    }
  }, [fetchEvents, user]);
  
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
      upcoming: false,
      startDate: '',
      endDate: '',
    });
    setPaginationInfo(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // Create new event with image
  const createEvent = useCallback(async (eventData, imageFile = null) => {
    setLoading(true);
    
    try {
      // Create a copy of the form data without the equipment IDs
      // The backend will handle equipment association
      const eventDataToSend = { ...eventData };
      
      // First create the event
      const newEvent = await eventService.createEvent(eventDataToSend);
      
      // If image file is provided, upload it
      if (imageFile) {
        await eventService.uploadEventImage(newEvent._id, imageFile);
      }
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      return newEvent;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);

  // Update event
  const updateEvent = useCallback(async (id, eventData, imageFile = null) => {
    setLoading(true);
    try {
      // Update the event data
      const updatedEvent = await eventService.updateEvent(id, eventData);
      
      // If image file is provided, upload it
      if (imageFile) {
        await eventService.uploadEventImage(id, imageFile);
      }
      
      // Handle equipment associations
      if (eventData.equipmentIds !== undefined) {
        // Get current equipment for the event
        const currentEquipment = await equipmentService.getEventEquipment(id);
        const currentEquipmentIds = currentEquipment.map(item => item._id);
        
        // Find equipment to add and remove
        const equipmentToAdd = eventData.equipmentIds.filter(
          eqId => !currentEquipmentIds.includes(eqId)
        );
        
        const equipmentToRemove = currentEquipmentIds.filter(
          eqId => !eventData.equipmentIds.includes(eqId)
        );
        
        // Associate new equipment
        for (const equipmentId of equipmentToAdd) {
          await equipmentService.associateWithEvent(equipmentId, id);
        }
        
        // Dissociate removed equipment
        for (const equipmentId of equipmentToRemove) {
          await equipmentService.dissociateFromEvent(equipmentId, id);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Event updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      return updatedEvent;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);
  
  // Upload event image
  const uploadEventImage = useCallback(async (id, imageFile) => {
    setLoading(true);
    try {
      const updatedEvent = await eventService.uploadEventImage(id, imageFile);
      
      toast({
        title: 'Success',
        description: 'Event image uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      return updatedEvent;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to upload event image',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);
  
  // Delete event
  const deleteEvent = useCallback(async (id) => {
    setLoading(true);
    try {
      await eventService.deleteEvent(id);
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);
  
  // Associate plan with event
  const associatePlan = useCallback(async (eventId, planId) => {
    setLoading(true);
    try {
      const updatedEvent = await eventService.associatePlan(eventId, planId);
      
      toast({
        title: 'Success',
        description: 'Floor plan associated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      return updatedEvent;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to associate floor plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);
  
  // Dissociate plan from event
  const dissociatePlan = useCallback(async (eventId) => {
    setLoading(true);
    try {
      const updatedEvent = await eventService.dissociatePlan(eventId);
      
      toast({
        title: 'Success',
        description: 'Floor plan removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh the list
      await fetchEvents();
      return updatedEvent;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove floor plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast]);
  
  // Toggle event selection
  const toggleEventSelection = useCallback((eventId) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  }, []);
  
  // Select all events
  const selectAllEvents = useCallback((selected) => {
    if (selected) {
      const allIds = events.map(item => item._id);
      setSelectedEvents(allIds);
    } else {
      setSelectedEvents([]);
    }
  }, [events]);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
  }, []);
  
  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const { currentPage, itemsPerPage } = paginationInfo;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return events.slice(startIndex, endIndex);
  }, [events, paginationInfo]);
  
  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'status') return value !== '';
      if (key === 'upcoming') return value === true;
      if (key === 'startDate') return value !== '';
      if (key === 'endDate') return value !== '';
      return false;
    }).length;
  }, [filters]);
  
  return {
    // State
    events,
    loading,
    error,
    filters,
    selectedEvents,
    paginationInfo,
    
    // Methods
    fetchEvents,
    updateFilters,
    resetFilters,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadEventImage,
    associatePlan,
    dissociatePlan,
    toggleEventSelection,
    selectAllEvents,
    changePage,
    getCurrentPageData,
    getActiveFiltersCount,
    
    // Utility
    isAllSelected: events.length > 0 && selectedEvents.length === events.length,
    hasSelected: selectedEvents.length > 0
  };
};

export default useEvents;