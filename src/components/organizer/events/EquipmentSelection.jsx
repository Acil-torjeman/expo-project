// src/components/organizer/events/EquipmentSelection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Grid,
  Flex,
  Checkbox,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Skeleton,
  Badge,
  Alert,
  AlertIcon,
  FormControl,
  Select,
  useColorModeValue,
  HStack,
  Avatar
} from '@chakra-ui/react';
import { FiSearch, FiBox, FiDollarSign } from 'react-icons/fi';
import equipmentService from '../../../services/equipment.service';
import { getEquipmentImageUrl } from '../../../utils/fileUtils';

const EquipmentSelection = ({ 
  selectedEquipment = [], 
  onEquipmentChange,
  readOnly = false 
}) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    category: ''
  });
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const selectedBg = useColorModeValue('teal.50', 'teal.900');
  const selectedBorder = useColorModeValue('teal.300', 'teal.600');
  
  // Fetch equipment
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      
      try {
        const data = await equipmentService.getOrganizerEquipment();
        setEquipment(data || []);
      } catch (err) {
        console.error('Error loading equipment:', err);
        setError(err.message || 'Failed to load equipment');
        setEquipment([]); // Set empty array to avoid null errors
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);
  
  // Handle equipment selection
  const handleEquipmentChange = (equipmentId) => {
    if (readOnly) return;
    
    onEquipmentChange(prev => {
      // Convert to string for consistent comparison
      const stringId = String(equipmentId);
      const prevIds = prev.map(id => String(id));
      
      if (prevIds.includes(stringId)) {
        return prev.filter(id => String(id) !== stringId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    // Apply category filter
    if (filter.category && item.category !== filter.category) {
      return false;
    }
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Get unique categories
  const categories = [...new Set(equipment.map(item => item.category).filter(Boolean))];
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </Stack>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }
  
  if (equipment.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text>No equipment available</Text>
          <Text fontSize="sm" mt={1}>
            You need to add equipment in the Equipment section first
          </Text>
        </Box>
      </Alert>
    );
  }

  return (
    <Stack spacing={4}>
      {!readOnly && (
        <Flex gap={3} mb={2} direction={{ base: "column", md: "row" }}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              name="search"
              placeholder="Search equipment..."
              value={filter.search}
              onChange={handleFilterChange}
            />
          </InputGroup>
          
          <FormControl maxW={{ md: "200px" }}>
            <Select
              name="category"
              placeholder="All categories"
              value={filter.category}
              onChange={handleFilterChange}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>
        </Flex>
      )}
      
      {filteredEquipment.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>No equipment matches your filters</Text>
        </Alert>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          {filteredEquipment.map(item => {
            // Convert to string for consistent comparison
            const itemId = String(item._id);
            const isSelected = selectedEquipment?.some(id => String(id) === itemId);
            
            return (
              <Box 
                key={item._id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
                borderColor={isSelected ? selectedBorder : borderColor}
                bg={isSelected ? selectedBg : bgColor}
                _hover={{ borderColor: readOnly ? borderColor : "teal.300" }}
                transition="all 0.2s"
                cursor={readOnly ? "default" : "pointer"}
                onClick={() => handleEquipmentChange(item._id)}
              >
                <Flex justify="space-between" align="start">
                  <Box>
                    <Flex align="center" mb={1}>
                      {!readOnly && (
                        <Checkbox 
                          isChecked={isSelected}
                          colorScheme="teal"
                          mr={2}
                          onChange={(e) => e.stopPropagation()}
                          isReadOnly
                        />
                      )}
                      <Text fontWeight="medium">{item.name}</Text>
                      {item.category && (
                        <Badge ml={2} colorScheme="purple" fontSize="xs">
                          {item.category}
                        </Badge>
                      )}
                    </Flex>
                    
                    <HStack spacing={2} mb={1}>
                      <Box as={FiBox} size={14} color="teal.500" />
                      <Text fontSize="sm">{item.quantity} {item.unit}(s) available</Text>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Box as={FiDollarSign} size={14} color="teal.500" />
                      <Text fontSize="sm">{formatCurrency(item.price)} per {item.unit}</Text>
                    </HStack>
                  </Box>
                  
                  {item.imageUrl && (
                    <Avatar 
                      size="sm"
                      src={getEquipmentImageUrl(item.imageUrl)}
                      mr={2}
                    />
                  )}
                </Flex>
              </Box>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
};

export default EquipmentSelection;