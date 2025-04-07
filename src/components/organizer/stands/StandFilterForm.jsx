// src/components/organizer/stands/StandFilterForm.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import { StandStatus, StandType } from '../../../constants/standConstants';

const StandFilterForm = ({ filters, setFilters }) => {
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.500" mb={1}>
        Use these filters to narrow down the list of stands
      </Text>
      
      <FormControl mb={4}>
        <FormLabel>Status</FormLabel>
        <Select
          name="status"
          value={filters.status || ''}
          onChange={handleFilterChange}
          placeholder="All statuses"
        >
          {Object.values(StandStatus).map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Type</FormLabel>
        <Select
          name="type"
          value={filters.type || ''}
          onChange={handleFilterChange}
          placeholder="All types"
        >
          {Object.values(StandType).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default StandFilterForm;