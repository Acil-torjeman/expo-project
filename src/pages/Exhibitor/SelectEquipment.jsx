// src/pages/Exhibitor/SelectEquipment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Text, SimpleGrid, Card, CardBody, CardHeader,
  HStack, VStack, Checkbox, Divider, Badge, useToast, Spinner, Alert, AlertIcon,
  AlertTitle, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Stat, StatLabel,
  StatNumber, StatHelpText, Stack, Input, InputGroup, InputLeftElement, Image,
  Tabs, TabList, Tab, TabPanels, TabPanel, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, useDisclosure
} from '@chakra-ui/react';
import {
  FiChevronRight, FiChevronLeft, FiSearch, FiInfo, FiCheckCircle, FiFilter,
  FiPackage, FiAlertTriangle
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';
import equipmentService from '../../services/equipment.service';
import { getEquipmentImageUrl } from '../../utils/fileUtils';

const SelectEquipment = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registration, setRegistration] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // For navigation confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [navigationTarget, setNavigationTarget] = useState(null);
  
  useEffect(() => {
    fetchRegistrationAndEquipment();
  }, [registrationId]);
  
  useEffect(() => {
    filterEquipment();
  }, [availableEquipment, searchQuery, typeFilter]);

  // Try to load from session storage on first render
  useEffect(() => {
    loadTemporaryEquipmentSelection();
  }, []);
  
  const fetchRegistrationAndEquipment = async () => {
    setLoading(true);
    try {
      // Fetch registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
      
      // Set any already selected equipment
      if (registrationData.equipment && registrationData.equipment.length > 0) {
        setSelectedEquipment(registrationData.equipment.map(item => item._id));
      }
      
      // Check if stands are selected first
      if (!registrationData.stands || registrationData.stands.length === 0) {
        setError("You must select stands before selecting equipment. Please go back and select stands first.");
        setLoading(false);
        return;
      }
      
      // Fetch available equipment for the event
      if (registrationData.event && registrationData.event._id) {
        const eventId = typeof registrationData.event === 'object' ? 
          registrationData.event._id : registrationData.event;
        
        // Get all equipment for the event
        const equipmentData = await equipmentService.getEventEquipment(eventId);
        
        // No need to filter equipment since all equipment can be selected by multiple exhibitors
        setAvailableEquipment(equipmentData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load equipment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterEquipment = () => {
    let filtered = [...availableEquipment];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== '') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    setFilteredEquipment(filtered);
  };
  
  const handleSelectEquipment = (equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTypeFilterChange = (type) => {
    setTypeFilter(prev => prev === type ? '' : type);
  };
  
  // Temporary storage in sessionStorage to persist selection between pages
  const saveTemporaryEquipmentSelection = () => {
    sessionStorage.setItem(`equipmentSelection_${registrationId}`, JSON.stringify(selectedEquipment));
  };
  
  const loadTemporaryEquipmentSelection = () => {
    const savedSelection = sessionStorage.getItem(`equipmentSelection_${registrationId}`);
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection);
        if (Array.isArray(parsedSelection)) {
          setSelectedEquipment(parsedSelection);
        }
      } catch (e) {
        console.error("Error loading saved equipment selection:", e);
      }
    }
  };
  
  const handleSubmit = async () => {
    // Save the selection to session storage
    saveTemporaryEquipmentSelection();
    
    // Also save stand selection from the previous page if available
    const savedStandSelection = sessionStorage.getItem(`standSelection_${registrationId}`);
    
    // Navigate to confirmation page
    navigate(`/exhibitor/registrations/${registrationId}/confirm`);
  };
  
  // Handler for navigation with confirmation
  const handleNavigation = (target) => {
    // If no equipment selected or already saved, navigate directly
    if (selectedEquipment.length === 0) {
      navigate(target);
      return;
    }
    
    // Otherwise open confirmation dialog
    setNavigationTarget(target);
    onOpen();
  };
  
  // Confirm navigation and lose changes
  const confirmNavigation = () => {
    onClose();
    if (navigationTarget) {
      navigate(navigationTarget);
    }
  };
  
  const getEquipmentTypes = () => {
    const types = new Set();
    availableEquipment.forEach(item => types.add(item.type));
    return Array.from(types);
  };
  
  const calculateTotal = () => {
    return availableEquipment
      .filter(item => selectedEquipment.includes(item._id))
      .reduce((total, item) => total + (item.price || 0), 0);
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
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}>
                Select Stands
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Select Equipment</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error</AlertTitle>
            <Text>{error}</Text>
          </Alert>
          
          <Button 
            mt={6} 
            leftIcon={<FiChevronLeft />}
            onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}
          >
            Back to Stand Selection
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
  const equipmentTypes = getEquipmentTypes();
  
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
            <BreadcrumbLink onClick={() => handleNavigation(`/exhibitor/registrations/${registrationId}`)}>
              Registration Details
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => handleNavigation(`/exhibitor/registrations/${registrationId}/stands`)}>
              Select Stands
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Select Equipment</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading size="lg" mb={6}>Select Additional Equipment</Heading>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Left Column - Equipment Selection */}
          <Box gridColumn={{ lg: "span 2" }}>
            {/* Equipment search and filters */}
            <Card mb={6}>
              <CardBody>
                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search equipment by name, type, or description..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
                
                <Text fontWeight="medium" mb={2}>Filter by Type:</Text>
                <HStack wrap="wrap" spacing={3} mb={4}>
                  {equipmentTypes.map(type => (
                    <Button
                      key={type}
                      size="sm"
                      variant={typeFilter === type ? "solid" : "outline"}
                      colorScheme={typeFilter === type ? "teal" : "gray"}
                      leftIcon={<FiPackage />}
                      onClick={() => handleTypeFilterChange(type)}
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
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Available Equipment</Heading>
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
                                onClick={() => handleSelectEquipment(item._id)}
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
                                onClick={() => handleSelectEquipment(item._id)}
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
          </Box>
          
          {/* Right Column - Summary */}
          <Box>
            <Card position="sticky" top="20px">
              <CardHeader pb={0}>
                <Heading size="md">Your Selection</Heading>
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
                
                <Divider my={4} />
                
                {selectedEquipment.length > 0 ? (
                  <>
                    <Text fontWeight="medium" mb={2}>Selected Equipment:</Text>
                    <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto" mb={4}>
                      {availableEquipment
                        .filter(item => selectedEquipment.includes(item._id))
                        .map(item => (
                          <HStack key={item._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <Text fontWeight="medium">{item.name}</Text>
                            <Text>${item.price || 0}</Text>
                          </HStack>
                        ))}
                    </VStack>
                    
                    <Divider my={4} />
                    
                    <Flex justify="space-between" fontWeight="bold" fontSize="lg" mb={6}>
                      <Text>Equipment Total:</Text>
                      <Text>${calculateTotal()}</Text>
                    </Flex>
                  </>
                ) : (
                  <Alert status="info" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Text>Equipment selection is optional</Text>
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
                  >
                    Next: Review & Confirm
                  </Button>
                  
                  <Button
                    variant="outline"
                    width="full"
                    leftIcon={<FiChevronLeft />}
                    onClick={() => handleNavigation(`/exhibitor/registrations/${registrationId}/stands`)}
                  >
                    Back to Stands
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Navigation Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unsaved Changes</ModalHeader>
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>You have unsaved equipment selections</AlertTitle>
                <Text mt={2}>
                  If you navigate away now, your equipment selections will not be saved. Are you sure you want to continue?
                </Text>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmNavigation}>
              Discard Selections
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default SelectEquipment;