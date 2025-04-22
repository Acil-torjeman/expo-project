// src/pages/Exhibitor/SelectStands.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  HStack,
  VStack,
  Checkbox,
  Divider,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  TabPanel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiDownload,
  FiInfo,
  FiCheckCircle,
  FiDollarSign,
  FiGrid,
  FiFilter,
  FiSquare,
  FiAlertTriangle,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';
import { getPlanFileUrl } from '../../utils/fileUtils';

const SelectStands = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registration, setRegistration] = useState(null);
  const [availableStands, setAvailableStands] = useState([]);
  const [selectedStands, setSelectedStands] = useState([]);
  const [filteredStands, setFilteredStands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchRegistrationAndStands();
  }, [registrationId]);
  
  useEffect(() => {
    filterStands();
  }, [availableStands, searchQuery, typeFilter]);
  
  const fetchRegistrationAndStands = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      console.log("Registration data:", registrationData);
      setRegistration(registrationData);
      
      // Set any already selected stands
      if (registrationData.stands && registrationData.stands.length > 0) {
        console.log("Already selected stands:", registrationData.stands);
        setSelectedStands(registrationData.stands.map(stand => stand._id));
      }
      
      // Fetch available stands for the event
      if (registrationData.event && (registrationData.event._id || typeof registrationData.event === 'string')) {
        const eventId = typeof registrationData.event === 'object' ? 
          registrationData.event._id : registrationData.event;
        
        console.log("Getting stands for event:", eventId);
        
        // Get event details first to ensure we have plan information
        const eventDetails = await eventService.getEventById(eventId);
        console.log("Event details:", eventDetails);
        
        if (!eventDetails.plan) {
          setError("This event doesn't have a floor plan assigned yet. Please contact the organizer.");
          setLoading(false);
          return;
        }
        
        // Important: Get ALL stands for the event, not just available ones
        const standsData = await eventService.getStands(eventId);
        console.log("All stands returned:", standsData);
        
        // Filter stands: Show either available stands OR stands already selected by user
        const userSelectedStandIds = registrationData.stands?.map(stand => 
          typeof stand === 'object' ? stand._id : stand
        ) || [];
        
        const availableOrSelectedStands = standsData.filter(stand => 
          stand.status === 'available' || userSelectedStandIds.includes(stand._id)
        );
        
        setAvailableStands(availableOrSelectedStands);
      } else {
        setError("Registration doesn't have a valid event associated with it.");
      }
    } catch (error) {
      console.error("Error fetching stands:", error);
      setError(error.message || 'Failed to load stands. Please try again.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load stands. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterStands = () => {
    let filtered = [...availableStands];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stand => 
        stand.number.toLowerCase().includes(query) ||
        stand.type.toLowerCase().includes(query) ||
        (stand.description && stand.description.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== '') {
      filtered = filtered.filter(stand => stand.type === typeFilter);
    }
    
    setFilteredStands(filtered);
  };
  
  const handleSelectStand = (standId) => {
    setSelectedStands(prev => {
      if (prev.includes(standId)) {
        return prev.filter(id => id !== standId);
      } else {
        return [...prev, standId];
      }
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTypeFilterChange = (type) => {
    setTypeFilter(prev => prev === type ? '' : type);
  };
  
  const handleSubmit = async () => {
    if (selectedStands.length === 0) {
      toast({
        title: 'No stands selected',
        description: 'Please select at least one stand',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await registrationService.selectStands(registrationId, {
        standIds: selectedStands,
        selectionCompleted: true  // Keep this as true since stand selection is required
      });
      
      toast({
        title: 'Stands Selected',
        description: 'Your stand selection has been saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Always navigate to equipment selection next
      navigate(`/exhibitor/registrations/${registrationId}/equipment`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save stand selection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStandTypes = () => {
    const types = new Set();
    availableStands.forEach(stand => types.add(stand.type));
    return Array.from(types);
  };
  
  const calculateTotal = () => {
    return availableStands
      .filter(stand => selectedStands.includes(stand._id))
      .reduce((total, stand) => total + stand.basePrice, 0);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <Flex justify="center" align="center" minH="500px">
          <Spinner size="xl" color="teal.500" thickness="4px" />
        </Flex>
      </DashboardLayout>
    );
  }
  
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
              <BreadcrumbLink>Select Stands</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error Loading Stands</AlertTitle>
            <Text>{error}</Text>
          </Alert>
          
          <Button 
            mt={6} 
            leftIcon={<FiChevronLeft />}
            onClick={() => navigate(`/exhibitor/registrations/${registrationId}`)}
          >
            Back to Registration
          </Button>
        </Box>
      </DashboardLayout>
    );
  }
  
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
  
  const event = registration.event || {};
  const plan = event.plan || {};
  const standTypes = getStandTypes();
  
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
            <BreadcrumbLink>Select Stands</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading size="lg" mb={6}>Select Your Stands</Heading>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Left Column - Stand Selection */}
          <Box gridColumn={{ lg: "span 2" }}>
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
                    {!plan.pdfPath && plan._id && (
                      <Alert status="warning" mt={2} size="sm">
                        <AlertIcon />
                        Plan file not available
                      </Alert>
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
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
                
                <Text fontWeight="medium" mb={2}>Filter by Type:</Text>
                <HStack wrap="wrap" spacing={3} mb={4}>
                  {standTypes.map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant={typeFilter === type ? "solid" : "outline"}
                      colorScheme={typeFilter === type ? "teal" : "gray"}
                      leftIcon={<FiSquare />}
                      onClick={() => handleTypeFilterChange(type)}
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
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Available Stands</Heading>
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
                                onClick={() => !isReserved && handleSelectStand(stand._id)}
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
                                onClick={() => !isReserved && handleSelectStand(stand._id)}
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
          </Box>
          
          {/* Right Column - Summary */}
          <Box>
            <Card position="sticky" top="20px">
              <CardHeader pb={0}>
                <Heading size="md">Your Selection</Heading>
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
                
                <Divider my={4} />
                
                {selectedStands.length > 0 ? (
                  <>
                    <Text fontWeight="medium" mb={2}>Selected Stands:</Text>
                    <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto" mb={4}>
                      {availableStands
                        .filter(stand => selectedStands.includes(stand._id))
                        .map(stand => (
                          <HStack key={stand._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <Text fontWeight="medium">Stand #{stand.number}</Text>
                            <Text>${stand.basePrice}</Text>
                          </HStack>
                        ))}
                    </VStack>
                    
                    <Divider my={4} />
                    
                    <Flex justify="space-between" fontWeight="bold" fontSize="lg" mb={6}>
                      <Text>Total:</Text>
                      <Text>${calculateTotal()}</Text>
                    </Flex>
                  </>
                ) : (
                  <Alert status="info" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Text>Please select at least one stand</Text>
                  </Alert>
                )}
                
                <Stack spacing={4}>
                <Button
                  colorScheme="teal"
                  size="lg"
                  width="full"
                  rightIcon={<FiChevronRight />}
                  onClick={handleSubmit}
                  isLoading={submitting}
                  isDisabled={selectedStands.length === 0}
                >
                  Next: Select Equipment
                </Button>
                  
                  <Button
                    variant="outline"
                    width="full"
                    leftIcon={<FiChevronLeft />}
                    onClick={() => navigate(`/exhibitor/registrations/${registrationId}`)}
                  >
                    Back to Registration
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
};

export default SelectStands;