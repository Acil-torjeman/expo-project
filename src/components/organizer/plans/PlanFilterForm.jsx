// src/components/organizer/plans/PlanFilterForm.jsx
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

const PlanFilterForm = ({ filters, setFilters }) => {
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <Stack spacing={4}>
      <FormControl mb={4}>
        <FormLabel>Status</FormLabel>
        <Select
          name="isActive"
          value={filters.isActive}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </FormControl>

      <FormControl mb={4}>
        <FormLabel mb={3}>Created Date Range</FormLabel>
        <Stack direction={{ base: "column", md: "row" }} spacing={2}>
          <Box width="full">
            <Text fontSize="sm" fontWeight="medium" mb={1}>From</Text>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate || ''}
              onChange={handleFilterChange}
              placeholder="From"
            />
          </Box>
          <Box width="full">
            <Text fontSize="sm" fontWeight="medium" mb={1}>To</Text>
            <Input
              type="date"
              name="endDate"
              value={filters.endDate || ''}
              onChange={handleFilterChange}
              placeholder="To"
            />
          </Box>
        </Stack>
        <FormHelperText fontSize="xs" color="gray.500">
          Select a date range to filter plans created within that period.
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};

export default PlanFilterForm;