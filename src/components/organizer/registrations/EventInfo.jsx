// src/components/organizer/registrations/EventInfo.jsx
import React from 'react';
import {
  Box,
  Text,
  Badge,
  Flex,
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { getEventImageUrl } from '../../../utils/fileUtils';

const EventInfo = ({ event }) => {
  if (!event) return null;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      overflow="hidden"
    >
      {/* Event image if available */}
      {event.imagePath && (
        <Box height="100px" position="relative">
          <Box
            bgImage={`url(${getEventImageUrl(event.imagePath)})`}
            bgPosition="center"
            bgSize="cover"
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
          />
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.3)"
          />
        </Box>
      )}
      
      <Box p={3}>
        <Text fontWeight="bold" mb={1}>
          {event.name}
        </Text>
        
        <Badge colorScheme={event.status === 'published' ? 'green' : 'gray'} mb={2}>
          {event.status}
        </Badge>
        
        <HStack fontSize="sm" color="gray.600" mb={1}>
          <Icon as={FiCalendar} />
          <Text>{formatDateRange(event.startDate, event.endDate)}</Text>
        </HStack>
        
        <HStack fontSize="sm" color="gray.600" mb={1}>
          <Icon as={FiMapPin} />
          <Text>{event.location?.city}, {event.location?.country}</Text>
        </HStack>
        
        <HStack fontSize="sm" color="gray.600">
          <Icon as={FiClock} />
          <Text>{event.openingHours}</Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default EventInfo;