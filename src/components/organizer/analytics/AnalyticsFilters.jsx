// src/components/organizer/analytics/AnalyticsFilters.jsx
import React from 'react';
import {
  Flex,
  Box,
  Select,
  FormControl,
  FormLabel,
  Button,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';

const AnalyticsFilters = ({ events, filters, updateFilters, refreshData }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bgColor} 
      p={4} 
      borderRadius="lg" 
      borderWidth="1px" 
      borderColor={borderColor}
      mb={4}
    >
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="flex-end">
        <FormControl>
          <FormLabel>Event</FormLabel>
          <Select
            value={filters.eventId}
            onChange={(e) => updateFilters({ eventId: e.target.value })}
            placeholder="All Events"
          >
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Time Period</FormLabel>
          <Select
            value={filters.period}
            onChange={(e) => updateFilters({ period: e.target.value })}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </Select>
        </FormControl>
        
        <Button 
          leftIcon={<Icon as={FiRefreshCw} />} 
          colorScheme="teal" 
          onClick={refreshData}
        >
          Refresh
        </Button>
      </Flex>
    </Box>
  );
};

export default AnalyticsFilters;