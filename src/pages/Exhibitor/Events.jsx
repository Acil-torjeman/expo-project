// src/pages/exhibitor/Events.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  Badge,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiSearch,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import FilterModal from '../../components/common/ui/FilterModal';
import { getStatusColorScheme } from '../../constants/eventConstants';
import { getEventImageUrl } from '../../utils/fileUtils';
import { getAllSectors } from '../../constants/industrySectors';
import eventService from '../../services/event.service';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const ExhibitorEvents = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // States
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    upcoming: true,
  });
  
  // Filter modal state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get sectors for filter
  const allSectors = getAllSectors();
  
  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const filterBg = useColorModeValue('teal.50', 'rgba(49, 151, 149, 0.2)');
  const filterTextColor = useColorModeValue('teal.700', 'teal.200');
  
  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [filters]);
  
  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getPublicEvents(
        filters.search,
        filters.sector,
        filters.upcoming
      );
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (searchText) => {
    updateFilters({ search: searchText });
  };
  
  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      sector: '',
      upcoming: true,
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'sector') return value !== '';
      if (key === 'upcoming') return value === false; // Default is true
      return false;
    }).length;
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <DashboardLayout title="Available Events">
      <Box as="section" py={4} px={2}>
        {/* Header */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          gap={4}
        >
          <Box>
            <Heading size="lg" fontWeight="bold" mb={1}>
              Available Events
            </Heading>
            <Text color="gray.500">
              Browse exhibitions, trade shows, and conferences
            </Text>
          </Box>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FiFilter />}
              colorScheme="teal"
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              position="relative"
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  colorScheme="teal"
                  borderRadius="full"
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  boxSize="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="teal"
              variant="ghost"
              onClick={fetchEvents}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, location, or description..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={borderColor}
            />
          </InputGroup>
        </Box>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Flex 
              mb={4} 
              flexWrap="wrap" 
              alignItems="center" 
              bg={filterBg}
              p={3} 
              borderRadius="md"
              position="relative"
            >
              <Text fontWeight="medium" color={filterTextColor} mr={2}>
                Active filters:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {filters.search && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Search: {filters.search}
                    <Icon 
                      as={FiX} 
                      ml={1} 
                      cursor="pointer" 
                      onClick={() => updateFilters({ search: '' })}
                    />
                  </Tag>
                )}
                
                {filters.sector && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Sector: {allSectors.find(s => s.id === filters.sector)?.name || filters.sector}
                    <Icon 
                      as={FiX} 
                      ml={1} 
                      cursor="pointer" 
                      onClick={() => updateFilters({ sector: '' })}
                    />
                  </Tag>
                )}
                
                {filters.upcoming === false && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Show past events
                    <Icon 
                      as={FiX} 
                      ml={1} 
                      cursor="pointer" 
                      onClick={() => updateFilters({ upcoming: true })}
                    />
                  </Tag>
                )}
              </HStack>
              
              <Button 
                size="xs" 
                colorScheme="teal" 
                variant="link" 
                onClick={resetFilters}
                position={{ base: 'static', md: 'absolute' }}
                right="12px"
                mt={{ base: 2, md: 0 }}
                ml={{ base: 'auto', md: 0 }}
              >
                Clear all
              </Button>
            </Flex>
          </MotionBox>
        )}
        
        {/* Events Grid */}
        {loading ? (
          // Loading state
          <Flex justify="center" align="center" my={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text>Loading events...</Text>
            </VStack>
          </Flex>
        ) : events.length === 0 ? (
          // Empty state
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            bg={cardBg} 
            p={10} 
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Icon as={FiCalendar} boxSize={10} color="gray.400" mb={4} />
            <Heading size="md" mb={2} textAlign="center">No Events Found</Heading>
            <Text color="gray.500" textAlign="center" maxW="md" mb={6}>
              {activeFiltersCount > 0 
                ? "No events match your current filters. Try adjusting your filters."
                : "There are no events available at the moment. Please check back later."}
            </Text>
            {activeFiltersCount > 0 && (
              <Button 
                colorScheme="teal" 
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            )}
          </Flex>
        ) : (
          // Events grid with animation
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={4}>
              {events.map((event, index) => (
                <MotionFlex
                  key={event._id}
                  direction="column"
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  height="100%"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "lg", 
                    borderColor: "teal.500",
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  cursor="pointer"
                  onClick={() => navigate(`/exhibitor/events/${event._id}`)}
                >
                  {/* Event image with gradient overlay */}
                  <Box 
                    height="160px" 
                    overflow="hidden" 
                    position="relative"
                    bg="gray.100"
                  >
                    {event.imagePath ? (
                      <Box
                        as="img"
                        src={getEventImageUrl(event.imagePath)}
                        alt={event.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        transition="transform 0.5s"
                        _groupHover={{ transform: 'scale(1.05)' }}
                      />
                    ) : (
                      <Flex height="100%" width="100%" align="center" justify="center">
                        <Icon as={FiCalendar} boxSize="40px" color="gray.400" />
                      </Flex>
                    )}
                    
                    {/* Gradient overlay */}
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bgGradient="linear(to-t, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)"
                    />
                    
                    {/* Event date badge */}
                    <HStack
                      position="absolute"
                      bottom="4"
                      left="4"
                      bg="rgba(0,0,0,0.7)"
                      color="white"
                      borderRadius="md"
                      px={2}
                      py={1}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      <Icon as={FiCalendar} />
                      <Text>
                        {formatDate(event.startDate)}
                      </Text>
                    </HStack>
                    
                    {/* Status badge */}
                    <Badge
                      colorScheme={getStatusColorScheme(event.status)}
                      position="absolute"
                      top={3}
                      right={3}
                      px={2}
                      py={1}
                      borderRadius="full"
                      textTransform="uppercase"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {event.status}
                    </Badge>
                  </Box>
                  
                  <Flex 
                    direction="column" 
                    p={4} 
                    flex="1"
                    borderTop="1px"
                    borderColor={borderColor}
                  >
                    <Heading as="h3" size="md" mb={2} noOfLines={2}>
                      {event.name}
                    </Heading>
                    
                    <Text fontSize="sm" color={mutedColor} noOfLines={2} mb={4}>
                      {event.description}
                    </Text>
                    
                    <Box mt="auto">
                      <HStack spacing={1} color={mutedColor} mb={2}>
                        <Icon as={FiMapPin} size={14} />
                        <Text fontSize="sm" noOfLines={1}>
                          {event.location?.city}, {event.location?.country}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={1} color={mutedColor}>
                        <Icon as={FiClock} size={14} />
                        <Text fontSize="sm">
                          {event.openingHours}
                        </Text>
                      </HStack>
                    </Box>
                    
                    {/* Event organizer tag */}
                    <Flex mt={4} justifyContent="flex-end">
                      <Tag size="sm" colorScheme="gray" borderRadius="full">
                        {event.organizer?.username || 'Unknown organizer'}
                      </Tag>
                    </Flex>
                  </Flex>
                </MotionFlex>
              ))}
            </SimpleGrid>
          </MotionBox>
        )}
      </Box>
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={updateFilters}
        onReset={resetFilters}
        initialFilters={filters}
        title="Filter Events"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color="gray.500" mb={1}>
            Use filters to find specific events based on your criteria
          </Text>
          
          <FormControl mb={4}>
            <FormLabel>Industry Sector</FormLabel>
            <Select
              name="sector"
              value={filters.sector || ''}
              onChange={(e) => updateFilters({ sector: e.target.value })}
              placeholder="All sectors"
            >
              {allSectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="upcoming" mb="0">
              Show past events
            </FormLabel>
            <Switch
              id="upcoming"
              name="upcoming"
              isChecked={!filters.upcoming}
              onChange={(e) => updateFilters({ upcoming: !e.target.checked })}
              colorScheme="teal"
            />
          </FormControl>
        </VStack>
      </FilterModal>
    </DashboardLayout>
  );
};

export default ExhibitorEvents;