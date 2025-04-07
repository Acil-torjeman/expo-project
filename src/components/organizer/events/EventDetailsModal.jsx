// src/components/organizer/events/EventDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Stack,
  HStack,
  Text,
  Badge,
  Heading,
  Button,
  ButtonGroup,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Image,
  Skeleton,
  useColorModeValue,
  Tag,
  TagLabel,
  Avatar,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Icon
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiUsers, 
  FiCheck,
  FiEdit,
  FiTrash2,
  FiBarChart2,
  FiEye,
  FiLayers,
  FiAlertCircle,
  FiTag,
  FiBox,
  FiDollarSign,
  FiList,
  FiMap
} from 'react-icons/fi';
import { getStatusColorScheme } from '../../../constants/eventConstants';
import eventService from '../../../services/event.service';
import planService from '../../../services/plan.service';
import equipmentService from '../../../services/equipment.service';
import { getEventImageUrl, getPlanFileUrl, getEquipmentImageUrl } from '../../../utils/fileUtils';

const EventDetailsModal = ({ 
  isOpen, 
  onClose, 
  eventId,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await eventService.getEventById(eventId);
        setEvent(data);
        
        // Fetch plan data if available
        if (data.plan) {
          fetchPlanData(data.plan);
        } else {
          setPlan(null);
        }
        
        // Fetch event equipment
        fetchEventEquipment(eventId);
        
        // Fetch event stats
        fetchEventStats(eventId);
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, isOpen]);
  
  // Fetch plan data
  const fetchPlanData = async (planData) => {
    setPlanLoading(true);
    
    try {
      // If plan is already an object with an _id, use that ID
      const planId = typeof planData === 'object' && planData._id 
        ? planData._id 
        : typeof planData === 'string' 
          ? planData 
          : null;
      
      if (planId) {
        const planDetails = await planService.getPlanById(planId);
        setPlan(planDetails);
      }
    } catch (err) {
      console.error('Error loading plan:', err);
    } finally {
      setPlanLoading(false);
    }
  };
  
  // Fetch event equipment
  const fetchEventEquipment = async (eventId) => {
    setEquipmentLoading(true);
    
    try {
      const data = await equipmentService.getEventEquipment(eventId);
      setEquipment(data);
    } catch (err) {
      console.error('Error loading equipment:', err);
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Fetch event statistics
  const fetchEventStats = async (eventId) => {
    setStatsLoading(true);
    
    try {
      const data = await eventService.getEventStats(eventId);
      setStats(data.statistics);
    } catch (err) {
      console.error('Error loading event stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not set';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormat = start.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const endFormat = end.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `${startFormat} - ${endFormat}`;
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // If loading
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>
            <Skeleton height="30px" width="80%" />
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody p={6}>
            <Stack spacing={4}>
              <Skeleton height="200px" />
              <Stack spacing={2}>
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </Stack>
              <Skeleton height="100px" />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  
  // If error
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody p={6}>
            <Flex direction="column" align="center" justify="center" p={8}>
              <Box as={FiAlertCircle} size="50px" color="red.500" mb={4} />
              <Text fontSize="lg" fontWeight="medium" textAlign="center">
                {error}
              </Text>
              <Button mt={4} colorScheme="teal" onClick={onClose}>
                Close
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  
  // If no event data
  if (!event) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor}
          pr={12}
        >
          <Flex justify="space-between" align="center" wrap="wrap">
            <Text color={textColor} noOfLines={1}>{event.name}</Text>
            <Badge 
              colorScheme={getStatusColorScheme(event.status)} 
              p={2} 
              borderRadius="full"
              textTransform="uppercase"
              fontSize="xs"
              fontWeight="bold"
            >
              {event.status}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          <Tabs colorScheme="teal" variant="enclosed">
            <TabList px={6} pt={4}>
              <Tab>Details</Tab>
              <Tab>Equipment</Tab>
              <Tab>Categories</Tab>
              <Tab>Location</Tab>
              <Tab>Statistics</Tab>
            </TabList>
            
            <TabPanels>
              {/* Details Tab */}
              <TabPanel p={6}>
                <Stack spacing={6}>
                  {/* Hero section with image if available */}
                  {event.imagePath && (
                    <Box 
                      borderRadius="md" 
                      overflow="hidden" 
                      height="200px"
                      position="relative"
                    >
                      <Image 
                        src={getEventImageUrl(event.imagePath)}
                        alt={event.name}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                        fallback={<Skeleton height="200px" />}
                      />
                    </Box>
                  )}

                  
                  {/* Key info section */}
                  <Grid 
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                    p={4}
                    bg={sectionBgColor}
                    borderRadius="md"
                  >
                    <GridItem>
                      <HStack spacing={2} mb={3}>
                        <Box as={FiCalendar} color="teal.500" />
                        <Text fontWeight="medium">Date:</Text>
                        <Text>{formatDateRange(event.startDate, event.endDate)}</Text>
                      </HStack>
                      
                      <HStack spacing={2} mb={3}>
                        <Box as={FiClock} color="teal.500" />
                        <Text fontWeight="medium">Hours:</Text>
                        <Text>{event.openingHours}</Text>
                      </HStack>
                      
                      <HStack spacing={2}>
                        <Box as={FiTag} color="teal.500" />
                        <Text fontWeight="medium">Type:</Text>
                        <Text>{event.type}</Text>
                      </HStack>
                    </GridItem>
                    
                    <GridItem>
                      <HStack spacing={2} mb={3}>
                        <Box as={FiUsers} color="teal.500" />
                        <Text fontWeight="medium">Max Exhibitors:</Text>
                        <Text>{event.maxExhibitors || 'Unlimited'}</Text>
                      </HStack>
                      
                      <HStack spacing={2} mb={3}>
                        <Box as={FiCalendar} color="teal.500" />
                        <Text fontWeight="medium">Registration Deadline:</Text>
                        <Text>{formatDate(event.registrationDeadline)}</Text>
                      </HStack>
                      
                      <HStack spacing={2}>
                        <Box as={FiLayers} color="teal.500" />
                        <Text fontWeight="medium">Floor Plan:</Text>
                        {/* Fixed: Replaced Text with Box for the Skeleton */}
                        {planLoading ? (
                          <Box>
                            <Skeleton width="100px" height="20px" />
                          </Box>
                        ) : plan ? (
                          <Text>{plan.name}</Text>
                        ) : (
                          <Text>None assigned</Text>
                        )}
                      </HStack>
                    </GridItem>
                  </Grid>
                  
                  {/* Plan details section - if a plan is associated */}
                  {plan && (
                    <Box p={4} bg="blue.50" borderRadius="md">
                      <Flex align="center" mb={3}>
                        <Icon as={FiMap} color="blue.500" mr={2} />
                        <Heading as="h3" size="sm">Floor Plan: {plan.name}</Heading>
                      </Flex>
                      <Text fontSize="sm" mb={2}>{plan.description || 'No description available'}</Text>
                      {plan.pdfPath && (
                        <Button 
                          size="sm" 
                          leftIcon={<FiEye />} 
                          colorScheme="blue" 
                          variant="outline"
                          onClick={() => window.open(getPlanFileUrl(plan.pdfPath), '_blank')}
                        >
                          View Floor Plan PDF
                        </Button>
                      )}
                    </Box>
                  )}
                  
                  {/* Description section */}
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Description
                    </Heading>
                    <Text color={secondaryTextColor} whiteSpace="pre-line">
                      {event.description}
                    </Text>
                  </Box>
                  
                  {/* Special conditions if exist */}
                  {event.specialConditions && (
                    <Box>
                      <Heading as="h3" size="md" mb={3}>
                        Special Conditions
                      </Heading>
                      <Text color={secondaryTextColor} whiteSpace="pre-line">
                        {event.specialConditions}
                      </Text>
                    </Box>
                  )}
                </Stack>
              </TabPanel>
              
              {/* Equipment Tab */}
              <TabPanel p={6}>
                <Stack spacing={6}>
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Event Equipment
                    </Heading>
                    
                    {equipmentLoading ? (
                      <Stack spacing={3}>
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                      </Stack>
                    ) : equipment.length === 0 ? (
                      <Alert status="info" borderRadius="md" mb={4}>
                        <AlertIcon />
                        <Box>
                          <Text>No equipment associated with this event</Text>
                          <Text fontSize="sm" mt={1}>
                            Add equipment to enhance your event experience
                          </Text>
                        </Box>
                      </Alert>
                    ) : (
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                        {equipment.map(item => (
                          <Box 
                            key={item._id} 
                            p={3} 
                            borderWidth="1px" 
                            borderColor={borderColor} 
                            borderRadius="md"
                          >
                            <Flex justify="space-between" align="start">
                              <Box>
                                <Flex align="center" mb={1}>
                                  <Text fontWeight="medium" mr={2}>{item.name}</Text>
                                  <Badge colorScheme="purple" fontSize="xs">{item.category || 'General'}</Badge>
                                </Flex>
                                
                                <HStack spacing={2} mb={1}>
                                  <Box as={FiBox} size={14} color="teal.500" />
                                  <Text fontSize="sm">{item.quantity} {item.unit}(s) available</Text>
                                </HStack>
                                
                                <HStack spacing={2}>
                                  <Box as={FiDollarSign} size={14} color="teal.500" />
                                  <Text fontSize="sm">{formatCurrency(item.price)} per {item.unit}</Text>
                                </HStack>
                              </Box>
                              
                               {item.imageUrl && (
                                <Box ml={3} flexShrink={0}>
                                  <Image 
                                    src={getEquipmentImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    boxSize="50px"
                                    objectFit="cover"
                                    borderRadius="md"
                                  />
                                </Box>
                              )}
                            </Flex>
                          </Box>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Stack>
              </TabPanel>
              
              {/* Categories Tab */}
              <TabPanel p={6}>
                <Stack spacing={6}>
                  {/* Visibility */}
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Visibility
                    </Heading>
                    <Badge colorScheme={event.visibility === 'public' ? 'green' : 'purple'}>
                      {event.visibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                    <Text mt={2} color={secondaryTextColor} fontSize="sm">
                      {event.visibility === 'public' 
                        ? 'This event is visible to all exhibitors' 
                        : 'This event is only visible to invited exhibitors'}
                    </Text>
                  </Box>
                  
                  <Divider />
                  
                  {/* Industry Sectors */}
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Industry Sectors
                    </Heading>
                    <Wrap spacing={2}>
                      {event.allowedSectors?.map(sector => (
                        <WrapItem key={sector}>
                          <Tag size="md" borderRadius="full" colorScheme="blue" variant="solid">
                            <TagLabel>{sector}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                  
                  {/* Subsectors */}
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Subsectors
                    </Heading>
                    <Wrap spacing={2}>
                      {event.allowedSubsectors?.map(subsector => (
                        <WrapItem key={subsector}>
                          <Tag size="md" borderRadius="full" colorScheme="teal">
                            <TagLabel>{subsector}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                  
                  {/* Countries Restrictions if any */}
                  {event.allowedCountries && event.allowedCountries.length > 0 && (
                    <Box>
                      <Heading as="h3" size="md" mb={3}>
                        Country Restrictions
                      </Heading>
                      <Wrap spacing={2}>
                        {event.allowedCountries.map(country => (
                          <WrapItem key={country}>
                            <Tag size="md" borderRadius="full" colorScheme="orange">
                              <TagLabel>{country}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}
                </Stack>
              </TabPanel>
              
              {/* Location Tab */}
              <TabPanel p={6}>
                <Stack spacing={6}>
                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Event Location
                    </Heading>
                    <Box p={4} bg={sectionBgColor} borderRadius="md">
                      <HStack spacing={2} mb={2} align="flex-start">
                        <Box as={FiMapPin} mt={1} color="teal.500" />
                        <Text fontWeight="medium">Address:</Text>
                        <Text>{event.location?.address}</Text>
                      </HStack>
                      
                      <HStack spacing={2} mb={2}>
                        <Box width="24px" />
                        <Text fontWeight="medium">City:</Text>
                        <Text>{event.location?.city}</Text>
                      </HStack>
                      
                      <HStack spacing={2} mb={2}>
                        <Box width="24px" />
                        <Text fontWeight="medium">Postal Code:</Text>
                        <Text>{event.location?.postalCode}</Text>
                      </HStack>
                      
                      <HStack spacing={2}>
                        <Box width="24px" />
                        <Text fontWeight="medium">Country:</Text>
                        <Text>{event.location?.country}</Text>
                      </HStack>
                    </Box>
                  </Box>
                </Stack>
              </TabPanel>
              
              {/* Statistics Tab */}
              <TabPanel p={6}>
                <Stack spacing={6}>
                  <Heading as="h3" size="md" mb={3}>
                    Event Statistics
                  </Heading>
                  
                  {statsLoading ? (
                    <Stack spacing={3}>
                      <Skeleton height="80px" />
                      <Skeleton height="80px" />
                    </Stack>
                  ) : !stats ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text>No statistics available</Text>
                        <Text fontSize="sm" mt={1}>
                          Statistics will be available once stands are added to the event
                        </Text>
                      </Box>
                    </Alert>
                  ) : (
                    <>
                      <StatGroup p={4} bg={sectionBgColor} borderRadius="md">
                        <Stat>
                          <StatLabel>Total Stands</StatLabel>
                          <StatNumber>{stats.totalStands || 0}</StatNumber>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Available</StatLabel>
                          <StatNumber>{stats.availableStands || 0}</StatNumber>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Reserved</StatLabel>
                          <StatNumber>{stats.reservedStands || 0}</StatNumber>
                        </Stat>
                      </StatGroup>
                      
                      <StatGroup p={4} bg={sectionBgColor} borderRadius="md">
                        <Stat>
                          <StatLabel>Occupancy Rate</StatLabel>
                          <StatNumber>{stats.occupancyRate || 0}%</StatNumber>
                          <StatHelpText>
                            {stats.reservedStands || 0} of {stats.totalStands || 0} stands reserved
                          </StatHelpText>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Current Revenue</StatLabel>
                          <StatNumber>{formatCurrency(stats.currentRevenue || 0)}</StatNumber>
                          <StatHelpText>
                            {stats.revenuePercentage || 0}% of potential
                          </StatHelpText>
                        </Stat>
                      </StatGroup>
                    </>
                  )}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        
        <Divider />
        
        <Box p={4}>
          <ButtonGroup spacing={3} width="100%" justifyContent="space-between">
            <Box>
              <Button
                leftIcon={<FiEdit />}
                colorScheme="teal"
                variant="outline"
                mr={2}
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
              >
                Edit
              </Button>
           
            </Box>
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="red"
              variant="ghost"
              onClick={() => {
                onClose();
                onDelete(event);
              }}
            >
              Delete
            </Button>
          </ButtonGroup>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;