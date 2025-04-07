// src/pages/organizer/Events.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  Flex,
  Text,
  HStack,
  Tag,
  Icon,
  Badge,
  Card,
  CardBody,
  IconButton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiPlus,
  FiCalendar,
  FiChevronRight,
  FiMapPin,
  FiUsers,
  FiClock,
  FiSettings,
  FiBarChart2,
  FiEdit,
  FiEye,
  FiTrash2,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import TableSearchBar from '../../components/common/ui/TableSearchBar';
import FilterModal from '../../components/common/ui/FilterModal';
import EventFilterForm from '../../components/organizer/events/EventFilterForm';
import EventFormModal from '../../components/organizer/events/EventFormModal';
import EventDetailsModal from '../../components/organizer/events/EventDetailsModal';
import EventStatusModal from '../../components/organizer/events/EventStatusModal';
import useEvents from '../../hooks/useEvents';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/eventConstants';
import { getEventImageUrl } from '../../utils/fileUtils';
import ConfirmDialog from '../../components/common/ui/ConfirmDialog';

// Use proper motion component
const MotionBox = motion.div;

const Events = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewEventId, setViewEventId] = useState(null);
 
  
  // Get events data and functions from custom hook
  const {
    events,
    loading,
    filters,
    updateFilters,
    resetFilters,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    uploadEventImage,
    getActiveFiltersCount,
  } = useEvents();
  
  // Modal states using Chakra's useDisclosure
  const {
    isOpen: isFilterOpen,
    onOpen: onFilterOpen,
    onClose: onFilterClose,
  } = useDisclosure();
  
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();
  
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  
  // Handle view event
  const handleViewEvent = (event) => {
    setViewEventId(event._id);
    onDetailsOpen();
  };
  
  // Handle edit event
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    onEditOpen();
  };
  
  // Handle status change
  const handleStatusChange = (event) => {
    setSelectedEvent(event);
    onStatusOpen();
  };
  
  
  // Handle delete event
  const handleDeleteEvent = (event) => {
    setSelectedEvent(event);
    onDeleteOpen();
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      await deleteEvent(selectedEvent._id);
      onDeleteClose();
      setSelectedEvent(null);
      
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle update status
  const handleUpdateStatus = async (eventId, newStatus, reason) => {
    try {
      await updateEvent(eventId, {
        status: newStatus,
        ...(reason && { statusReason: reason })
      });
      
      toast({
        title: 'Status updated',
        description: `Event status has been updated to ${getStatusDisplayText(newStatus)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };
  
  // Handle form submission (create/edit)
  const handleFormSubmit = async (formData, imageFile, selectedEquipment = []) => {
    try {
      let event;
      
      // Create a copy of the form data and add equipment IDs
      const eventData = { ...formData };
      
      // Add equipment IDs to the eventData object to send to backend
      if (selectedEquipment && selectedEquipment.length > 0) {
        eventData.equipmentIds = selectedEquipment;
      }
      
      if (isEditOpen) {
        // Update the event
        event = await updateEvent(selectedEvent._id, eventData, imageFile);
      } else {
        // Create the event
        event = await createEvent(eventData, imageFile);
      }
      
      // Close modals
      onEditClose();
      onCreateClose();
      setSelectedEvent(null);
      return event;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };
  
  // Handle search
  const handleSearch = (searchText) => {
    updateFilters({ search: searchText });
  };
  
  // Apply filters from modal
  const applyFilters = (newFilters) => {
    updateFilters(newFilters);
    onFilterClose();
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
  
  // Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <DashboardLayout title="Events">
      <Box as="section" py={1} px={2}>
        {/* Breadcrumb and navigation */}
        <Flex mb={6} justifyContent="space-between" alignItems="center">
          <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />}>
          
          </Breadcrumb>
        </Flex>
        
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
              Events
            </Heading>
            <Text color="gray.500">
              Manage your exhibitions, trade shows, and conferences
            </Text>
          </Box>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FiFilter />}
              colorScheme="teal"
              variant="outline"
              onClick={onFilterOpen}
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
            
            <Button
              leftIcon={<FiPlus />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              New Event
            </Button>
          </HStack>
        </Flex>
        
        {/* Search bar */}
        <Box mb={4}>
          <TableSearchBar 
            placeholder="Search by name, location, or description..."
            onSearch={handleSearch}
            value={filters.search}
          />
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
              bg="teal.50" 
              p={3} 
              borderRadius="md"
              position="relative"
            >
              <Text fontWeight="medium" color="teal.700" mr={2}>
                Active filters:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {filters.search && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Search: {filters.search}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ search: '' })} />
                  </Tag>
                )}
                
                {filters.status && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Status: {getStatusDisplayText(filters.status)}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ status: '' })} />
                  </Tag>
                )}
                
                {filters.upcoming && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    Upcoming events only
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ upcoming: false })} />
                  </Tag>
                )}
                
                {filters.startDate && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    From: {new Date(filters.startDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ startDate: '' })} />
                  </Tag>
                )}
                
                {filters.endDate && (
                  <Tag size="md" borderRadius="full" colorScheme="teal" variant="subtle">
                    To: {new Date(filters.endDate).toLocaleDateString()}
                    <Icon as={FiX} ml={1} cursor="pointer" onClick={() => updateFilters({ endDate: '' })} />
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
        <Box mb={6}>
          {loading ? (
            // Loading state
            <Flex justify="center" align="center" my={10}>
              <Text>Loading events...</Text>
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
                  ? "No events match your current filters. Try adjusting your filters or create a new event."
                  : "You haven't created any events yet. Click the button below to get started."}
              </Text>
              <Button 
                colorScheme="teal" 
                leftIcon={<FiPlus />}
                onClick={activeFiltersCount > 0 ? resetFilters : onCreateOpen}
              >
                {activeFiltersCount > 0 ? 'Clear Filters' : 'Create First Event'}
              </Button>
            </Flex>
          ) : (
            // Events grid
            <Box
              display="grid"
              gridTemplateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              {events.map(event => (
                <Card
                  key={event._id}
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "md",
                    borderColor: "teal.300",
                  }}
                  onClick={() => handleViewEvent(event)}
                  cursor="pointer"
                  position="relative"
                >
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
                    {getStatusDisplayText(event.status)}
                  </Badge>
                  
                  {/* Event image if available */}
                  {/* Event image or fallback icon */}
                    <Box height="120px" overflow="hidden" bg="gray.100">
                      {event.imagePath ? (
                        <img 
                          src={getEventImageUrl(event.imagePath)}
                          alt={event.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            // Si l'image ne se charge pas, on affiche l'icône à la place
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" stroke-width="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        // Si aucune image n'est définie, on affiche l'icône directement
                        <Flex height="100%" width="100%" align="center" justify="center">
                          <Icon as={FiCalendar} boxSize="40px" color="gray.400" />
                        </Flex>
                      )}
                    </Box>
                  
                  <CardBody p={4}>
                    <Heading as="h3" size="md" mb={2} noOfLines={2} pr={16}>
                      {event.name}
                    </Heading>
                    
                    <HStack mt={4} spacing={1} color="gray.600">
                      <Icon as={FiCalendar} size={14} />
                      <Text fontSize="sm" fontWeight="medium">
                        {formatDateRange(event.startDate, event.endDate)}
                      </Text>
                    </HStack>
                    
                    <HStack mt={2} spacing={1} color="gray.600">
                      <Icon as={FiMapPin} size={14} />
                      <Text fontSize="sm" noOfLines={1}>
                        {event.location?.city}, {event.location?.country}
                      </Text>
                    </HStack>
                    
                    <HStack mt={2} spacing={1} color="gray.600">
                      <Icon as={FiUsers} size={14} />
                      <Text fontSize="sm">
                        Max: {event.maxExhibitors || 'Unlimited'}
                      </Text>
                    </HStack>
                    
                    <Text mt={4} fontSize="sm" color="gray.500" noOfLines={2}>
                      {event.description}
                    </Text>
                    
                    <Flex mt={6} justifyContent="flex-end">
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Edit event"
                        size="sm"
                        colorScheme="teal"
                        variant="ghost"
                        mr={1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                      />
                      
                      <IconButton
                        icon={<FiSettings />}
                        aria-label="Change status"
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        mr={1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(event);
                        }}
                      />
                      
                      
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete event"
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event);
                        }}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={onFilterClose}
        onApply={applyFilters}
        onReset={resetFilters}
        initialFilters={filters}
        title="Filter Events"
      >
        <EventFilterForm filters={filters} setFilters={updateFilters} />
      </FilterModal>
      
      {/* Create/Edit Event Modal */}
      <EventFormModal
        isOpen={isCreateOpen || isEditOpen}
        onClose={isEditOpen ? onEditClose : onCreateClose}
        event={isEditOpen ? selectedEvent : null}
        onSubmit={handleFormSubmit}
      />
      
      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        eventId={viewEventId}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onChangeStatus={handleStatusChange}
        
      />
      
      {/* Event Status Modal */}
      <EventStatusModal
        isOpen={isStatusOpen}
        onClose={onStatusClose}
        event={selectedEvent}
        onUpdateStatus={handleUpdateStatus}
      />
      
      {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          title="Delete Event"
          body={`Are you sure you want to delete ${selectedEvent?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColorScheme="red"
          onConfirm={confirmDelete}
        />
    </DashboardLayout>
  );
};

export default Events;