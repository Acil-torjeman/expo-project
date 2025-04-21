// src/pages/exhibitor/SelectStands.jsx
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
  
  useEffect(() => {
    fetchRegistrationAndStands();
  }, [registrationId]);
  
  useEffect(() => {
    filterStands();
  }, [availableStands, searchQuery, typeFilter]);
  
  const fetchRegistrationAndStands = async () => {
    setLoading(true);
    try {
      // Fetch registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
      
      // Set any already selected stands
      if (registrationData.stands && registrationData.stands.length > 0) {
        setSelectedStands(registrationData.stands.map(stand => stand._id));
      }
      
      // Fetch available stands for the event
      if (registrationData.event && registrationData.event._id) {
        const eventId = typeof registrationData.event === 'object' ? 
          registrationData.event._id : registrationData.event;
        
        const standsData = await eventService.getAvailableStands(eventId);
        
        // Combine available stands with already selected stands
        const allStands = [...standsData];
        
        // If there are already selected stands, add them to the available stands
        if (registrationData.stands && registrationData.stands.length > 0) {
          // Filter out any stands that are already in the available stands list
          const selectedStandsNotInAvailable = registrationData.stands.filter(
            selected => !standsData.some(available => available._id === selected._id)
          );
          
          allStands.push(...selectedStandsNotInAvailable);
        }
        
        setAvailableStands(allStands);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load stands. Please try again.',
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
        selectionCompleted: true
      });
      
      toast({
        title: 'Stands Selected',
        description: 'Your stand selection has been saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to equipment selection
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
                    {plan && plan._id && (
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
                {filteredStands.length === 0 ? (
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
                    Continue to Equipment
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