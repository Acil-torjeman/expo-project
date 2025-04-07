// src/components/organizer/events/EventFilterForm.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Stack,
  Input,
  FormHelperText,
  Text,
  Box,
  Switch,
  Flex,
  Checkbox,
} from '@chakra-ui/react';
import { EventStatus } from '../../../constants/eventConstants';

const EventFilterForm = ({ filters, setFilters }) => {
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Handle switch/checkbox change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFilters({ ...filters, [name]: checked });
  };

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.500" mb={1}>
        Use filters to find specific events based on your criteria
      </Text>
      
      <FormControl mb={4}>
        <FormLabel>Status</FormLabel>
        <Select
          name="status"
          value={filters.status || ''}
          onChange={handleFilterChange}
          placeholder="All statuses"
        >
          {Object.values(EventStatus).map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="upcoming" mb="0">
          Upcoming Events Only
        </FormLabel>
        <Checkbox
          id="upcoming"
          name="upcoming"
          isChecked={filters.upcoming}
          onChange={handleSwitchChange}
          colorScheme="teal"
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel mb={3}>Event Date Range</FormLabel>
        <Stack direction={{ base: "column", md: "row" }} spacing={2}>
          <Box width="full">
            <Text fontSize="sm" fontWeight="medium" mb={1}>From</Text>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate || ''}
              onChange={handleFilterChange}
              placeholder="Start date"
            />
          </Box>
          <Box width="full">
            <Text fontSize="sm" fontWeight="medium" mb={1}>To</Text>
            <Input
              type="date"
              name="endDate"
              value={filters.endDate || ''}
              onChange={handleFilterChange}
              placeholder="End date"
            />
          </Box>
        </Stack>
        <FormHelperText fontSize="xs" color="gray.500">
          Filter events by their start date
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};

export default EventFilterForm;