// src/components/exhibitor/registrations/EquipmentCard.jsx
import React from 'react';
import {
  Box, Image, Badge, Text, Flex, 
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
  Tooltip, HStack, Icon, useColorModeValue
} from '@chakra-ui/react';
import { FiPackage, FiInfo } from 'react-icons/fi';
import { getEquipmentImageUrl } from '../../../utils/fileUtils';

const EquipmentCard = ({ 
  equipment, 
  isSelected = false, 
  quantity = 0, 
  availableQuantity = 0,
  onSelect, 
  onUpdateQuantity,
  isReadOnly = false
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBg = useColorModeValue('teal.50', 'teal.900');
  const borderColor = isSelected 
    ? useColorModeValue('teal.500', 'teal.400') 
    : useColorModeValue('gray.200', 'gray.600');
  
  const handleSelect = () => {
    if (!isReadOnly && availableQuantity > 0) {
      onSelect(equipment._id);
    }
  };
  
  const handleQuantityChange = (valueAsString, valueAsNumber) => {
    const newQuantity = Math.min(valueAsNumber, availableQuantity);
    onUpdateQuantity(equipment._id, newQuantity);
  };
  
  const isOutOfStock = availableQuantity === 0;
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      borderColor={borderColor}
      bg={isSelected ? selectedBg : cardBg}
      transition="all 0.2s"
      _hover={{ 
        transform: isReadOnly || isOutOfStock ? 'none' : 'translateY(-4px)',
        boxShadow: isReadOnly || isOutOfStock ? 'none' : 'md'
      }}
      opacity={isOutOfStock ? 0.6 : 1}
      cursor={isReadOnly || isOutOfStock ? 'default' : 'pointer'}
      onClick={isOutOfStock ? undefined : handleSelect}
      position="relative"
    >
      {/* Image - Square format */}
      <Box position="relative" width="100%" pb="100%" /* 1:1 aspect ratio */>
        <Image 
          src={equipment.imageUrl ? getEquipmentImageUrl(equipment.imageUrl) : undefined} 
          alt={equipment.name}
          objectFit="cover"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          fallback={
            <Flex 
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              align="center" 
              justify="center" 
              bg="gray.100"
            >
              <Icon as={FiPackage} boxSize={10} color="gray.400" />
            </Flex>
          }
        />
        
        {isOutOfStock && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            justify="center"
            align="center"
            bg="blackAlpha.600"
            color="white"
          >
            <Text fontWeight="bold" fontSize="xl">OUT OF STOCK</Text>
          </Flex>
        )}
        
        <Badge 
          position="absolute" 
          top="2" 
          right="2" 
          colorScheme="blue"
          fontSize="sm"
          px="2"
          borderRadius="full"
        >
          {equipment.category || equipment.type}
        </Badge>
      </Box>
      
      {/* Content */}
      <Box p="4">
        <Text fontWeight="bold" fontSize="lg" mb="1" noOfLines={1}>
          {equipment.name}
        </Text>
        
        <HStack mb="2">
          <Badge colorScheme="green">${equipment.price} / {equipment.unit || 'unit'}</Badge>
          <Tooltip label={isOutOfStock ? "Out of stock" : `${availableQuantity} units available`}>
            <Badge 
              colorScheme={isOutOfStock ? "red" : "blue"} 
              display="flex" 
              alignItems="center"
            >
              <FiInfo style={{ marginRight: '4px' }} />
              {availableQuantity} available
            </Badge>
          </Tooltip>
        </HStack>
        
        <Text fontSize="sm" color="gray.500" mb="3" noOfLines={2}>
          {equipment.description}
        </Text>
        
        {/* Quantity selector - only shown when item is selected */}
        {isSelected && !isReadOnly && (
          <HStack mt="2" onClick={e => e.stopPropagation()}>
            <Text fontWeight="medium">Quantity:</Text>
            <NumberInput 
              min={1} 
              max={availableQuantity} 
              value={quantity}
              onChange={handleQuantityChange}
              size="sm"
              w="80px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        )}
        
        {/* Display-only quantity for read-only mode */}
        {isSelected && isReadOnly && (
          <HStack mt="2">
            <Text fontWeight="medium">Quantity:</Text>
            <Text>{quantity}</Text>
          </HStack>
        )}
      </Box>
    </Box>
  );
};

export default EquipmentCard;