// src/pages/exhibitor/RegistrationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Icon,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiClipboard,
  FiChevronRight,
  FiBox,
  FiCreditCard,
  FiInfo,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiHome,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';

const RegistrationDetail = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  
  useEffect(() => {
    fetchRegistrationDetails();
  }, [registrationId]);
  
  const fetchRegistrationDetails = async () => {
    setLoading(true);
    try {
      const data = await registrationService.getRegistrationById(registrationId);
      setRegistration(data);
    } catch (error) {
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleProceedToSelection = () => {
    navigate(`/exhibitor/registrations/${registrationId}/stands`);
  };
  
  const handleCancelRegistration = async () => {
    setCancelLoading(true);
    try {
      await registrationService.cancelRegistration(registrationId);
      toast({
        title: 'Registration Cancelled',
        description: 'Your registration has been cancelled successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Refresh registration details
      fetchRegistrationDetails();
      onCancelClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCancelLoading(false);
    }
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
  const status = registration.status;
  const exhibitor = registration.exhibitor || {};
  const company = exhibitor.company || {};
  
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
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Registration Details</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          wrap="wrap"
        >
          <Heading size="lg" mb={{ base: 2, md: 0 }}>
            Registration for {event.name || 'Event'}
          </Heading>
          
          <Badge 
            colorScheme={getStatusColorScheme(status)} 
            fontSize="md" 
            px={3} 
            py={1} 
            borderRadius="full"
          >
            {getStatusDisplayText(status)}
          </Badge>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={6}>
          {/* Event Information */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Event Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiCalendar} color="teal.500" />
                  <Text fontWeight="medium">Event Dates:</Text>
                  <Text>{formatDate(event.startDate)} - {formatDate(event.endDate)}</Text>
                </HStack>
                
                {event.location && (
                  <HStack alignItems="flex-start">
                    <Icon as={FiMapPin} color="teal.500" mt={1} />
                    <Text fontWeight="medium">Location:</Text>
                    <Text>
                      {event.location.address}, {event.location.city}, {event.location.country}
                    </Text>
                  </HStack>
                )}
                
                <HStack>
                  <Icon as={FiClock} color="teal.500" />
                  <Text fontWeight="medium">Opening Hours:</Text>
                  <Text>{event.openingHours || 'Not specified'}</Text>
                </HStack>
                
                <Divider />
                
                <HStack>
                  <Icon as={FiClipboard} color="teal.500" />
                  <Text fontWeight="medium">Registration Date:</Text>
                  <Text>{formatDate(registration.createdAt)}</Text>
                </HStack>
                
                {registration.approvalDate && (
                  <HStack>
                    <Icon as={FiCheck} color="green.500" />
                    <Text fontWeight="medium">Approval Date:</Text>
                    <Text>{formatDate(registration.approvalDate)}</Text>
                  </HStack>
                )}
                
                {registration.rejectionDate && (
                  <HStack>
                    <Icon as={FiX} color="red.500" />
                    <Text fontWeight="medium">Rejection Date:</Text>
                    <Text>{formatDate(registration.rejectionDate)}</Text>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
          
          {/* Company Information */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Company Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiBriefcase} color="teal.500" />
                  <Text fontWeight="medium">Company Name:</Text>
                  <Text>{company.companyName || 'Not specified'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiHome} color="teal.500" />
                  <Text fontWeight="medium">Address:</Text>
                  <Text>
                    {company.companyAddress ? 
                      `${company.companyAddress}, ${company.postalCity}, ${company.country}` : 
                      'Not specified'}
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiUser} color="teal.500" />
                  <Text fontWeight="medium">Representative:</Text>
                  <Text>{exhibitor.representativeFunction || 'Not specified'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiMail} color="teal.500" />
                  <Text fontWeight="medium">Email:</Text>
                  <Text>{exhibitor.user?.email || 'Not specified'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiPhone} color="teal.500" />
                  <Text fontWeight="medium">Contact:</Text>
                  <Text>
                    {exhibitor.personalPhoneCode} {exhibitor.personalPhone}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Registration Status */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Registration Status</Heading>
            </CardHeader>
            <CardBody>
              {/* Show status-specific information */}
              {status === 'pending' && (
                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Pending Approval</AlertTitle>
                    <Text fontSize="sm">
                      Your registration is currently being reviewed by the organizer.
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {status === 'rejected' && (
                <Alert status="error" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Registration Rejected</AlertTitle>
                    <Text fontSize="sm">
                      {registration.rejectionReason || 'No reason provided.'}
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {status === 'approved' && !registration.standSelectionCompleted && (
                <Alert status="success" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Registration Approved</AlertTitle>
                    <Text fontSize="sm">
                      Please proceed to select your stands and equipment.
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {status === 'approved' && registration.standSelectionCompleted && !registration.equipmentSelectionCompleted && (
                <Alert status="success" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Stands Selected</AlertTitle>
                    <Text fontSize="sm">
                      You have selected your stands. Please proceed to select your equipment.
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {status === 'completed' && (
                <Alert status="success" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Registration Complete</AlertTitle>
                    <Text fontSize="sm">
                      Your registration is complete with stands and equipment selected.
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {status === 'cancelled' && (
                <Alert status="warning" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Registration Cancelled</AlertTitle>
                    <Text fontSize="sm">
                      You have cancelled this registration.
                    </Text>
                  </Box>
                </Alert>
              )}
              
              {/* Participation Note */}
              {registration.participationNote && (
                <Box mt={4}>
                  <Text fontWeight="medium" mb={2}>Your Participation Note:</Text>
                  <Text bg="gray.50" p={3} borderRadius="md">
                    {registration.participationNote}
                  </Text>
                </Box>
              )}
              
              {/* Action Buttons */}
              <Box mt={6}>
                {status === 'approved' && !registration.standSelectionCompleted && (
                  <Button 
                    colorScheme="teal" 
                    width="full" 
                    rightIcon={<FiChevronRight />}
                    onClick={handleProceedToSelection}
                  >
                    Proceed to Select Stands
                  </Button>
                )}
                
                {status === 'approved' && registration.standSelectionCompleted && !registration.equipmentSelectionCompleted && (
                  <Button 
                    colorScheme="teal" 
                    width="full" 
                    rightIcon={<FiChevronRight />}
                    onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}
                  >
                    Proceed to Select Equipment
                  </Button>
                )}
                
                {status === 'completed' && (
                  <Button 
                    colorScheme="blue" 
                    width="full" 
                    leftIcon={<FiCreditCard />}
                    isDisabled
                  >
                    View Invoice
                  </Button>
                )}
                
                {(status === 'pending' || status === 'approved') && (
                  <Button 
                    colorScheme="red" 
                    variant="outline" 
                    width="full" 
                    leftIcon={<FiAlertTriangle />}
                    onClick={onCancelOpen}
                    mt={4}
                  >
                    Cancel Registration
                  </Button>
                )}
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {/* Selected Stands Section - only show if stands are selected */}
        {registration.stands && registration.stands.length > 0 && (
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Selected Stands</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {registration.stands.map(stand => (
                  <Card key={stand._id} variant="outline">
                    <CardBody>
                      <Heading size="sm" mb={2}>Stand #{stand.number}</Heading>
                      <VStack align="start" spacing={2}>
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
              
              {registration.standSelectionCompleted && status !== 'completed' && (
                <Button 
                  mt={4} 
                  colorScheme="teal" 
                  variant="outline"
                  onClick={() => navigate(`/exhibitor/registrations/${registrationId}/stands`)}
                >
                  Modify Stand Selection
                </Button>
              )}
            </CardBody>
          </Card>
        )}
        
        {/* Selected Equipment Section - only show if equipment is selected */}
        {registration.equipment && registration.equipment.length > 0 && (
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Selected Equipment</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {registration.equipment.map(item => (
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
              
              {registration.equipmentSelectionCompleted && status !== 'completed' && (
                <Button 
                  mt={4} 
                  colorScheme="teal" 
                  variant="outline"
                  onClick={() => navigate(`/exhibitor/registrations/${registrationId}/equipment`)}
                >
                  Modify Equipment Selection
                </Button>
              )}
            </CardBody>
          </Card>
        )}
        
        {/* Summary / Invoice placeholder - for completed registrations */}
        {status === 'completed' && (
          <Card>
            <CardHeader>
              <Heading size="md">Order Summary</Heading>
            </CardHeader>
            <CardBody>
              <Flex justify="space-between" mb={3}>
                <Text fontWeight="medium">Stand(s) Total:</Text>
                <Text>
                  ${registration.stands?.reduce((total, stand) => total + (stand.basePrice || 0), 0) || 0}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={3}>
                <Text fontWeight="medium">Equipment Total:</Text>
                <Text>
                  ${registration.equipment?.reduce((total, item) => total + (item.price || 0), 0) || 0}
                </Text>
              </Flex>
              <Divider my={3} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total Amount:</Text>
                <Text>
                  ${
                    (registration.stands?.reduce((total, stand) => total + (stand.basePrice || 0), 0) || 0) + 
                    (registration.equipment?.reduce((total, item) => total + (item.price || 0), 0) || 0)
                  }
                </Text>
              </Flex>
              
              <Button 
                mt={6} 
                colorScheme="blue" 
                width="full" 
                leftIcon={<FiCreditCard />}
                isDisabled
              >
                View Invoice & Payment Details
              </Button>
            </CardBody>
          </Card>
        )}
      </Box>
      
      {/* Cancel Registration Confirmation Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Are you sure?</AlertTitle>
                <Text>
                  This will cancel your registration for {event.name}. This action cannot be undone.
                </Text>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCancelClose}>
              No, Keep My Registration
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleCancelRegistration}
              isLoading={cancelLoading}
            >
              Yes, Cancel Registration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default RegistrationDetail;