import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Text, SimpleGrid, Card, CardBody, CardHeader,
  HStack, VStack, Divider, Badge, useToast, Spinner, Alert, AlertIcon,
  AlertTitle, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, 
  Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber,
  StepTitle, StepDescription, StepSeparator, useSteps, InputGroup,
  InputLeftElement, Input, Stat, StatLabel, StatNumber, StatHelpText, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import {
  FiChevronRight, FiChevronLeft, FiSearch, FiCheckCircle,
  FiSquare, FiPackage, FiBox, FiAlertTriangle, FiInfo, FiExternalLink,
  FiMap, FiLock
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';
import equipmentService from '../../services/equipment.service';
import planService from '../../services/plan.service';
import { getPlanFileUrl } from '../../utils/fileUtils';
import EquipmentCard from '../../components/exhibitor/registrations/EquipmentCard';
import invoiceService from '../../services/invoice.service';

// Define the steps for our wizard
const steps = [
  { title: 'Select Stands', description: 'Choose your event stands' },
  { title: 'Select Equipment', description: 'Add optional equipment' },
  { title: 'Review & Confirm', description: 'Complete your registration' },
];

const RegistrationWizard = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Confirmation modal controls
  const { 
    isOpen: isConfirmOpen, 
    onOpen: onConfirmOpen, 
    onClose: onConfirmClose 
  } = useDisclosure();
  
  // Initialize the stepper component
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  // Registration data states
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Plan data states
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  
  // Stands states
  const [allStands, setAllStands] = useState([]);
  const [selectedStands, setSelectedStands] = useState([]);
  const [standSelectionComplete, setStandSelectionComplete] = useState(false);
  const [standSearchQuery, setStandSearchQuery] = useState('');
  const [standTypeFilter, setStandTypeFilter] = useState('');
  const [filteredStands, setFilteredStands] = useState([]);
  
  // Equipment states
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [equipmentAvailability, setEquipmentAvailability] = useState({});
  const [equipSearchQuery, setEquipSearchQuery] = useState('');
  const [equipCategoryFilter, setEquipCategoryFilter] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  
  // Fetch registration details
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
        
        // Extract quantities if available
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
        
        // 6. Fetch plan data if available
        if (eventDetails.plan) {
          fetchPlanData(eventDetails.plan);
        }
        
        // 7. Fetch ALL stands for the event, not just available ones
        const standsData = await eventService.getStands(eventId);
        setAllStands(standsData);
        setFilteredStands(standsData);
        
        // 8. Fetch equipment
        const equipmentData = await equipmentService.getEventEquipment(eventId);
        setAvailableEquipment(equipmentData);
        setFilteredEquipment(equipmentData);
        
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
  
  // Fetch plan data
  const fetchPlanData = useCallback(async (planData) => {
    if (!planData) return;
    
    setPlanLoading(true);
    try {
      // Determine the plan ID correctly
      const planId = typeof planData === 'object' && planData._id 
        ? planData._id 
        : typeof planData === 'string' 
          ? planData 
          : null;
      
      if (planId) {
        const planDetails = await planService.getPlanById(planId);
        setPlan(planDetails);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setPlanLoading(false);
    }
  }, []);
  
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
  
  // Update stepper based on currentStep
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep, setActiveStep]);
  
  // Filter stands when dependencies change
  useEffect(() => {
    if (allStands && allStands.length > 0) {
      filterStands();
    }
  }, [allStands, standSearchQuery, standTypeFilter]);
  
  // Filter equipment when dependencies change
  useEffect(() => {
    if (availableEquipment && availableEquipment.length > 0) {
      filterEquipment();
    }
  }, [availableEquipment, equipSearchQuery, equipCategoryFilter]);
  
  // Filter stands based on search and type
  const filterStands = () => {
    let filtered = [...allStands];
    
    // Apply search filter
    if (standSearchQuery.trim() !== '') {
      const query = standSearchQuery.toLowerCase();
      filtered = filtered.filter(stand => 
        stand.number.toLowerCase().includes(query) ||
        stand.type.toLowerCase().includes(query) ||
        (stand.description && stand.description.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (standTypeFilter !== '') {
      filtered = filtered.filter(stand => stand.type === standTypeFilter);
    }
    
    setFilteredStands(filtered);
  };
  
  // Filter equipment based on search and category
  const filterEquipment = () => {
    let filtered = [...availableEquipment];
    
    // Apply search filter
    if (equipSearchQuery.trim() !== '') {
      const query = equipSearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (equipCategoryFilter !== '') {
      filtered = filtered.filter(item => item.category === equipCategoryFilter);
    }
    
    setFilteredEquipment(filtered);
  };
  
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
  const goToPreviousStep = useCallback((stepIndex) => {
    saveSelections();
    if (stepIndex !== undefined) {
      setCurrentStep(stepIndex);
    } else {
      setCurrentStep(prev => Math.max(0, prev - 1));
    }
  }, [saveSelections]);
  
  // Submit final selections
  const submitSelections = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // First, let's check if the registration is still in approved status
      const currentRegistration = await registrationService.getRegistrationById(registrationId);
      
      if (currentRegistration.status !== 'approved') {
        throw new Error('Registration must be in approved status to complete');
      }
      
      // 1. First select stands WITHOUT marking selection as complete
      await registrationService.selectStands(registrationId, {
        standIds: selectedStands,
        selectionCompleted: false // Don't mark as complete yet
      });
      
      // 2. Then select equipment WITHOUT marking selection as complete
      await registrationService.selectEquipment(registrationId, {
        equipmentIds: selectedEquipment,
        selectionCompleted: false, // Don't mark as complete yet
        metadata: {
          equipmentQuantities: equipmentQuantities
        }
      });
      
      // 3. Finally, complete the registration - this should update statuses and finalize
      await registrationService.completeRegistration(registrationId);
      
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
    return allStands
      .filter(stand => selectedStands.includes(stand._id))
      .reduce((total, stand) => total + (stand.basePrice || 0), 0);
  }, [allStands, selectedStands]);
  
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
  
  // Utility functions to get unique types
  const getStandTypes = () => {
    if (!allStands || allStands.length === 0) return [];
    const types = new Set();
    allStands.forEach(stand => {
      if (stand.type) {
        types.add(stand.type);
      }
    });
    return Array.from(types);
  };
  
  const getEquipmentCategories = () => {
    if (!availableEquipment || availableEquipment.length === 0) return [];
    const categories = new Set();
    availableEquipment.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories);
  };
  
  // Handle confirm request
  const handleConfirmRequest = () => {
    if (selectedStands.length === 0) {
      toast({
        title: 'Stand Selection Required',
        description: 'You must select at least one stand to complete your registration.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    onConfirmOpen();
  };
  
  // Final confirmation handler
  const handleConfirmation = async () => {
    setIsSubmitting(true);
    
    try {
      // Compléter l'inscription
      const success = await submitSelections();
      onConfirmClose();
      
      if (success) {
        toast({
          title: 'Registration Completed',
          description: 'Your registration has been successfully completed. Generating invoice...',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Naviguer d'abord vers la page d'inscription
        navigate(`/exhibitor/registrations/${registrationId}`);
        
        // Tenter de générer la facture en arrière-plan
        try {
          await invoiceService.generateInvoice(registrationId);
          console.log('Invoice generated in background');
        } catch (invoiceError) {
          console.error('Background invoice generation failed:', invoiceError);
          // Pas besoin d'afficher un toast ici car l'utilisateur est déjà redirigé
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onConfirmClose();
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Check if registration is in read-only mode
  const readOnlyMode = registration?.status === 'completed';
  
  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Flex justify="center" align="center" minH="500px">
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Flex>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <Box p={6}>
          <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />} mb={6}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/exhibitor/registrations')}>
                Registrations
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Selection Process</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error</AlertTitle>
            <Text>{error}</Text>
          </Alert>
          
          <Button 
            mt={6} 
            colorScheme="teal" 
            onClick={() => navigate('/exhibitor/registrations')}
          >
            Back to Registrations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
  if (!registration) {
    return (
      <DashboardLayout>
        <Box p={8} textAlign="center">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Registration not found</AlertTitle>
          </Alert>
          <Button 
            mt={6} 
            colorScheme="teal" 
            onClick={() => navigate('/exhibitor/registrations')}
          >
            Back to Registrations
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
  const event = registration.event || {};
  const standTypes = getStandTypes();
  const equipmentCategories = getEquipmentCategories();
  const hasStands = selectedStands.length > 0;
  const hasEquipment = selectedEquipment.length > 0;
  
  // Selected item details for display
  const selectedStandDetails = allStands.filter(stand => selectedStands.includes(stand._id));
  const selectedEquipmentDetails = availableEquipment.filter(item => selectedEquipment.includes(item._id));
  
  return (
    <DashboardLayout>
      <Box p={4}>
        {/* Breadcrumb navigation */}
        <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/exhibitor/registrations')}>
              Registrations
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${registrationId}`)}>
              Registration Details
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Selection Process</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading size="lg" mb={6}>
          Registration for {event.name || 'Event'}
        </Heading>
        
        {readOnlyMode && (
          <Alert status="info" mb={6} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Registration Completed</AlertTitle>
              <Text>
                This registration has been completed. You are viewing it in read-only mode.
              </Text>
            </Box>
          </Alert>
        )}
        
        {/* Stepper */}
        <Stepper index={activeStep} mb={10} colorScheme="teal">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
        
        {/* Step Content */}
        <Box mb={8}>
          {/* Step 1: Stand Selection */}
          {activeStep === 0 && (
            <>
              <Heading size="md" mb={4}>Select Your Stands</Heading>
              
              {/* Floor Plan Section */}
              <Card mb={6}>
                <CardBody>
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Floor Plan Available</AlertTitle>
                      <Text>
                        View the floor plan to see the layout and locations of all stands.
                      </Text>
                      <HStack mt={3} spacing={4}>
                        {planLoading ? (
                          <Button 
                            leftIcon={<FiMap />} 
                            colorScheme="blue"
                            isLoading
                          >
                            Loading...
                          </Button>
                        ) : plan && plan.pdfPath ? (
                          <Button 
                            leftIcon={<FiExternalLink />} 
                            colorScheme="blue"
                            onClick={() => window.open(getPlanFileUrl(plan.pdfPath), '_blank')}
                          >
                            View Floor Plan
                          </Button>
                        ) : (
                          <Button 
                            leftIcon={<FiExternalLink />} 
                            colorScheme="blue"
                            isDisabled
                          >
                            Floor Plan Not Available
                          </Button>
                        )}
                      </HStack>
                    </Box>
                  </Alert>
                </CardBody>
              </Card>
              
              {/* Stand search and filters */}
              <Card mb={6}>
                <CardBody>
                  <InputGroup mb={4}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search stands by number, type, or description..." 
                      value={standSearchQuery}
                      onChange={(e) => setStandSearchQuery(e.target.value)}
                      isDisabled={readOnlyMode}
                    />
                  </InputGroup>
                  
                  <Text fontWeight="medium" mb={2}>Filter by Type:</Text>
                  <HStack wrap="wrap" spacing={3} mb={4}>
                    {standTypes.map(type => (
                      <Button
                        key={type}
                        size="sm"
                        variant={standTypeFilter === type ? "solid" : "outline"}
                        colorScheme={standTypeFilter === type ? "teal" : "gray"}
                        leftIcon={<FiSquare />}
                        onClick={() => setStandTypeFilter(prev => prev === type ? '' : type)}
                        isDisabled={readOnlyMode}
                      >
                        {type}
                      </Button>
                    ))}
                  </HStack>
                  
                  <Divider mb={4} />
                  
                  <HStack spacing={3}>
                    <Text fontWeight="medium">
                      {filteredStands?.length || 0} stands shown
                    </Text>
                    <Badge colorScheme="green">
                      {filteredStands?.filter(s => s.status === 'available').length || 0} available
                    </Badge>
                    <Badge colorScheme="red">
                      {filteredStands?.filter(s => s.status === 'reserved' && !selectedStands.includes(s._id)).length || 0} reserved
                    </Badge>
                    <Badge colorScheme="blue">
                      {selectedStands.length} selected
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>
              
              {/* Stands List */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="sm">All Stands</Heading>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Select stands that are available. Reserved stands are shown but cannot be selected.
                  </Text>
                </CardHeader>
                <CardBody>
                  {!filteredStands || filteredStands.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No stands found matching your criteria</Text>
                    </Alert>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
                      {filteredStands.map(stand => {
                        const isSelected = selectedStands.includes(stand._id);
                        const isReservedByOthers = stand.status === 'reserved' && !isSelected;
                        
                        return (
                          <Card 
                            key={stand._id} 
                            variant="outline"
                            borderColor={isSelected ? "teal.500" : isReservedByOthers ? "red.200" : "gray.200"}
                            bg={isSelected ? "teal.50" : isReservedByOthers ? "red.50" : "white"}
                            _hover={{ 
                              boxShadow: isReservedByOthers || readOnlyMode ? "none" : "md",
                              borderColor: isReservedByOthers || readOnlyMode ? isReservedByOthers ? "red.200" : "gray.200" : "teal.300"
                            }}
                            opacity={isReservedByOthers ? 0.7 : 1}
                            cursor={isReservedByOthers || readOnlyMode ? "not-allowed" : "pointer"}
                            onClick={() => !isReservedByOthers && !readOnlyMode && toggleStandSelection(stand._id)}
                            position="relative"
                            transition="all 0.2s"
                          >
                            {isSelected && (
                              <Icon 
                                as={FiCheckCircle} 
                                position="absolute" 
                                top={2} 
                                right={2} 
                                color="teal.500"
                                boxSize={5}
                              />
                            )}
                            
                            {isReservedByOthers && (
                              <Icon 
                                as={FiLock} 
                                position="absolute" 
                                top={2} 
                                right={2} 
                                color="red.500"
                                boxSize={5}
                              />
                            )}
                            
                            <CardBody>
                              <Heading size="sm" mb={2}>Stand #{stand.number}</Heading>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontWeight="medium">Type:</Text>
                                  <Text>{stand.type}</Text>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="medium">Area:</Text>
                                  <Text>{stand.area} m²</Text>
                                </HStack>
                                <HStack>
                                  <Text fontWeight="medium">Price:</Text>
                                  <Text>${stand.basePrice}</Text>
                                </HStack>
                                
                                {stand.features && (
                                  <Box mt={2}>
                                    <Text fontWeight="medium">Features:</Text>
                                    <HStack mt={1} wrap="wrap">
                                      {stand.features.map((feature, index) => (
                                        <Badge key={index} colorScheme="blue" fontSize="xs">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </HStack>
                                  </Box>
                                )}
                              </VStack>
                              
                              {stand.description && (
                                <Text mt={3} fontSize="sm" color="gray.600" noOfLines={2}>
                                  {stand.description}
                                </Text>
                              )}
                              
                              <Badge 
                                colorScheme={isReservedByOthers ? "red" : isSelected ? "blue" : "green"}
                                mt={2}
                              >
                                {isReservedByOthers ? "Reserved" : isSelected ? "Selected" : "Available"}
                              </Badge>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
              
              {/* Selection Summary */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="sm">Your Selection</Heading>
                </CardHeader>
                <CardBody>
                  <Stat mb={4}>
                    <StatLabel>Selected Stands</StatLabel>
                    <StatNumber>{selectedStands.length}</StatNumber>
                    <StatHelpText>
                      {selectedStands.length > 0 
                        ? `${selectedStands.length} stand${selectedStands.length > 1 ? 's' : ''} selected`
                        : 'No stands selected yet'}
                    </StatHelpText>
                  </Stat>
                  
                  {selectedStands.length > 0 && (
                    <>
                      <Divider my={4} />
                      <Text fontWeight="medium" mb={2}>Selected Stands:</Text>
                      <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto" mb={4}>
                        {selectedStandDetails.map(stand => (
                          <HStack key={stand._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <Text fontWeight="medium">Stand #{stand.number}</Text>
                            <Text>${stand.basePrice}</Text>
                          </HStack>
                        ))}
                      </VStack>
                      
                      <Divider my={4} />
                      
                      <Flex justify="space-between" fontWeight="bold" fontSize="lg" mb={4}>
                        <Text>Total:</Text>
                        <Text>${calculateStandsTotal()}</Text>
                      </Flex>
                    </>
                  )}
                  
                  {selectedStands.length === 0 && (
                    <Alert status="info" mb={4} borderRadius="md">
                      <AlertIcon />
                      <Text>Please select at least one stand to continue</Text>
                    </Alert>
                  )}
                </CardBody>
              </Card>
              
              {/* Navigation buttons */}
              <Flex justify="flex-end">
                <Button
                  colorScheme="teal"
                  size="lg"
                  rightIcon={<FiChevronRight />}
                  onClick={goToNextStep}
                  isDisabled={selectedStands.length === 0 || readOnlyMode}
                >
                  Next: Select Equipment
                </Button>
              </Flex>
            </>
          )}
          
          {/* Step 2: Equipment Selection */}
          {activeStep === 1 && (
            <>
              <Heading size="md" mb={4}>Select Additional Equipment</Heading>
              
              {/* Equipment search and filters */}
              <Card mb={6}>
                <CardBody>
                  <InputGroup mb={4}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search equipment by name or description..." 
                      value={equipSearchQuery}
                      onChange={(e) => setEquipSearchQuery(e.target.value)}
                      isDisabled={readOnlyMode}
                    />
                  </InputGroup>
                  
                  <Text fontWeight="medium" mb={2}>Filter by Category:</Text>
                  <HStack wrap="wrap" spacing={3} mb={4}>
                    {equipmentCategories.map(category => (
                      <Button
                        key={category}
                        size="sm"
                        variant={equipCategoryFilter === category ? "solid" : "outline"}
                        colorScheme={equipCategoryFilter === category ? "teal" : "gray"}
                        leftIcon={<FiPackage />}
                        onClick={() => setEquipCategoryFilter(prev => prev === category ? '' : category)}
                        isDisabled={readOnlyMode}
                      >
                        {category}
                      </Button>
                    ))}
                  </HStack>
                  
                  <Divider mb={4} />
                  
                  <Text fontWeight="medium" mb={2}>
                    {filteredEquipment?.length || 0} items available
                  </Text>
                </CardBody>
              </Card>
              
              {/* Equipment List */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="sm">Available Equipment</Heading>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Select the equipment you wish to use for this event
                  </Text>
                </CardHeader>
                <CardBody>
                  {!filteredEquipment || filteredEquipment.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No equipment found matching your criteria</Text>
                    </Alert>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
                      {filteredEquipment.map(item => (
                        <EquipmentCard
                          key={item._id}
                          equipment={item}
                          isSelected={selectedEquipment.includes(item._id)}
                          quantity={equipmentQuantities[item._id] || 1}
                          availableQuantity={equipmentAvailability[item._id] || 0}
                          onSelect={toggleEquipmentSelection}
                          onUpdateQuantity={updateEquipmentQuantity}
                          isReadOnly={readOnlyMode}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>
              
              {/* Selection Summary */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="sm">Your Selection</Heading>
                </CardHeader>
                <CardBody>
                  <Stat mb={4}>
                    <StatLabel>Selected Equipment</StatLabel>
                    <StatNumber>{selectedEquipment.length}</StatNumber>
                    <StatHelpText>
                      {selectedEquipment.length > 0 
                        ? `${selectedEquipment.length} item${selectedEquipment.length > 1 ? 's' : ''} selected`
                        : 'No equipment selected yet'}
                    </StatHelpText>
                  </Stat>
                  
                  {selectedEquipment.length > 0 && (
                    <>
                      <Divider my={4} />
                      <Text fontWeight="medium" mb={2}>Selected Equipment:</Text>
                      <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto" mb={4}>
                        {selectedEquipmentDetails.map(item => (
                          <HStack key={item._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <HStack>
                              <Text fontWeight="medium">{item.name}</Text>
                              <Badge colorScheme="blue">{equipmentQuantities[item._id] || 1}x</Badge>
                            </HStack>
                            <Text>${(item.price || 0) * (equipmentQuantities[item._id] || 1)}</Text>
                          </HStack>
                        ))}
                      </VStack>
                      
                      <Divider my={4} />
                      
                      <Flex justify="space-between" fontWeight="bold" fontSize="lg" mb={4}>
                        <Text>Equipment Total:</Text>
                        <Text>${calculateEquipmentTotal()}</Text>
                      </Flex>
                    </>
                  )}
                  
                  {selectedEquipment.length === 0 && (
                    <Alert status="info" mb={4} borderRadius="md">
                      <AlertIcon />
                      <Text>Equipment selection is optional</Text>
                    </Alert>
                  )}
                </CardBody>
              </Card>
              
              {/* Navigation buttons */}
              <Flex justify="space-between">
                <Button
                  variant="outline"
                  leftIcon={<FiChevronLeft />}
                  onClick={() => goToPreviousStep(0)}
                  isDisabled={readOnlyMode}
                >
                  Back to Stands
                </Button>
                
                <Button
                  colorScheme="teal"
                  rightIcon={<FiChevronRight />}
                  onClick={goToNextStep}
                  isDisabled={readOnlyMode}
                >
                  Next: Review & Confirm
                </Button>
              </Flex>
            </>
          )}
          
          {/* Step 3: Review and Confirm */}
          {activeStep === 2 && (
            <>
              <Heading size="md" mb={6}>Review Your Selections</Heading>
              
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Selected Stands */}
                <Card>
                  <CardHeader pb={0}>
                    <Heading size="sm">Selected Stands</Heading>
                  </CardHeader>
                  <CardBody>
                    {hasStands ? (
                      <>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                          {selectedStandDetails.map(stand => (
                            <Card key={stand._id} variant="outline">
                              <CardBody>
                                <Heading size="sm" mb={2}>Stand #{stand.number}</Heading>
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <Text fontWeight="medium">Type:</Text>
                                    <Text>{stand.type}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="medium">Area:</Text>
                                    <Text>{stand.area} m²</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="medium">Price:</Text>
                                    <Text>${stand.basePrice}</Text>
                                  </HStack>
                                  
                                  {stand.features && stand.features.length > 0 && (
                                    <Box mt={1}>
                                      <Text fontWeight="medium">Features:</Text>
                                      <HStack mt={1} wrap="wrap">
                                        {stand.features.map((feature, index) => (
                                          <Badge key={index} colorScheme="blue" fontSize="xs">
                                            {feature}
                                          </Badge>
                                        ))}
                                      </HStack>
                                    </Box>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                        
                        {!readOnlyMode && (
                          <Button 
                            leftIcon={<FiChevronLeft />}
                            variant="outline"
                            size="sm"
                            onClick={() => goToPreviousStep(0)}
                          >
                            Modify Stands
                          </Button>
                        )}
                      </>
                    ) : (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No Stands Selected</AlertTitle>
                          <Text>
                            You must select at least one stand to complete your registration.
                          </Text>
                          {!readOnlyMode && (
                            <Button 
                              mt={2}
                              colorScheme="teal"
                              size="sm"
                              onClick={() => goToPreviousStep(0)}
                            >
                              Select Stands
                            </Button>
                          )}
                        </Box>
                      </Alert>
                    )}
                  </CardBody>
                </Card>
                
                {/* Selected Equipment */}
                <Card>
                  <CardHeader pb={0}>
                    <Heading size="sm">Selected Equipment</Heading>
                  </CardHeader>
                  <CardBody>
                    {hasEquipment ? (
                      <>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                          {selectedEquipmentDetails.map(item => (
                            <Card key={item._id} variant="outline">
                              <CardBody>
                                <Heading size="sm" mb={2}>{item.name}</Heading>
                                <Text noOfLines={2} mb={2}>{item.description}</Text>
                                <HStack>
                                  <Text fontWeight="medium">Category:</Text>
                                  <Text>{item.category || item.type}</Text>
                                </HStack>
                                <HStack mt={1}>
                                  <Text fontWeight="medium">Quantity:</Text>
                                  <Text>{equipmentQuantities[item._id] || 1}</Text>
                                </HStack>
                                <HStack mt={1}>
                                  <Text fontWeight="medium">Unit Price:</Text>
                                  <Text>${item.price}</Text>
                                </HStack>
                                <HStack mt={1}>
                                  <Text fontWeight="medium">Total:</Text>
                                  <Text>${(item.price || 0) * (equipmentQuantities[item._id] || 1)}</Text>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                        
                        {!readOnlyMode && (
                          <Button 
                            leftIcon={<FiChevronLeft />}
                            variant="outline"
                            size="sm"
                            onClick={() => goToPreviousStep(1)}
                          >
                            Modify Equipment
                          </Button>
                        )}
                      </>
                    ) : (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No Equipment Selected</AlertTitle>
                          <Text>
                            Equipment selection is optional. You can continue without selecting any equipment.
                          </Text>
                          {!readOnlyMode && (
                            <Button 
                              mt={2}
                              variant="outline"
                              size="sm"
                              onClick={() => goToPreviousStep(1)}
                            >
                              Select Equipment
                            </Button>
                          )}
                        </Box>
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              </SimpleGrid>
              
              {/* Order Summary */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="md">Order Summary</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                    <Stat>
                      <StatLabel>Stands Total</StatLabel>
                      <StatNumber>${calculateStandsTotal()}</StatNumber>
                      <StatHelpText>
                        <HStack>
                          <Icon as={FiBox} />
                          <Text>{selectedStands.length} stand(s)</Text>
                        </HStack>
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Equipment Total</StatLabel>
                      <StatNumber>${calculateEquipmentTotal()}</StatNumber>
                      <StatHelpText>
                        <HStack>
                          <Icon as={FiPackage} />
                          <Text>{selectedEquipment.length} item(s)</Text>
                        </HStack>
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Grand Total</StatLabel>
                      <StatNumber>${calculateTotal()}</StatNumber>
                      <StatHelpText>Combined total</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  
                  {!readOnlyMode && (
                    <Alert status="info" mb={6} borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Please Note</AlertTitle>
                        <Text fontSize="sm">
                          By confirming your registration, you agree to participate in this event and 
                          acknowledge that you will be invoiced for the total amount shown above.
                          This action cannot be undone.
                        </Text>
                      </Box>
                    </Alert>
                  )}
                  
                  <Flex justify="space-between">
                    {!readOnlyMode && (
                      <>
                        <Button
                          variant="outline"
                          leftIcon={<FiChevronLeft />}
                          onClick={() => goToPreviousStep(1)}
                        >
                          Back to Equipment
                        </Button>
                        
                        <Button
                          colorScheme="teal"
                          size="lg"
                          leftIcon={<FiCheckCircle />}
                          onClick={handleConfirmRequest}
                          isLoading={isSubmitting}
                          loadingText="Confirming..."
                          isDisabled={!hasStands}
                        >
                          Confirm Registration
                        </Button>
                      </>
                    )}
                    
                    {readOnlyMode && (
                      <Button
                        colorScheme="teal"
                        onClick={() => navigate(`/exhibitor/registrations/${registrationId}`)}
                        width="full"
                      >
                        Back to Registration Details
                      </Button>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            </>
          )}
        </Box>
      </Box>
      
      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>This action cannot be undone</AlertTitle>
                <Text>
                  Once confirmed, you will not be able to change your stand and equipment selections.
                </Text>
              </Box>
            </Alert>
            
            <Text mb={4}>
              You are about to confirm your registration for <strong>{event.name}</strong> with:
            </Text>
            
            <VStack align="start" spacing={2} mb={4}>
              <Text><strong>{selectedStands.length}</strong> stand(s) - ${calculateStandsTotal()}</Text>
              <Text><strong>{selectedEquipment.length}</strong> equipment item(s) - ${calculateEquipmentTotal()}</Text>
              <Text fontWeight="bold">Total: ${calculateTotal()}</Text>
            </VStack>
            
            <Text>
              By confirming, you agree to participate in this event and will be invoiced for the total amount.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onConfirmClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={handleConfirmation}
              isLoading={isSubmitting}
            >
              Confirm Registration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default RegistrationWizard;