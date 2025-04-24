// src/pages/Exhibitor/RegistrationWizard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Text, SimpleGrid, Card, CardBody, CardHeader,
  HStack, VStack, Checkbox, Divider, Badge, useToast, Spinner, Alert, AlertIcon,
  AlertTitle, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, 
  Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber,
  StepTitle, StepDescription, StepSeparator, useSteps, Link, InputGroup,
  InputLeftElement, Input, Stat, StatLabel, StatNumber, StatHelpText, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
  useDisclosure
} from '@chakra-ui/react';
import {
  FiChevronRight, FiChevronLeft, FiSearch, FiDownload, FiCheckCircle,
  FiSquare, FiPackage, FiBox, FiAlertTriangle, FiInfo, FiFile
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useRegistrationSelection from '../../hooks/useRegistrationSelection';
// MODIFICATION 1: Importer planService au lieu de getPlanFileUrl
import planService from '../../services/plan.service';
import EquipmentCard from '../../components/exhibitor/registrations/EquipmentCard';
import PlanViewerModal from '../../components/organizer/plans/PlanViewerModal';

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
  
  // Plan viewer modal
  const { isOpen: isPlanViewerOpen, onOpen: onPlanViewerOpen, onClose: onPlanViewerClose } = useDisclosure();
  
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
  
  // Local state for filters
  const [standSearchQuery, setStandSearchQuery] = useState('');
  const [standTypeFilter, setStandTypeFilter] = useState('');
  const [equipSearchQuery, setEquipSearchQuery] = useState('');
  const [equipCategoryFilter, setEquipCategoryFilter] = useState('');
  const [filteredStands, setFilteredStands] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  
  // Use our custom hook for registration selection logic
  const {
    registration,
    availableStands,
    selectedStands,
    availableEquipment,
    selectedEquipment,
    equipmentQuantities,
    equipmentAvailability,
    currentStep,
    loading,
    error,
    isSubmitting,
    standSelectionComplete,
    toggleStandSelection,
    toggleEquipmentSelection,
    updateEquipmentQuantity,
    goToNextStep,
    goToPreviousStep,
    submitSelections,
    calculateStandsTotal,
    calculateEquipmentTotal,
    calculateTotal,
    fetchRegistrationData
  } = useRegistrationSelection(registrationId);
  
  // Update stepper based on currentStep
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep, setActiveStep]);
  
  // Filter stands when dependencies change
  useEffect(() => {
    if (availableStands && availableStands.length > 0) {
      filterStands();
    }
  }, [availableStands, standSearchQuery, standTypeFilter]);
  
  // Filter equipment when dependencies change
  useEffect(() => {
    if (availableEquipment && availableEquipment.length > 0) {
      filterEquipment();
    }
  }, [availableEquipment, equipSearchQuery, equipCategoryFilter]);

  // Ajoutons un effet pour afficher des logs sur l'objet registration
  useEffect(() => {
    if (registration) {
      console.log('Registration object:', registration);
      if (registration.event) {
        console.log('Event object:', registration.event);
        if (registration.event.plan) {
          console.log('Plan object:', registration.event.plan);
        }
      }
    }
  }, [registration]);
  
  // Filter stands based on search and type
  const filterStands = () => {
    let filtered = [...availableStands];
    
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
  
  // Utility functions to get unique types
  const getStandTypes = () => {
    if (!availableStands || availableStands.length === 0) return [];
    const types = new Set();
    availableStands.forEach(stand => {
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
  
  // Navigation handlers
  const handleNext = () => {
    goToNextStep();
  };
  
  const handlePrevious = (stepIndex) => {
    if (stepIndex !== undefined) {
      setActiveStep(stepIndex);
    }
    goToPreviousStep();
  };
  
  // Open confirmation modal
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
    const success = await submitSelections();
    onConfirmClose();
    if (success) {
      navigate(`/exhibitor/registrations/${registrationId}`);
    }
  };
  
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
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${registrationId}`)}>
                Registration Details
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
  
  // Check if registration exists and is in proper status
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
  
  // MODIFICATION 2: Extraire correctement le planId
  const event = registration.event || {};
  const plan = event.plan || {};
  
  // Extraction améliorée de l'ID du plan
  let planId = null;
  
  // Extraire soigneusement l'ID du plan pour s'assurer qu'il s'agit d'une chaîne
  if (plan) {
    if (typeof plan === 'object') {
      if (plan._id) {
        // Si plan._id existe, assurez-vous de le convertir en chaîne
        planId = typeof plan._id === 'string' ? plan._id : String(plan._id);
        console.log('Extracted planId from plan._id:', planId);
      } else if (plan.id) {
        // Certains objets ont 'id' au lieu de '_id'
        planId = typeof plan.id === 'string' ? plan.id : String(plan.id);
        console.log('Extracted planId from plan.id:', planId);
      }
    } else if (typeof plan === 'string') {
      // Si plan est déjà un identifiant sous forme de chaîne
      planId = plan;
      console.log('Plan is already a string ID:', planId);
    }
  }
  
  // Si nous n'avons pas pu extraire un ID valide, mettre à null
  if (planId === '[object Object]' || planId === 'undefined') {
    console.log('Invalid planId detected, setting to null');
    planId = null;
  }
  
  console.log('Final planId to use:', planId);
  
  const standTypes = getStandTypes();
  const equipmentCategories = getEquipmentCategories();
  const hasStands = selectedStands.length > 0;
  const hasEquipment = selectedEquipment.length > 0;
  const isRegistrationCompleted = registration.status === 'completed';
  const readOnlyMode = isRegistrationCompleted;
  
  // Selected item details for display
  const selectedStandDetails = availableStands.filter(stand => selectedStands.includes(stand._id));
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
              
              {/* MODIFICATION 3: Section du plan modifiée */}
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
                        {/* Modifier la condition pour afficher le bouton */}
                        {(planId || (plan && (plan._id || typeof plan === 'string'))) && (
                          <Button 
                            leftIcon={<FiFile />} 
                            colorScheme="blue"
                            onClick={() => {
                              // Log avant d'ouvrir la modal
                              console.log("Opening modal with planId:", planId);
                              onPlanViewerOpen();
                            }}
                          >
                            View Floor Plan
                          </Button>
                        )}
                        
                        {plan && plan.pdfPath && (
                          <Link 
                            href={plan.pdfPath ? planService.getPlanPdfUrl(plan.pdfPath) : '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            isExternal
                          >
                            <Button 
                              leftIcon={<FiDownload />} 
                              variant="outline"
                              colorScheme="blue"
                              isDisabled={!plan.pdfPath}
                            >
                              Download Plan
                            </Button>
                          </Link>
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
                  
                  <Text fontWeight="medium" mb={2}>
                    {filteredStands && filteredStands.length} stand{filteredStands && filteredStands.length !== 1 ? 's' : ''} available
                  </Text>
                </CardBody>
              </Card>
              
              {/* Stands List */}
              <Card mb={6}>
                <CardHeader pb={0}>
                  <Heading size="sm">Available Stands</Heading>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    Select the stands you wish to reserve for this event
                  </Text>
                </CardHeader>
                <CardBody>
                  {!availableStands || availableStands.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>No stands available</AlertTitle>
                        <Text>
                          There are no stands available for this event. This may be because the organizer 
                          hasn't created any stands yet, or all stands are already reserved.
                        </Text>
                      </Box>
                    </Alert>
                  ) : !filteredStands || filteredStands.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No stands found matching your criteria</Text>
                    </Alert>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                      {filteredStands.map(stand => {
                        const isSelected = selectedStands.includes(stand._id);
                        const isReserved = stand.status === 'reserved' && !isSelected;
                        
                        return (
                          <Card 
                            key={stand._id} 
                            variant="outline"
                            borderColor={isSelected ? "teal.500" : "gray.200"}
                            bg={isSelected ? "teal.50" : "white"}
                            _hover={{ 
                              boxShadow: isReserved || readOnlyMode ? "none" : "md",
                              borderColor: isReserved || readOnlyMode ? "gray.200" : "teal.300"
                            }}
                            opacity={isReserved ? 0.7 : 1}
                            cursor={isReserved || readOnlyMode ? "not-allowed" : "pointer"}
                            onClick={() => !isReserved && !readOnlyMode && toggleStandSelection(stand._id)}
                            position="relative"
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
                              </VStack>
                              
                              {stand.description && (
                                <Text mt={3} fontSize="sm" color="gray.600" noOfLines={2}>
                                  {stand.description}
                                </Text>
                              )}
                              
                              {isReserved && (
                                <Badge 
                                  colorScheme="blue" 
                                  position="absolute"
                                  top={2}
                                  right={2}
                                >
                                  Reserved
                                </Badge>
                              )}
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
                  onClick={handleNext}
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
                    {filteredEquipment && filteredEquipment.length} item{filteredEquipment && filteredEquipment.length !== 1 ? 's' : ''} available
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
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
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
                  onClick={() => handlePrevious(0)}
                  isDisabled={readOnlyMode}
                >
                  Back to Stands
                </Button>
                
                <Button
                  colorScheme="teal"
                  rightIcon={<FiChevronRight />}
                  onClick={handleNext}
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
                            onClick={() => handlePrevious(0)}
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
                              onClick={() => handlePrevious(0)}
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
                            onClick={() => handlePrevious(1)}
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
                              onClick={() => handlePrevious(1)}
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
                          onClick={() => handlePrevious(1)}
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
      
      {/* MODIFICATION 4: Ajout des logs dans PlanViewerModal */}
      <PlanViewerModal
        isOpen={isPlanViewerOpen}
        onClose={onPlanViewerClose}
        planId={planId}
      />
      
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