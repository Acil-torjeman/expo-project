// src/pages/exhibitor/RegistrationWizard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Text, SimpleGrid, Card, CardBody, CardHeader,
  HStack, VStack, Checkbox, Divider, Badge, useToast, Spinner, Alert, AlertIcon,
  AlertTitle, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, 
  Stepper, Step, StepIndicator, StepStatus, StepIcon, StepNumber,
  StepTitle, StepDescription, StepSeparator, useSteps, Link, InputGroup,
  InputLeftElement, Input, Tabs, TabList, Tab, TabPanels, TabPanel, Image,
  Stat, StatLabel, StatNumber, StatHelpText
} from '@chakra-ui/react';
import {
  FiChevronRight, FiChevronLeft, FiSearch, FiDownload, FiCheckCircle,
  FiSquare, FiPackage, FiBox, FiAlertTriangle, FiInfo
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useRegistrationSelection from '../../hooks/useRegistrationSelection';
import { getPlanFileUrl, getEquipmentImageUrl } from '../../utils/fileUtils';

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
  
  // Initialize the stepper component
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  // Local state for filters
  const [standSearchQuery, setStandSearchQuery] = useState('');
  const [standTypeFilter, setStandTypeFilter] = useState('');
  const [equipSearchQuery, setEquipSearchQuery] = useState('');
  const [equipTypeFilter, setEquipTypeFilter] = useState('');
  const [filteredStands, setFilteredStands] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  
  // Use our custom hook for registration selection logic
  const {
    registration,
    availableStands,
    selectedStands,
    availableEquipment,
    selectedEquipment,
    currentStep,
    loading,
    error,
    isSubmitting,
    standSelectionComplete,
    toggleStandSelection,
    toggleEquipmentSelection,
    goToNextStep,
    goToPreviousStep,
    submitSelections,
    calculateStandsTotal,
    calculateEquipmentTotal,
    calculateTotal
  } = useRegistrationSelection(registrationId);
  
  // Filter stands when dependencies change
  useEffect(() => {
    if (availableStands.length > 0) {
      filterStands();
    }
  }, [availableStands, standSearchQuery, standTypeFilter]);
  
  // Filter equipment when dependencies change
  useEffect(() => {
    if (availableEquipment.length > 0) {
      filterEquipment();
    }
  }, [availableEquipment, equipSearchQuery, equipTypeFilter]);
  
  // Sync custom hook step with Chakra UI stepper
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep, setActiveStep]);
  
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
  
  // Filter equipment based on search and type
  const filterEquipment = () => {
    let filtered = [...availableEquipment];
    
    // Apply search filter
    if (equipSearchQuery.trim() !== '') {
      const query = equipSearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (equipTypeFilter !== '') {
      filtered = filtered.filter(item => item.type === equipTypeFilter);
    }
    
    setFilteredEquipment(filtered);
  };
  
  // Utility functions to get unique types
  const getStandTypes = () => {
    const types = new Set();
    availableStands.forEach(stand => types.add(stand.type));
    return Array.from(types);
  };
  
  const getEquipmentTypes = () => {
    const types = new Set();
    availableEquipment.forEach(item => types.add(item.type));
    return Array.from(types);
  };
  
  // Navigation handlers
  const handleNext = () => {
    goToNextStep();
  };
  
  const handlePrevious = (stepIndex) => {
    if (stepIndex !== undefined) {
      setActiveStep(stepIndex);
    } else {
      goToPreviousStep();
    }
  };
  
  // Final confirmation handler
  const handleConfirmation = async () => {
    const success = await submitSelections();
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
        </Box>
      </DashboardLayout>
    );
  }
  
  // Check if registration exists and is approved
  if (!registration || registration.status !== 'approved') {
    return (
      <DashboardLayout>
        <Box p={8} textAlign="center">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Registration not found or not approved</AlertTitle>
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
  
  // Extract variables for template use
  const event = registration.event || {};
  const plan = event.plan || {};
  const standTypes = getStandTypes();
  const equipmentTypes = getEquipmentTypes();
  const hasStands = selectedStands.length > 0;
  const hasEquipment = selectedEquipment.length > 0;
  
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
              
              {/* Plan download section */}
              <Card mb={6}>
                <CardBody>
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Floor Plan Available</AlertTitle>
                      <Text>
                        Download the floor plan to see the layout and locations of all stands.
                      </Text>
                      {plan && plan.pdfPath && (
                        <Link 
                          href={getPlanFileUrl(plan.pdfPath)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          display="inline-block"
                          mt={2}
                        >
                          <Button 
                            size="sm" 
                            leftIcon={<FiDownload />} 
                            colorScheme="blue"
                          >
                            Download Floor Plan
                          </Button>
                        </Link>
                      )}
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
                      >
                        {type}
                      </Button>
                    ))}
                  </HStack>
                  
                  <Divider mb={4} />
                  
                  <Text fontWeight="medium" mb={2}>
                    {filteredStands.length} stand{filteredStands.length !== 1 ? 's' : ''} available
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
                  {availableStands.length === 0 ? (
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
                  ) : filteredStands.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No stands found matching your criteria</Text>
                    </Alert>
                  ) : (
                    <Tabs variant="enclosed" colorScheme="teal">
                      <TabList>
                        <Tab>Grid View</Tab>
                        <Tab>List View</Tab>
                      </TabList>
                      
                      <TabPanels>
                        {/* Grid View */}
                        <TabPanel px={0}>
                          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
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
                                    boxShadow: isReserved ? "none" : "md",
                                    borderColor: isReserved ? "gray.200" : "teal.300"
                                  }}
                                  opacity={isReserved ? 0.7 : 1}
                                  cursor={isReserved ? "not-allowed" : "pointer"}
                                  onClick={() => !isReserved && toggleStandSelection(stand._id)}
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
                                        colorScheme="red" 
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
                        </TabPanel>
                        
                        {/* List View */}
                        <TabPanel px={0}>
                          <VStack spacing={2} align="stretch">
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
                                    boxShadow: isReserved ? "none" : "md",
                                    borderColor: isReserved ? "gray.200" : "teal.300"
                                  }}
                                  opacity={isReserved ? 0.7 : 1}
                                  cursor={isReserved ? "not-allowed" : "pointer"}
                                  onClick={() => !isReserved && toggleStandSelection(stand._id)}
                                >
                                  <CardBody>
                                    <Flex justify="space-between" align="center">
                                      <Box>
                                        <Heading size="sm" mb={1}>Stand #{stand.number}</Heading>
                                        <HStack spacing={2} wrap="wrap">
                                          <Badge>{stand.type}</Badge>
                                          <Badge colorScheme="blue">{stand.area} m²</Badge>
                                          <Badge colorScheme="green">${stand.basePrice}</Badge>
                                        </HStack>
                                      </Box>
                                      <Checkbox 
                                        isChecked={isSelected}
                                        isDisabled={isReserved}
                                        colorScheme="teal"
                                        size="lg"
                                        onChange={() => {}}
                                      />
                                    </Flex>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </VStack>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
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
                  isDisabled={selectedStands.length === 0}
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
                      placeholder="Search equipment by name, type, or description..." 
                      value={equipSearchQuery}
                      onChange={(e) => setEquipSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Text fontWeight="medium" mb={2}>Filter by Type:</Text>
                  <HStack wrap="wrap" spacing={3} mb={4}>
                    {equipmentTypes.map(type => (
                      <Button
                        key={type}
                        size="sm"
                        variant={equipTypeFilter === type ? "solid" : "outline"}
                        colorScheme={equipTypeFilter === type ? "teal" : "gray"}
                        leftIcon={<FiPackage />}
                        onClick={() => setEquipTypeFilter(prev => prev === type ? '' : type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </HStack>
                  
                  <Divider mb={4} />
                  
                  <Text fontWeight="medium" mb={2}>
                    {filteredEquipment.length} item{filteredEquipment.length !== 1 ? 's' : ''} available
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
                  {filteredEquipment.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No equipment found matching your criteria</Text>
                    </Alert>
                  ) : (
                    <Tabs variant="enclosed" colorScheme="teal">
                      <TabList>
                        <Tab>Grid View</Tab>
                        <Tab>List View</Tab>
                      </TabList>
                      
                      <TabPanels>
                        {/* Grid View */}
                        <TabPanel px={0}>
                          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                            {filteredEquipment.map(item => {
                              const isSelected = selectedEquipment.includes(item._id);
                              
                              return (
                                <Card 
                                  key={item._id} 
                                  variant="outline"
                                  borderColor={isSelected ? "teal.500" : "gray.200"}
                                  bg={isSelected ? "teal.50" : "white"}
                                  _hover={{ 
                                    boxShadow: "md",
                                    borderColor: "teal.300"
                                  }}
                                  cursor="pointer"
                                  onClick={() => toggleEquipmentSelection(item._id)}
                                  position="relative"
                                  overflow="hidden"
                                >
                                  {isSelected && (
                                    <Icon 
                                      as={FiCheckCircle} 
                                      position="absolute" 
                                      top={2} 
                                      right={2} 
                                      color="teal.500"
                                      boxSize={5}
                                      zIndex={1}
                                    />
                                  )}
                                  
                                  {item.imagePath && (
                                    <Box height="120px" overflow="hidden">
                                      <Image 
                                        src={getEquipmentImageUrl(item.imagePath)} 
                                        alt={item.name}
                                        objectFit="cover"
                                        w="100%"
                                        h="100%"
                                        fallback={
                                          <Flex h="100%" align="center" justify="center" bg="gray.100">
                                            <Icon as={FiPackage} boxSize={8} color="gray.400" />
                                          </Flex>
                                        }
                                      />
                                    </Box>
                                  )}
                                  
                                  <CardBody>
                                    <Heading size="sm" mb={2}>{item.name}</Heading>
                                    <Badge mb={2}>{item.type}</Badge>
                                    
                                    {item.description && (
                                      <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>
                                        {item.description}
                                      </Text>
                                    )}
                                    
                                    <Text fontWeight="bold" color="teal.600">
                                      ${item.price || 0}
                                    </Text>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </SimpleGrid>
                        </TabPanel>
                        
                        {/* List View */}
                        <TabPanel px={0}>
                          <VStack spacing={2} align="stretch">
                            {filteredEquipment.map(item => {
                              const isSelected = selectedEquipment.includes(item._id);
                              
                              return (
                                <Card 
                                  key={item._id} 
                                  variant="outline"
                                  borderColor={isSelected ? "teal.500" : "gray.200"}
                                  bg={isSelected ? "teal.50" : "white"}
                                  _hover={{ 
                                    boxShadow: "md",
                                    borderColor: "teal.300"
                                  }}
                                  cursor="pointer"
                                  onClick={() => toggleEquipmentSelection(item._id)}
                                >
                                  <CardBody>
                                    <Flex justify="space-between" align="center">
                                      <Box>
                                        <Heading size="sm" mb={1}>{item.name}</Heading>
                                        <HStack spacing={2} mb={1}>
                                          <Badge>{item.type}</Badge>
                                          <Badge colorScheme="green">${item.price || 0}</Badge>
                                        </HStack>
                                        {item.description && (
                                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                            {item.description}
                                          </Text>
                                        )}
                                      </Box>
                                      <Checkbox 
                                        isChecked={isSelected}
                                        colorScheme="teal"
                                        size="lg"
                                        onChange={() => {}}
                                      />
                                    </Flex>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </VStack>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
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
                            <Text fontWeight="medium">{item.name}</Text>
                            <Text>${item.price || 0}</Text>
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
                  onClick={handlePrevious}
                >
                  Back to Stands
                </Button>
                
                <Button
                  colorScheme="teal"
                  rightIcon={<FiChevronRight />}
                  onClick={handleNext}
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
                        
                        <Button 
                          leftIcon={<FiChevronLeft />}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrevious(0)}
                        >
                          Modify Stands
                        </Button>
                      </>
                    ) : (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No Stands Selected</AlertTitle>
                          <Text>
                            You must select at least one stand to complete your registration.
                          </Text>
                          <Button 
                            mt={2}
                            colorScheme="teal"
                            size="sm"
                            onClick={() => handlePrevious(0)}
                          >
                            Select Stands
                          </Button>
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
                                  <Text fontWeight="medium">Type:</Text>
                                  <Text>{item.type}</Text>
                                </HStack>
                                <HStack mt={1}>
                                  <Text fontWeight="medium">Price:</Text>
                                  <Text>${item.price}</Text>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                        
                        <Button 
                          leftIcon={<FiChevronLeft />}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrevious(1)}
                        >
                          Modify Equipment
                        </Button>
                      </>
                    ) : (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No Equipment Selected</AlertTitle>
                          <Text>
                            Equipment selection is optional. You can continue without selecting any equipment.
                          </Text>
                          <Button 
                            mt={2}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrevious(1)}
                          >
                            Select Equipment
                          </Button>
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
                  
                  <Alert status="info" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Please Note</AlertTitle>
                      <Text fontSize="sm">
                        By confirming your registration, you agree to participate in this event and 
                        acknowledge that you will be invoiced for the total amount shown above.
                      </Text>
                    </Box>
                  </Alert>
                  
                  <Flex justify="space-between">
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
                      onClick={handleConfirmation}
                      isLoading={isSubmitting}
                      loadingText="Confirming..."
                      isDisabled={!hasStands}
                    >
                      Confirm Registration
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RegistrationWizard;