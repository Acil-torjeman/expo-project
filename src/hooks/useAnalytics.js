﻿// src/hooks/useAnalytics.js 
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
    period: 'month'
  });

  const toast = useToast();
  const { user } = useAuth();

  // Fetch events for the filter dropdown
  const fetchEvents = useCallback(async () => {
    try {
      if (!user?.id) return;
      console.log('Fetching events for user:', user.id);

      // Get events for the current organizer
      const response = await api.get(`/events/organizer/${user.id}`);
      console.log('Events response:', response.data ? `Found ${response.data.length} events` : 'No events found');

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data || []);
      } else {
        console.warn('Events response is not an array:', response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error.response?.data || error.message);
      setEvents([]);
    }
  }, [user]);

     const fetchParticipantsByEvent = useCallback(async () => {
  try {
    console.log('Fetching participants by event...');
    const response = await api.get('/analytics/participants-by-event');
    console.log('Participants data:', response.data);
    setAnalyticsData(prev => ({
      ...prev,
      participantsByEvent: response.data
    }));
  } catch (error) {
    console.error('Error fetching participants by event:', error);
  }
}, []);   
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
      console.log('Current user:', user);

      const response = await api.get(endpoint);
      console.log('Analytics API response status:', response.status);

      if (response.data) {
        console.log('Analytics data received:', response.data);

        // Check if received data has the expected structure for new KPIs
        if (!response.data.kpis) {
          console.warn('Received data missing KPIs structure');
          setError('Incomplete data received from server');
        } else {
          // Validate that we have the new KPIs
          const requiredKpis = ['processingTime', 'paymentTime', 'pendingRequests', 'equipmentReserved', 'totalRevenue'];
          const hasRequiredKpis = requiredKpis.every(kpi => response.data.kpis[kpi] !== undefined);
          
          if (!hasRequiredKpis) {
            console.warn('Missing required KPIs in response:', response.data.kpis);
          }
          
          setAnalyticsData(response.data);
        }
      } else {
        console.warn('Received empty or invalid analytics data');
        setError('Received empty data from server');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      console.error('Response details:', error.response?.data);

      // Handle specific errors
      if (error.response?.status === 404) {
        setError('No organizer profile found for your account');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view analytics');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch analytics data';
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
    fetchParticipantsByEvent();
  }, [fetchAnalytics, fetchParticipantsByEvent, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    console.log('Updating filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    loading,
    error,
    analyticsData,
    events,
    filters,
    updateFilters,
    refreshData: fetchAnalytics,
    participantsByEvent: analyticsData?.participantsByEvent || { labels: [], data: [], total: 0 },
    fetchParticipantsByEvent
  };
};

export default useAnalytics;