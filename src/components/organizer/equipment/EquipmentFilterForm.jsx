// src/components/organizer/equipment/EquipmentFilterForm.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Stack,
} from '@chakra-ui/react';

// Equipment categories
const EQUIPMENT_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'stand', label: 'Stand' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'audio_visual', label: 'Audio-Visual' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'connectivity', label: 'Connectivity' },
  { value: 'other', label: 'Other' },
];

const EquipmentFilterForm = ({ filters, setFilters }) => {
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <Stack spacing={4}>
      <FormControl mb={4}>
        <FormLabel>Category</FormLabel>
        <Select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          {EQUIPMENT_CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Availability</FormLabel>
        <Select
          name="isAvailable"
          value={filters.isAvailable}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </Select>
      </FormControl>
    </Stack>
  );
};

export default EquipmentFilterForm;