// src/hooks/useRegistrationSelection.js
import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import registrationService from '../services/registration.service';
import eventService from '../services/event.service';
import equipmentService from '../services/equipment.service';

export default function useRegistrationSelection(registrationId) {
  // State for registration data
  const [registration, setRegistration] = useState(null);
  
  // State for stands
  const [availableStands, setAvailableStands] = useState([]);
  const [selectedStands, setSelectedStands] = useState([]);
  const [standSelectionComplete, setStandSelectionComplete] = useState(false);
  
  // State for equipment
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  
  // Fetch initial data
  useEffect(() => {
    fetchRegistrationData();
  }, [registrationId]);
  
  // Load selections from session storage
  useEffect(() => {
    loadSelections();
  }, []);
  
  // Fetch registration, stands, and equipment data
  const fetchRegistrationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
      
      // Set any already selected stands/equipment
      if (registrationData.stands && registrationData.stands.length > 0) {
        setSelectedStands(registrationData.stands.map(stand => 
          typeof stand === 'object' ? stand._id : stand
        ));
        setStandSelectionComplete(registrationData.standSelectionCompleted || false);
      }
      
      if (registrationData.equipment && registrationData.equipment.length > 0) {
        setSelectedEquipment(registrationData.equipment.map(item => 
          typeof item === 'object' ? item._id : item
        ));
      }
      
      // Get event ID
      const eventId = typeof registrationData.event === 'object' 
        ? registrationData.event._id 
        : registrationData.event;
      
      if (eventId) {
        // Fetch stands
        const eventDetails = await eventService.getEventById(eventId);
        
        if (!eventDetails.plan) {
          setError("This event doesn't have a floor plan assigned yet. Please contact the organizer.");
          setLoading(false);
          return;
        }
        
        // Get all stands for the event
        const standsData = await eventService.getStands(eventId);
        
        // Filter stands
        const userSelectedStandIds = selectedStands.length ? selectedStands : 
          (registrationData.stands?.map(stand => 
            typeof stand === 'object' ? stand._id : stand
          ) || []);
        
        const availableOrSelectedStands = standsData.filter(stand => 
          stand.status === 'available' || userSelectedStandIds.includes(stand._id)
        );
        
        setAvailableStands(availableOrSelectedStands);
        
        // Fetch equipment
        const equipmentData = await equipmentService.getEventEquipment(eventId);
        setAvailableEquipment(equipmentData);
      } else {
        setError("Registration doesn't have a valid event associated with it.");
      }
    } catch (error) {
      setError(error.message || 'Failed to load data. Please try again.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save selections to session storage
  const saveSelections = () => {
    sessionStorage.setItem(`standSelection_${registrationId}`, JSON.stringify(selectedStands));
    sessionStorage.setItem(`equipmentSelection_${registrationId}`, JSON.stringify(selectedEquipment));
  };
  
  // Load selections from session storage
  const loadSelections = () => {
    try {
      const savedStands = sessionStorage.getItem(`standSelection_${registrationId}`);
      if (savedStands) {
        const parsedStands = JSON.parse(savedStands);
        if (Array.isArray(parsedStands)) {
          setSelectedStands(parsedStands);
        }
      }
      
      const savedEquipment = sessionStorage.getItem(`equipmentSelection_${registrationId}`);
      if (savedEquipment) {
        const parsedEquipment = JSON.parse(savedEquipment);
        if (Array.isArray(parsedEquipment)) {
          setSelectedEquipment(parsedEquipment);
        }
      }
    } catch (e) {
      console.error("Error loading saved selections:", e);
    }
  };
  
  // Toggle stand selection
  const toggleStandSelection = (standId) => {
    setSelectedStands(prev => {
      if (prev.includes(standId)) {
        return prev.filter(id => id !== standId);
      } else {
        return [...prev, standId];
      }
    });
  };
  
  // Toggle equipment selection
  const toggleEquipmentSelection = (equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };
  
  // Move to next step
  const goToNextStep = () => {
    if (currentStep === 0) {
      // Validate stand selection before moving to equipment
      if (selectedStands.length === 0) {
        toast({
          title: 'No stands selected',
          description: 'Please select at least one stand before proceeding',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Save stand selection
      saveSelections();
      setStandSelectionComplete(true);
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  // Move to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  // Submit final selections
  const submitSelections = async () => {
    setIsSubmitting(true);
    
    try {
      // First submit stand selection
      await registrationService.selectStands(registrationId, {
        standIds: selectedStands,
        selectionCompleted: true
      });
      
      // Then submit equipment selection
      await registrationService.selectEquipment(registrationId, {
        equipmentIds: selectedEquipment,
        selectionCompleted: true
      });
      
      // Complete the registration
      await registrationService.completeRegistration(registrationId);
      
      // Clear session storage
      sessionStorage.removeItem(`standSelection_${registrationId}`);
      sessionStorage.removeItem(`equipmentSelection_${registrationId}`);
      
      toast({
        title: 'Registration Completed',
        description: 'Your registration has been successfully completed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit selections',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate totals
  const calculateStandsTotal = () => {
    return availableStands
      .filter(stand => selectedStands.includes(stand._id))
      .reduce((total, stand) => total + (stand.basePrice || 0), 0);
  };
  
  const calculateEquipmentTotal = () => {
    return availableEquipment
      .filter(item => selectedEquipment.includes(item._id))
      .reduce((total, item) => total + (item.price || 0), 0);
  };
  
  const calculateTotal = () => {
    return calculateStandsTotal() + calculateEquipmentTotal();
  };
  
  return {
    // Data
    registration,
    availableStands,
    selectedStands,
    availableEquipment,
    selectedEquipment,
    
    // State
    currentStep,
    loading,
    error,
    isSubmitting,
    standSelectionComplete,
    
    // Methods
    toggleStandSelection,
    toggleEquipmentSelection,
    goToNextStep,
    goToPreviousStep,
    submitSelections,
    saveSelections,
    
    // Utilities
    calculateStandsTotal,
    calculateEquipmentTotal,
    calculateTotal,
  };
}