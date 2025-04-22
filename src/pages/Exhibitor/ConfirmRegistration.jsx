// src/pages/Exhibitor/ConfirmRegistration.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Text, SimpleGrid, Card, CardBody, CardHeader,
  HStack, VStack, Divider, Badge, useToast, Spinner, Alert, AlertIcon,
  AlertTitle, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Stack,
  Stat, StatLabel, StatNumber, StatHelpText, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from '@chakra-ui/react';
import {
  FiChevronRight, FiChevronLeft, FiCheckCircle, FiDollarSign, FiInfo,
  FiAlertTriangle, FiBox, FiPackage, FiMapPin, FiCalendar
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';

const ConfirmRegistration = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Selected stands and equipment from session storage
  const [selectedStands, setSelectedStands] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  
  // For selected items details
  const [standsDetails, setStandsDetails] = useState([]);
  const [equipmentDetails, setEquipmentDetails] = useState([]);
  
  // For confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  useEffect(() => {
    fetchRegistrationDetails();
  }, [registrationId]);
  
  const fetchRegistrationDetails = async () => {
    setLoading(true);
    try {
      // First load registration details
      const registrationData = await registrationService.getRegistrationById(registrationId);
      setRegistration(registrationData);
      
      // Load saved selections from session storage
      loadSelectionsFromStorage();
      
      // Check if stands were selected
      const savedStands = JSON.parse(sessionStorage.getItem(`standSelection_${registrationId}`) || '[]');
      if (!savedStands.length) {
        setError("You need to select stands before confirming your registration");
      }
      
      // If event not available in registration, get it
      if (!registrationData.event || typeof registrationData.event === 'string') {
        try {
          const eventId = typeof registrationData.event === 'object' 
            ? registrationData.event._id 
            : registrationData.event;
          
          const eventDetails = await eventService.getEventById(eventId);
          registrationData.event = eventDetails;
        } catch (eventError) {
          console.error("Error fetching event details:", eventError);
        }
      }
      
      // Get details for stands and equipment
      await fetchItemDetails(registrationData);
    } catch (error) {
      setError(error.message || 'Failed to load registration details');
      toast({
        title: 'Error',
        description: 'Failed to load registration details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadSelectionsFromStorage = () => {
    try {
      // Load stand selection
      const standsData = sessionStorage.getItem(`standSelection_${registrationId}`);
      if (standsData) {
        const parsedStands = JSON.parse(standsData);
        if (Array.isArray(parsedStands)) {
          setSelectedStands(parsedStands);
        }
      }
      
      // Load equipment selection
      const equipmentData = sessionStorage.getItem(`equipmentSelection_${registrationId}`);
      if (equipmentData) {
        const parsedEquipment = JSON.parse(equipmentData);
        if (Array.isArray(parsedEquipment)) {
          setSelectedEquipment(parsedEquipment);
        }
      }
    } catch (e) {
      console.error("Error loading saved selections:", e);
    }
  };
  
  const fetchItemDetails = async (registrationData) => {
    try {
      // Get details for stands
      if (selectedStands.length > 0) {
        const eventId = typeof registrationData.event === 'object' 
          ? registrationData.event._id 
          : registrationData.event;
        
        const allStands = await eventService.getStands(eventId);
        const selectedStandsDetails = allStands.filter(stand => 
          selectedStands.includes(stand._id)
        );
        setStandsDetails(selectedStandsDetails);
      } else if (registrationData.stands && registrationData.stands.length > 0) {
        // Use stands from registration if available
        setStandsDetails(registrationData.stands);
        setSelectedStands(registrationData.stands.map(stand => 
          typeof stand === 'object' ? stand._id : stand
        ));
      }
      
      // Get details for equipment
      if (selectedEquipment.length > 0) {
        if (registrationData.event) {
          const eventId = typeof registrationData.event === 'object' 
            ? registrationData.event._id 
            : registrationData.event;
          
          const allEquipment = await eventService.getEventEquipment(eventId);
          const selectedEquipmentDetails = allEquipment.filter(item => 
            selectedEquipment.includes(item._id)
          );
          setEquipmentDetails(selectedEquipmentDetails);
        }
      } else if (registrationData.equipment && registrationData.equipment.length > 0) {
        // Use equipment from registration if available
        setEquipmentDetails(registrationData.equipment);
        setSelectedEquipment(registrationData.equipment.map(item => 
          typeof item === 'object' ? item._id : item
        ));
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast({
        title: 'Warning',
        description: 'Some details could not be loaded. You can still proceed with confirmation.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleConfirm = async () => {
    // Show confirmation modal
    onOpen();
  };
  
  const executeConfirmation = async () => {
    setSubmitting(true);
    try {
      // First, save the stand selection if needed
      if (selectedStands.length > 0) {
        await registrationService.selectStands(registrationId, {
          standIds: selectedStands,
          selectionCompleted: true
        });
      }
      
      // Then save equipment selection if needed
      if (selectedEquipment.length > 0) {
        await registrationService.selectEquipment(registrationId, {
          equipmentIds: selectedEquipment,
          selectionCompleted: true
        });
      }
      
      // Finally, complete the registration
      await registrationService.completeRegistration(registrationId);
      
      // Clear the temporary storage
      sessionStorage.removeItem(`standSelection_${registrationId}`);
      sessionStorage.removeItem(`equipmentSelection_${registrationId}`);
      
      toast({
        title: 'Registration Completed',
        description: 'Your registration has been successfully completed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to registration details
      navigate(`/exhibitor/registrations/${registrationId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
      onClose();
    }
  };
  
  const calculateStandsTotal = () => {
    return standsDetails.reduce((total, stand) => total + (stand.basePrice || 0), 0);
  };
  
  const calculateEquipmentTotal = () => {
    return equipmentDetails.reduce((total, item) => total + (item.price || 0), 0);
  };
  
  const calculateTotal = () => {
    return calculateStandsTotal() + calculateEquipmentTotal();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
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
              <BreadcrumbLink>Confirm Registration</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <Alert status="error" variant="solid" borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error Loading Registration</AlertTitle>
            <Text>{error}</Text>
          </Alert>
          
          <Button 
            mt={6} 
            leftIcon={<FiChevronLeft />}
            onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}
          >
            Go to Stand Selection
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
  const hasStands = selectedStands.length > 0;
  const hasEquipment = selectedEquipment.length > 0;
  
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
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}>
              Select Stands
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}>
              Select Equipment
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Confirm Registration</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading size="lg" mb={6}>Review and Confirm Your Registration</Heading>
        
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Left Column - Selections Review */}
          <Box>
            {/* Event Information */}
            <Card mb={6}>
              <CardHeader pb={0}>
                <Heading size="md">Event Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" fontSize="lg">{event.name || 'Unknown Event'}</Text>
                  
                  <HStack>
                    <Icon as={FiCalendar} color="teal.500" />
                    <Text fontWeight="medium">Dates:</Text>
                    <Text>{formatDate(event.startDate)} - {formatDate(event.endDate)}</Text>
                  </HStack>
                  
                  {event.location && (
                    <HStack>
                      <Icon as={FiMapPin} color="teal.500" />
                      <Text fontWeight="medium">Location:</Text>
                      <Text>{event.location.city}, {event.location.country}</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
            
            {/* Selected Stands */}
            <Card mb={6}>
              <CardHeader pb={0}>
                <Heading size="md">Selected Stands</Heading>
              </CardHeader>
              <CardBody>
                {hasStands ? (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                      {standsDetails.map(stand => (
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
                      onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}
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
                        onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}
                      >
                        Select Stands
                      </Button>
                    </Box>
                  </Alert>
                )}
              </CardBody>
            </Card>
            
            {/* Selected Equipment */}
            <Card mb={6}>
              <CardHeader pb={0}>
                <Heading size="md">Selected Equipment</Heading>
              </CardHeader>
              <CardBody>
                {hasEquipment ? (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                      {equipmentDetails.map(item => (
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
                      onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}
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
                        onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}
                      >
                        Select Equipment
                      </Button>
                    </Box>
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Box>
          
          {/* Right Column - Summary and Confirmation */}
          <Box>
            <Card position="sticky" top="20px">
              <CardHeader pb={0}>
                <Heading size="md">Order Summary</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4} mb={6}>
                  <Stat>
                    <StatLabel>Stands Total</StatLabel>
                    <StatNumber>${calculateStandsTotal()}</StatNumber>
                    <StatHelpText>
                      {standsDetails.length || 0} stand(s) selected
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Equipment Total</StatLabel>
                    <StatNumber>${calculateEquipmentTotal()}</StatNumber>
                    <StatHelpText>
                      {equipmentDetails.length || 0} item(s) selected
                    </StatHelpText>
                  </Stat>
                  
                  <Divider />
                  
                  <Flex justify="space-between" fontWeight="bold" fontSize="xl">
                    <Text>Total Amount:</Text>
                    <Text>${calculateTotal()}</Text>
                  </Flex>
                </VStack>
                
                {!hasStands && (
                  <Alert status="error" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Text>Please select at least one stand before confirming</Text>
                  </Alert>
                )}
                
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
                
                <Stack spacing={4}>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    width="full"
                    leftIcon={<FiCheckCircle />}
                    onClick={handleConfirm}
                    isLoading={submitting}
                    isDisabled={!hasStands}
                  >
                    Confirm Registration
                  </Button>
                  
                  <Button
                    variant="outline"
                    width="full"
                    leftIcon={<FiChevronLeft />}
                    onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}
                  >
                    Back to Equipment Selection
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Registration</ModalHeader>
          <ModalBody>
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Final Confirmation</AlertTitle>
                <Text mt={2}>
                  You are about to confirm your registration with {standsDetails.length} stand(s)
                  {hasEquipment ? ` and ${equipmentDetails.length} equipment item(s)` : ''}.
                </Text>
                <Text mt={2}>
                  Total amount: <Text as="span" fontWeight="bold">${calculateTotal()}</Text>
                </Text>
                <Text mt={2}>
                  This action will complete your registration and cannot be undone. Are you sure you want to proceed?
                </Text>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={executeConfirmation}
              isLoading={submitting}
            >
              Yes, Confirm Registration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default ConfirmRegistration;