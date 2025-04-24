// src/hooks/useRegistrationSelection.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import registrationService from '../services/registration.service';
import eventService from '../services/event.service';
import equipmentService from '../services/equipment.service';

export default function useRegistrationSelection(registrationId) {
  // Registration data
  const [registration, setRegistration] = useState(null);
  
  // Stands state
  const [availableStands, setAvailableStands] = useState([]);
  const [selectedStands, setSelectedStands] = useState([]);
  const [standSelectionComplete, setStandSelectionComplete] = useState(false);
  
  // Equipment state
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [equipmentAvailability, setEquipmentAvailability] = useState({});
  
  // Wizard UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  
  // Fetch all registration data
  const fetchRegistrationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
      
      // 2. Extract already selected stands
      if (registrationData.stands && registrationData.stands.length > 0) {
        const standIds = registrationData.stands.map(stand => 
          typeof stand === 'object' ? stand._id : stand
        );
        setSelectedStands(standIds);
        setStandSelectionComplete(registrationData.standSelectionCompleted || false);
      }
      
      // 3. Extract already selected equipment and quantities
      if (registrationData.equipment && registrationData.equipment.length > 0) {
        const equipmentIds = registrationData.equipment.map(item => 
          typeof item === 'object' ? item._id : item
        );
        setSelectedEquipment(equipmentIds);
        
        // Extract quantities if available in equipmentQuantities
        if (registrationData.equipmentQuantities && registrationData.equipmentQuantities.length > 0) {
          const quantities = {};
          registrationData.equipmentQuantities.forEach(item => {
            const equipmentId = typeof item.equipment === 'object' ? 
              item.equipment._id : item.equipment;
            quantities[equipmentId] = item.quantity || 1;
          });
          setEquipmentQuantities(quantities);
        } 
        // Otherwise check metadata for legacy support
        else if (registrationData.metadata && registrationData.metadata.equipmentQuantities) {
          setEquipmentQuantities(registrationData.metadata.equipmentQuantities);
        }
        // Default to 1 for each selected equipment
        else {
          const defaultQuantities = {};
          equipmentIds.forEach(id => defaultQuantities[id] = 1);
          setEquipmentQuantities(defaultQuantities);
        }
      }
      
      // 4. Get event ID
      const eventId = typeof registrationData.event === 'object' 
        ? registrationData.event._id 
        : registrationData.event;
      
      if (eventId) {
        // 5. Fetch event details to check for plan
        const eventDetails = await eventService.getEventById(eventId);
        
        if (!eventDetails.plan) {
          setError("This event doesn't have a floor plan assigned yet. Please contact the organizer.");
          setLoading(false);
          return;
        }
        
        // 6. Fetch stands for the event
        const standsData = await eventService.getStands(eventId);
        
        // 7. Determine which stands are available or already selected by this user
        const userSelectedStandIds = registrationData.stands?.map(stand => 
          typeof stand === 'object' ? stand._id : stand
        ) || [];
        
        const availableOrSelectedStands = standsData.filter(stand => 
          stand.status === 'available' || userSelectedStandIds.includes(stand._id)
        );
        
        setAvailableStands(availableOrSelectedStands);
        
        // 8. Fetch equipment
        const equipmentData = await equipmentService.getEventEquipment(eventId);
        setAvailableEquipment(equipmentData);
        
        // 9. Fetch equipment availability
        const availability = {};
        for (const equipment of equipmentData) {
          try {
            const availableQuantity = await equipmentService.getAvailableQuantity(equipment._id, eventId);
            availability[equipment._id] = availableQuantity;
          } catch (error) {
            console.error(`Error fetching availability for equipment ${equipment._id}:`, error);
            availability[equipment._id] = 0;
          }
        }
        setEquipmentAvailability(availability);
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
  }, [registrationId, toast]);
  
  // Load initial data
  useEffect(() => {
    fetchRegistrationData();
  }, [fetchRegistrationData]);
  
  // Load saved selections from session storage
  useEffect(() => {
    try {
      // Try to load stand selections
      const savedStands = sessionStorage.getItem(`standSelection_${registrationId}`);
      if (savedStands) {
        const parsedStands = JSON.parse(savedStands);
        if (Array.isArray(parsedStands)) {
          setSelectedStands(parsedStands);
        }
      }
      
      // Try to load equipment selections
      const savedEquipment = sessionStorage.getItem(`equipmentSelection_${registrationId}`);
      if (savedEquipment) {
        const parsedEquipment = JSON.parse(savedEquipment);
        if (Array.isArray(parsedEquipment)) {
          setSelectedEquipment(parsedEquipment);
        }
      }
      
      // Try to load equipment quantities
      const savedQuantities = sessionStorage.getItem(`equipmentQuantities_${registrationId}`);
      if (savedQuantities) {
        const parsedQuantities = JSON.parse(savedQuantities);
        if (parsedQuantities && typeof parsedQuantities === 'object') {
          setEquipmentQuantities(parsedQuantities);
        }
      }
    } catch (e) {
      console.error("Error loading saved selections:", e);
    }
  }, [registrationId]);
  
  // Save selections to session storage
  const saveSelections = useCallback(() => {
    try {
      sessionStorage.setItem(`standSelection_${registrationId}`, JSON.stringify(selectedStands));
      sessionStorage.setItem(`equipmentSelection_${registrationId}`, JSON.stringify(selectedEquipment));
      sessionStorage.setItem(`equipmentQuantities_${registrationId}`, JSON.stringify(equipmentQuantities));
    } catch (e) {
      console.error("Error saving selections to session storage:", e);
    }
  }, [registrationId, selectedStands, selectedEquipment, equipmentQuantities]);
  
  // Toggle stand selection
  const toggleStandSelection = useCallback((standId) => {
    setSelectedStands(prev => {
      if (prev.includes(standId)) {
        return prev.filter(id => id !== standId);
      } else {
        return [...prev, standId];
      }
    });
  }, []);
  
  // Toggle equipment selection
  const toggleEquipmentSelection = useCallback((equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        // Remove equipment
        setEquipmentQuantities(prevQuantities => {
          const newQuantities = { ...prevQuantities };
          delete newQuantities[equipmentId];
          return newQuantities;
        });
        return prev.filter(id => id !== equipmentId);
      } else {
        // Add equipment with default quantity 1
        setEquipmentQuantities(prevQuantities => ({
          ...prevQuantities,
          [equipmentId]: 1
        }));
        return [...prev, equipmentId];
      }
    });
  }, []);
  
  // Update equipment quantity
  const updateEquipmentQuantity = useCallback((equipmentId, quantity) => {
    setEquipmentQuantities(prev => ({
      ...prev,
      [equipmentId]: quantity
    }));
  }, []);
  
  // Move to next step
  const goToNextStep = useCallback(() => {
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
    } else if (currentStep === 1) {
      // Save equipment selection
      saveSelections();
    }
    
    setCurrentStep(prev => prev + 1);
  }, [currentStep, selectedStands, saveSelections, toast]);
  
  // Move to previous step
  const goToPreviousStep = useCallback(() => {
    saveSelections();
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, [saveSelections]);
  
  // Submit final selections
  const submitSelections = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Select stands with completed flag
      await registrationService.selectStands(registrationId, {
        standIds: selectedStands,
        selectionCompleted: true
      });
      
      // 2. Prepare equipment data with quantities
      const equipmentSelections = selectedEquipment.map(equipmentId => ({
        equipmentId,
        quantity: equipmentQuantities[equipmentId] || 1
      }));
      
      // 3. Select equipment with quantities in metadata
      await registrationService.selectEquipment(registrationId, {
        equipmentIds: selectedEquipment,
        selectionCompleted: true,
        metadata: {
          equipmentQuantities: equipmentQuantities
        }
      });
      
      // 4. Clean up local storage
      sessionStorage.removeItem(`standSelection_${registrationId}`);
      sessionStorage.removeItem(`equipmentSelection_${registrationId}`);
      sessionStorage.removeItem(`equipmentQuantities_${registrationId}`);
      
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
  }, [registrationId, selectedStands, selectedEquipment, equipmentQuantities, toast]);
  
  // Calculate stands total
  const calculateStandsTotal = useCallback(() => {
    return availableStands
      .filter(stand => selectedStands.includes(stand._id))
      .reduce((total, stand) => total + (stand.basePrice || 0), 0);
  }, [availableStands, selectedStands]);
  
  // Calculate equipment total
  const calculateEquipmentTotal = useCallback(() => {
    return availableEquipment
      .filter(item => selectedEquipment.includes(item._id))
      .reduce((total, item) => {
        const quantity = equipmentQuantities[item._id] || 1;
        return total + (item.price || 0) * quantity;
      }, 0);
  }, [availableEquipment, selectedEquipment, equipmentQuantities]);
  
  // Calculate total (stands + equipment)
  const calculateTotal = useCallback(() => {
    return calculateStandsTotal() + calculateEquipmentTotal();
  }, [calculateStandsTotal, calculateEquipmentTotal]);
  
  return {
    // Data
    registration,
    availableStands,
    selectedStands,
    availableEquipment,
    selectedEquipment,
    equipmentQuantities,
    equipmentAvailability,
    
    // State
    currentStep,
    loading,
    error,
    isSubmitting,
    standSelectionComplete,
    
    // Methods
    toggleStandSelection,
    toggleEquipmentSelection,
    updateEquipmentQuantity,
    goToNextStep,
    goToPreviousStep,
    submitSelections,
    saveSelections,
    fetchRegistrationData,
    
    // Calculations
    calculateStandsTotal,
    calculateEquipmentTotal,
    calculateTotal,
  };
}