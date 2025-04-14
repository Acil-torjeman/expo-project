// src/components/exhibitor/events/EventFilterForm.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Switch,
  Stack,
  Text,
} from '@chakra-ui/react';
import { getAllSectors } from '../../../constants/industrySectors';

const EventFilterForm = ({ tempFilters, setTempFilters }) => {
  // Get all industry sectors for filter dropdown
  const allSectors = getAllSectors();

  // Handle filter changes without immediately applying them
  const handleFilterChange = (name, value) => {
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.500" mb={1}>
        Use filters to find specific events based on your criteria
      </Text>
      
      <FormControl mb={4}>
        <FormLabel>Industry Sector</FormLabel>
        <Select
          value={tempFilters.sector || ''}
          onChange={(e) => handleFilterChange('sector', e.target.value)}
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
          isChecked={!tempFilters.upcoming}
          onChange={(e) => handleFilterChange('upcoming', !e.target.checked)}
          colorScheme="teal"
        />
      </FormControl>
    </Stack>
  );
};

export default EventFilterForm;