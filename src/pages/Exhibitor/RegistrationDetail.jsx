// src/pages/Exhibitor/RegistrationDetail.jsx
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  FiPackage,
  FiFile,
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';
import { getEquipmentImageUrl } from '../../utils/fileUtils';
import PlanViewerModal from '../../components/organizer/plans/PlanViewerModal';

const RegistrationDetail = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Plan viewer modal
  const { isOpen: isPlanViewerOpen, onOpen: onPlanViewerOpen, onClose: onPlanViewerClose } = useDisclosure();
  // Cancel confirmation modal
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
  
  const isWithin10Days = (startDate) => {
    if (!startDate) return false;
    const today = new Date();
    const eventStart = new Date(startDate);
    const differenceInTime = eventStart.getTime() - today.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays <= 10;
  };
  
  const handleProceedToSelection = () => {
    navigate(`/exhibitor/registrations/${registrationId}/selection`);
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
  const planId = event.plan?._id || event.plan;
  
  // Check if within 10 days of event start
  const within10Days = isWithin10Days(event.startDate);
  
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
                
                {planId && (
                  <HStack>
                    <Icon as={FiFile} color="teal.500" />
                    <Text fontWeight="medium">Floor Plan:</Text>
                    <Button size="xs" colorScheme="blue" onClick={onPlanViewerOpen}>
                      View Plan
                    </Button>
                  </HStack>
                )}
                
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
              
              {status === 'approved' && (
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
                  {status === 'approved' && (
                    <Button 
                      colorScheme="teal" 
                      width="full" 
                      rightIcon={<FiChevronRight />}
                      onClick={handleProceedToSelection}
                    >
                      Proceed to Selection
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
                  
                  {/* Show cancel button for all statuses except cancelled, with 10-day check */}
                  {status !== 'cancelled' && (
                    <>
                      <Button 
                        colorScheme="red" 
                        variant="outline" 
                        width="full" 
                        leftIcon={<FiAlertTriangle />}
                        onClick={onCancelOpen}
                        mt={4}
                        isDisabled={within10Days}
                      >
                        Cancel Registration
                      </Button>
                      
                      {/* Show warning if within 10 days */}
                      {within10Days && (
                        <Alert status="warning" mt={2} size="sm">
                          <AlertIcon />
                          <Text fontSize="sm">
                            Cancellation is not available within 10 days of the event start.
                          </Text>
                        </Alert>
                      )}
                    </>
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
              <Table size="sm" mb={4} variant="simple">
                <Thead>
                  <Tr>
                    <Th>Stand Number</Th>
                    <Th>Type</Th>
                    <Th>Area</Th>
                    <Th isNumeric>Price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {registration.stands.map(stand => (
                    <Tr key={stand._id}>
                      <Td fontWeight="medium">#{stand.number}</Td>
                      <Td>
                        <Badge colorScheme="blue">{stand.type}</Badge>
                      </Td>
                      <Td>{stand.area} m²</Td>
                      <Td isNumeric>${stand.basePrice}</Td>
                    </Tr>
                  ))}
                  <Tr fontWeight="bold">
                    <Td colSpan={3}>Total Stand Price</Td>
                    <Td isNumeric>
                      ${registration.stands.reduce((total, stand) => total + (stand.basePrice || 0), 0)}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
              
              {status === 'approved' && (
                <Button 
                  mt={2} 
                  colorScheme="teal" 
                  variant="outline"
                  onClick={handleProceedToSelection}
                >
                  Modify Selections
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
              <Table size="sm" mb={4} variant="simple">
                <Thead>
                  <Tr>
                    <Th>Equipment</Th>
                    <Th>Type</Th>
                    <Th>Quantity</Th>
                    <Th isNumeric>Unit Price</Th>
                    <Th isNumeric>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {registration.equipment.map(item => {
                    const quantity = registration.equipmentQuantities?.find(eq => {
                      const eqId = typeof eq.equipment === 'object' ? eq.equipment._id : eq.equipment;
                      const itemId = typeof item === 'object' ? item._id : item;
                      return String(eqId) === String(itemId);
                    })?.quantity || 1;
                    
                    return (
                      <Tr key={item._id}>
                        <Td fontWeight="medium">
                          <HStack>
                            {item.imageUrl && (
                              <Box
                                width="40px"
                                height="40px"
                                borderRadius="md"
                                overflow="hidden"
                                mr={2}
                              >
                                <Image 
                                  src={getEquipmentImageUrl(item.imageUrl)} 
                                  boxSize="40px"
                                  objectFit="cover"
                                  alt={item.name}
                                />
                              </Box>
                            )}
                            {item.name}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="green">{item.type}</Badge>
                        </Td>
                        <Td>{quantity}</Td>
                        <Td isNumeric>${item.price}</Td>
                        <Td isNumeric>${item.price * quantity}</Td>
                      </Tr>
                    );
                  })}
                  <Tr fontWeight="bold">
                    <Td colSpan={4}>Total Equipment Price</Td>
                    <Td isNumeric>
                      ${registration.equipment.reduce((total, item) => {
                        const quantity = registration.equipmentQuantities?.find(eq => {
                          const eqId = typeof eq.equipment === 'object' ? eq.equipment._id : eq.equipment;
                          const itemId = typeof item === 'object' ? item._id : item;
                          return String(eqId) === String(itemId);
                        })?.quantity || 1;
                        return total + ((item.price || 0) * quantity);
                      }, 0)}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
              
              {status === 'approved' && (
                <Button 
                  mt={2} 
                  colorScheme="teal" 
                  variant="outline"
                  onClick={handleProceedToSelection}
                >
                  Modify Selections
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
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Stat>
                  <StatLabel>Stands Total</StatLabel>
                  <StatNumber>
                    ${registration.stands?.reduce((total, stand) => total + (stand.basePrice || 0), 0) || 0}
                  </StatNumber>
                  <StatHelpText>
                    <HStack>
                      <Icon as={FiBox} />
                      <Text>{registration.stands?.length || 0} stand(s)</Text>
                    </HStack>
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Equipment Total</StatLabel>
                  <StatNumber>
                    ${registration.equipment?.reduce((total, item) => {
                      const quantity = registration.equipmentQuantities?.find(eq => {
                        const eqId = typeof eq.equipment === 'object' ? eq.equipment._id : eq.equipment;
                        const itemId = typeof item === 'object' ? item._id : item;
                        return String(eqId) === String(itemId);
                      })?.quantity || 1;
                      return total + ((item.price || 0) * quantity);
                    }, 0) || 0}
                  </StatNumber>
                  <StatHelpText>
                    <HStack>
                      <Icon as={FiPackage} />
                      <Text>{registration.equipment?.length || 0} item(s)</Text>
                    </HStack>
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Grand Total</StatLabel>
                  <StatNumber>
                    ${
                      (registration.stands?.reduce((total, stand) => total + (stand.basePrice || 0), 0) || 0) + 
                      (registration.equipment?.reduce((total, item) => {
                        const quantity = registration.equipmentQuantities?.find(eq => {
                          const eqId = typeof eq.equipment === 'object' ? eq.equipment._id : eq.equipment;
                          const itemId = typeof item === 'object' ? item._id : item;
                          return String(eqId) === String(itemId);
                        })?.quantity || 1;
                        return total + ((item.price || 0) * quantity);
                      }, 0) || 0)
                    }
                  </StatNumber>
                  <StatHelpText>Combined total</StatHelpText>
                </Stat>
              </SimpleGrid>
              
              <Button 
                mt={2} 
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
      
      {/* Plan Viewer Modal */}
      {planId && (
        <PlanViewerModal
          isOpen={isPlanViewerOpen}
          onClose={onPlanViewerClose}
          planId={planId}
        />
      )}
      
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
            
            {status === 'completed' && (
              <Alert status="error" borderRadius="md" mt={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Important</AlertTitle>
                  <Text>
                    Canceling a completed registration will release all your selected stands and equipment.
                    Any pending payments will be canceled, but already processed payments may require
                    contacting the organizer for a refund.
                  </Text>
                </Box>
              </Alert>
            )}
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