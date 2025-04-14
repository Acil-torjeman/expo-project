// src/components/organizer/registrations/RegistrationFilterForm.jsx
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
} from '@chakra-ui/react';
import { RegistrationStatus } from '../../../constants/registrationConstants';

const RegistrationFilterForm = ({ filters, setFilters, events = [] }) => {
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.500" mb={1}>
        Use filters to find specific registrations based on your criteria
      </Text>
      
      <FormControl mb={4}>
        <FormLabel>Event</FormLabel>
        <Select
          name="event"
          value={filters.event || ''}
          onChange={handleFilterChange}
          placeholder="All events"
        >
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.name}
            </option>
          ))}
        </Select>
        <FormHelperText>Filter by specific event</FormHelperText>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Status</FormLabel>
        <Select
          name="status"
          value={filters.status || ''}
          onChange={handleFilterChange}
          placeholder="All statuses"
        >
          {Object.values(RegistrationStatus).map((value) => (
            <option key={value} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </Select>
        <FormHelperText>Filter by registration status</FormHelperText>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel mb={3}>Date Range</FormLabel>
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
          Filter registrations by their submission date
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};

export default RegistrationFilterForm;