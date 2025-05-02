// src/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    eventId: '',
    period: 'month' // Default to month
  });
  const toast = useToast();
  const { user } = useAuth();

  // Fetch events for the filter dropdown
  const fetchEvents = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Get events for the current organizer
      const response = await api.get(`/events/organizer/${user.id}`);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  }, [user]);

  // Fetch analytics data based on filters
  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.eventId) {
        queryParams.append('eventId', filters.eventId);
      }
      if (filters.period) {
        queryParams.append('period', filters.period);
      }
      
      const endpoint = filters.eventId 
        ? `/analytics/events/${filters.eventId}?${queryParams.toString()}`
        : `/analytics/dashboard?${queryParams.toString()}`;
      
      console.log(`Fetching analytics from: ${endpoint}`);
      const response = await api.get(endpoint);
      
      if (response.data) {
        console.log('Analytics data received:', response.data);
        
        // Check if received data has the expected structure
        if (!response.data.kpis) {
          console.warn('Received data missing KPIs structure');
          setError('Incomplete data received from server');
        } else {
          setAnalyticsData(response.data);
        }
      } else {
        console.warn('Received empty or invalid analytics data');
        setError('Received empty data from server');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Handle specific errors
      if (error.response?.status === 404) {
        setError('No organizer profile found for your account');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view analytics');
      } else {
        const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch analytics data';
        
        setError(errorMessage);
      }
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch analytics data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast, user]);

  // Effect to fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Effect to fetch analytics data when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    loading,
    error,
    analyticsData,
    events,
    filters,
    updateFilters,
    refreshData: fetchAnalytics
  };
};

export default useAnalytics;