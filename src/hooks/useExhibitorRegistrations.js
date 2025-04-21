// src/hooks/useExhibitorRegistrations.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import registrationService from '../services/registration.service';
import eventService from '../services/event.service';

const useExhibitorRegistrations = () => {
  // State
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState(null);
  
  const toast = useToast();
  const { user } = useAuth();
  
  // Fetch registrations for the logged-in exhibitor
  const fetchRegistrations = useCallback(async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use backend API to get exhibitor's registrations
      const data = await registrationService.getMyRegistrations();
      
      // Process data to ensure it has all needed properties
      const processedData = await Promise.all(data.map(async (registration) => {
        // If event is only an ID reference, fetch full event data
        if (registration.event && typeof registration.event !== 'object') {
          try {
            const eventData = await eventService.getEventById(registration.event);
            registration.event = eventData;
          } catch (err) {
            console.error(`Failed to fetch event for registration ${registration._id}:`, err);
          }
        }
        
        return registration;
      }));
      
      setRegistrations(processedData);
      return processedData;
    } catch (err) {
      setError(err.message || 'Failed to fetch registrations');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch your registrations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  // Load data when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchRegistrations();
    }
  }, [fetchRegistrations, user]);
  
  // Get a specific registration by ID
  const getRegistrationById = useCallback(async (id) => {
    setLoading(true);
    try {
      const registration = await registrationService.getRegistrationById(id);
      return registration;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || `Failed to fetch registration ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Select stands for a registration
  const selectStands = useCallback(async (registrationId, standData) => {
    setLoading(true);
    try {
      const result = await registrationService.selectStands(registrationId, standData);
      toast({
        title: 'Stands Selected',
        description: 'Your stand selection has been saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchRegistrations(); // Refresh the list
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to select stands',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRegistrations, toast]);
  
  // Select equipment for a registration
  const selectEquipment = useCallback(async (registrationId, equipmentData) => {
    setLoading(true);
    try {
      const result = await registrationService.selectEquipment(registrationId, equipmentData);
      toast({
        title: 'Equipment Selected',
        description: 'Your equipment selection has been saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchRegistrations(); // Refresh the list
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to select equipment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRegistrations, toast]);
  
  // Cancel a registration
  const cancelRegistration = useCallback(async (registrationId) => {
    setLoading(true);
    try {
      const result = await registrationService.cancelRegistration(registrationId);
      toast({
        title: 'Registration Cancelled',
        description: 'Your registration has been cancelled successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchRegistrations(); // Refresh the list
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRegistrations, toast]);
  
  return {
    registrations,
    loading,
    error,
    selectedRegistrationId,
    setSelectedRegistrationId,
    fetchRegistrations,
    getRegistrationById,
    selectStands,
    selectEquipment,
    cancelRegistration
  };
};

export default useExhibitorRegistrations;