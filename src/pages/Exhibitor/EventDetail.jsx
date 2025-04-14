// src/pages/Exhibitor/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  Badge,
  Avatar,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiTag,
  FiCheck,
  FiX,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getEventImageUrl, getFileUrl } from '../../utils/fileUtils';
import apiConfig from '../../config/api.config';
import eventService from '../../services/event.service';
import registrationService from '../../services/registration.service';
import exhibitorService from '../../services/exhibitor.service';
import organizerService from '../../services/organizer.service';
import { useAuth } from '../../context/AuthContext';
import RegistrationModal from '../../components/exhibitor/events/RegistrationModal';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // States
  const [event, setEvent] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);
  const [exhibitor, setExhibitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [organizerData, setOrganizerData] = useState(null);
  
  // Dialog state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // Fetch event details
        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);
        
        // Fetch official exhibitors
        const registrations = await registrationService.getEventExhibitors(eventId);
        setExhibitors(registrations);
        
        // Fetch organizer details if we have an organizer
        if (eventData.organizer) {
          try {
            // Get the organizer's user ID
            let organizerId;
            if (typeof eventData.organizer === 'object') {
              organizerId = eventData.organizer._id || eventData.organizer.id;
            } else {
              organizerId = eventData.organizer;
            }
            
            if (organizerId) {
              // Fetch organizer details by user ID
              const organizerDetails = await organizerService.getByUserId(organizerId);
              if (organizerDetails) {
                setOrganizerData(organizerDetails);
              }
            }
          } catch (error) {
            console.error('Error fetching organizer details:', error);
          }
        }
        
        // Check if current user has already registered
        if (isAuthenticated && user) {
          // Fetch exhibitor profile
          try {
            const exhibitorData = await exhibitorService.getByUserId(user.id);
            setExhibitor(exhibitorData);
          } catch (exhibitorError) {
            console.error('Error fetching exhibitor profile:', exhibitorError);
          }
          
          // Get user registrations
          const userRegs = await registrationService.getMyRegistrations();
          const eventRegistration = userRegs.find(reg => 
            reg.event && (reg.event._id === eventId || reg.event === eventId)
          );
          
          if (eventRegistration) {
            setUserRegistration(eventRegistration);
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, isAuthenticated, user, toast]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const sameMonth = start.getMonth() === end.getMonth() && 
                     start.getFullYear() === end.getFullYear();
    
    if (sameMonth) {
      return `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
              ${start.getDate()} - ${end.getDate()}`;
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  // Handle registration
  const handleRegister = async (registrationData) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to register for this event',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { state: { from: `/exhibitor/events/${eventId}` } });
      return;
    }
    
    setRegistrationLoading(true);
    try {
      await registrationService.registerForEvent(registrationData);
      
      toast({
        title: 'Registration Submitted',
        description: 'Your registration request has been submitted and is pending approval',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh user registration status
      const userRegs = await registrationService.getMyRegistrations();
      const eventRegistration = userRegs.find(reg => 
        reg.event && (reg.event._id === eventId || reg.event === eventId)
      );
      
      if (eventRegistration) {
        setUserRegistration(eventRegistration);
      }
      
      onClose();
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for this event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRegistrationLoading(false);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'cancelled': return 'gray';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Flex direction="column" align="center" justify="center" minH="60vh">
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text mt={4} fontSize="lg">Loading event details...</Text>
          </Flex>
        </Container>
      </DashboardLayout>
    );
  }
  
  // Render error state if event not found
  if (!event) {
    return (
      <DashboardLayout>
        <Container maxW="container.xl" py={8}>
          <Flex direction="column" align="center" justify="center" minH="60vh">
            <Icon as={FiAlertCircle} w={20} h={20} color="red.500" />
            <Heading mt={6} size="lg">Event Not Found</Heading>
            <Text mt={4}>The event you're looking for doesn't exist or you don't have permission to view it.</Text>
            <Button 
              mt={8} 
              colorScheme="teal" 
              onClick={() => navigate('/exhibitor/events')}
            >
              Back to Events
            </Button>
          </Flex>
        </Container>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Event Hero Section */}
        <Box 
          bg={event.imagePath ? 'gray.900' : 'teal.700'} 
          position="relative" 
          height="300px"
        >
          {event.imagePath && (
            <Box 
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgImage={`url(${getEventImageUrl(event.imagePath)})`}
              bgSize="cover"
              bgPosition="center"
              opacity={0.7}
            />
          )}
          
          {/* Gradient overlay */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%)"
          />
          
          {/* Hero content */}
          <Container maxW="container.xl" height="100%" position="relative">
            <Flex 
              direction="column" 
              justify="flex-end" 
              height="100%" 
              pb={8}
              color="white"
            >
              <HStack>
                <Badge 
                  colorScheme="teal" 
                  fontSize="sm"
                  py={1}
                  px={2}
                  borderRadius="full"
                >
                  {event.type}
                </Badge>
                <Badge 
                  colorScheme={event.status === 'published' ? 'green' : 'gray'} 
                  fontSize="sm"
                  py={1}
                  px={2}
                  borderRadius="full"
                >
                  {event.status}
                </Badge>
              </HStack>
              
              <Heading 
                size="2xl"
                mt={2}
                textShadow="0px 2px 4px rgba(0, 0, 0, 0.4)"
              >
                {event.name}
              </Heading>
              
              <HStack mt={4} spacing={6}>
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>{formatDateRange(event.startDate, event.endDate)}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiMapPin} />
                  <Text>{event.location.city}, {event.location.country}</Text>
                </HStack>
              </HStack>
            </Flex>
          </Container>
        </Box>
        
        <Container maxW="container.xl" py={8}>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            {/* Main Content Section */}
            <GridItem>
              {/* Quick Info */}
              <MotionFlex
                direction="column"
                bg={sectionBg}
                p={6}
                borderRadius="lg"
                mb={6}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FiClock} color="teal.500" />
                      <Text fontWeight="medium">Opening Hours:</Text>
                    </HStack>
                    <Text ml={6}>{event.openingHours}</Text>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FiMapPin} color="teal.500" />
                      <Text fontWeight="medium">Address:</Text>
                    </HStack>
                    <Text ml={6}>{event.location.address}, {event.location.postalCity}</Text>
                    <Text ml={6}>{event.location.city}, {event.location.country}</Text>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FiCalendar} color="teal.500" />
                      <Text fontWeight="medium">Registration Deadline:</Text>
                    </HStack>
                    <Text ml={6}>{formatDate(event.registrationDeadline)}</Text>
                  </VStack>
                  
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FiUsers} color="teal.500" />
                      <Text fontWeight="medium">
                        {event.maxExhibitors ? `Limited to ${event.maxExhibitors} exhibitors` : 'Open to all exhibitors'}
                      </Text>
                    </HStack>
                  </VStack>
                </Grid>
              </MotionFlex>
              
              {/* Registration Status */}
              {userRegistration && (
                <MotionFlex
                  direction="column"
                  bg={sectionBg}
                  p={6}
                  borderRadius="lg"
                  mb={6}
                  border="1px solid"
                  borderColor={`${getStatusColor(userRegistration.status)}.300`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon 
                        as={userRegistration.status === 'rejected' ? FiX : FiInfo} 
                        boxSize={5} 
                        color={`${getStatusColor(userRegistration.status)}.500`} 
                      />
                      <Text fontWeight="bold">Your Registration Status:</Text>
                    </HStack>
                    <Badge 
                      colorScheme={getStatusColor(userRegistration.status)} 
                      fontSize="md"
                      py={1}
                      px={3}
                      borderRadius="full"
                    >
                      {userRegistration.status.toUpperCase()}
                    </Badge>
                  </Flex>
                  
                  {userRegistration.status === 'rejected' && userRegistration.rejectionReason && (
                    <Box mt={4} p={3} bg="red.50" borderRadius="md">
                      <Text fontWeight="medium" color="red.700">Rejection Reason:</Text>
                      <Text color="red.700">{userRegistration.rejectionReason}</Text>
                    </Box>
                  )}
                  
                  {userRegistration.status === 'approved' && (
                    <Box mt={4}>
                      <Text fontWeight="medium" color="green.700">
                        Your registration has been approved! You can now select stands and equipment.
                      </Text>
                      <Button
                        mt={3}
                        colorScheme="teal"
                        onClick={() => navigate(`/exhibitor/registrations/${userRegistration._id}`)}
                      >
                        Manage Registration
                      </Button>
                    </Box>
                  )}
                  
                  {userRegistration.status === 'pending' && (
                    <Text mt={4} color={mutedColor}>
                      Your registration is currently under review. We'll notify you once it's approved or if additional information is needed.
                    </Text>
                  )}
                </MotionFlex>
              )}
              
              {/* Description */}
              <MotionBox
                bg={bgColor}
                p={6}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
                mb={6}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Heading size="md" mb={4}>About The Event</Heading>
                <Text color={textColor} whiteSpace="pre-line">
                  {event.description}
                </Text>
                
                {/* Industry Sectors */}
                    {event.allowedSectors && event.allowedSectors.length > 0 && (
                    <Box mt={6}>
                        <Text fontWeight="medium" mb={2}>Industry Sectors:</Text>
                        <HStack spacing={2} flexWrap="wrap">
                        {event.allowedSectors.map(sector => (
                            <Tag 
                            key={sector} 
                            colorScheme="teal" 
                            variant="subtle" 
                            mb={2}
                            >
                            <Icon as={FiTag} mr={1} />
                            {sector}
                            </Tag>
                        ))}
                        </HStack>
                    </Box>
                    )}

                    {/* Subsectors */}
                    {event.allowedSubsectors && event.allowedSubsectors.length > 0 && (
                    <Box mt={4}>
                        <Text fontWeight="medium" mb={2}>Subsectors:</Text>
                        <HStack spacing={2} flexWrap="wrap">
                        {event.allowedSubsectors.map(subsector => (
                            <Tag 
                            key={subsector} 
                            colorScheme="blue" 
                            variant="subtle" 
                            mb={2}
                            >
                            <Icon as={FiTag} mr={1} />
                            {subsector}
                            </Tag>
                        ))}
                        </HStack>
                    </Box>
                    )}
                
                {/* Special Conditions if available */}
                {event.specialConditions && (
                  <Box mt={6} p={4} bg={sectionBg} borderRadius="md">
                    <Heading size="sm" mb={2}>Special Conditions</Heading>
                    <Text color={mutedColor}>{event.specialConditions}</Text>
                  </Box>
                )}
              </MotionBox>
              
              {/* Register CTA */}
              {!userRegistration && (
                <MotionBox
                  bg="teal.500"
                  p={6}
                  borderRadius="lg"
                  color="white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Flex 
                    direction={{ base: "column", md: "row" }} 
                    justify="space-between" 
                    align={{ base: "start", md: "center" }}
                  >
                    <Box mb={{ base: 4, md: 0 }}>
                      <Heading size="md">Interested in participating?</Heading>
                      <Text mt={1}>
                        Register now to secure your spot at this event.
                      </Text>
                    </Box>
                    <Button 
                      bg="white" 
                      color="teal.500" 
                      size="lg"
                      _hover={{ bg: 'gray.100' }}
                      onClick={onOpen}
                    >
                      Register for this Event
                    </Button>
                  </Flex>
                </MotionBox>
              )}
            </GridItem>
            
            {/* Sidebar - Official Exhibitors */}
            <GridItem>
              <MotionBox
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Box p={6} bg="teal.500" color="white">
                  <Heading size="md">Official Exhibitors</Heading>
                  <Text mt={1}>
                    Companies that have confirmed their participation
                  </Text>
                </Box>
                
                <Box p={6}>
                  {exhibitors.length === 0 ? (
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center"
                      py={10}
                      color={mutedColor}
                    >
                      <Icon as={FiUsers} boxSize={12} opacity={0.5} mb={4} />
                      <Text fontSize="lg" fontWeight="medium">
                        No confirmed exhibitors yet
                      </Text>
                      <Text textAlign="center" mt={2}>
                        Be one of the first companies to register for this event!
                      </Text>
                    </Flex>
                  ) : (
                    <VStack spacing={5} align="stretch" divider={<Divider />}>
                      {exhibitors.map((registration) => {
                        const company = registration.exhibitor?.company;
                        return company ? (
                          <Box key={registration._id}>
                            <Flex align="center">
                              <Avatar 
                                size="md" 
                                name={company.companyName}
                                src={company.companyLogoPath ? 
                                  getFileUrl(`${apiConfig.UPLOADS.LOGOS}/${company.companyLogoPath}`) : 
                                  undefined
                                }
                                mr={4}
                              />
                              <Box>
                                <Text fontWeight="bold">{company.companyName}</Text>
                                <Text fontSize="sm" color={mutedColor}>
                                  {company.country}
                                </Text>
                                {company.sector && (
                                  <Tag size="sm" colorScheme="teal" mt={1}>
                                    {company.sector}
                                  </Tag>
                                )}
                              </Box>
                            </Flex>
                            
                            {company.companyDescription && (
                              <Text 
                                mt={2} 
                                fontSize="sm" 
                                color={mutedColor}
                                noOfLines={2}
                              >
                                {company.companyDescription}
                              </Text>
                            )}
                            
                            {/* Add the stands information here */}
                            {registration.stands && registration.stands.length > 0 && (
                              <Box mt={2}>
                                <Text fontSize="sm" color={mutedColor}>
                                  Stands: {registration.stands.map(stand => 
                                    `#${stand.number}${stand.type ? ` (${stand.type})` : ''}`
                                  ).join(', ')}
                                </Text>
                              </Box>
                            )}
                          </Box>
                        ) : null;
                      })}
                    </VStack>
                  )}
                </Box>
              </MotionBox>
              
              {/* Organizer Info - Updated with organizerData */}
              {event.organizer && (
                <MotionBox
                  mt={6}
                  bg={bgColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={6}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Heading size="md" mb={4}>Event Organizer</Heading>
                  <Flex align="center">
                    <Avatar 
                      size="lg" 
                      name={organizerData?.organizationName || 'Event Organizer'}
                      src={organizerData?.organizationLogoPath ? 
                        getFileUrl(`${apiConfig.UPLOADS.LOGOS}/${organizerData.organizationLogoPath}`) : 
                        undefined
                      }
                      mr={4}
                    />
                    <Box>
                      <Text fontWeight="bold">
                        {organizerData?.organizationName || 'Event Organizer'}
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Event Organizer
                      </Text>
                    </Box>
                  </Flex>
                </MotionBox>
              )}
            </GridItem>
          </Grid>
        </Container>
      </MotionBox>
      
      {/* Registration Modal Component */}
      <RegistrationModal
        isOpen={isOpen}
        onClose={onClose}
        event={event}
        exhibitor={exhibitor}
        onRegister={handleRegister}
        isRegistering={registrationLoading}
      />
    </DashboardLayout>
  );
};

export default EventDetail;