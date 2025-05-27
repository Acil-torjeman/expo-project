// src/components/organizer/analytics/KpiCard.jsx
import React from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

const KpiCard = ({ 
  title, 
  value, 
  unit = '', 
  icon, 
  color = 'teal',
  ...props 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const formattedValue = () => {
    if (unit === 'hours') {
      return `${value} hrs`;
    }
    if (unit === 'percent') {
      return `${value}%`;
    }
    if (unit === 'currency') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === 'count') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Box 
      bg={bgColor} 
      p={4} 
      borderRadius="lg" 
      borderWidth="1px" 
      borderColor={borderColor}
      boxShadow="sm"
      position="relative"
      overflow="hidden"
      {...props}
    >
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        h="4px" 
        w="100%" 
        bg={`${color}.500`} 
      />
      
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
            {formattedValue()}
          </StatNumber>
        </Stat>
        {icon && (
          <Flex
            w="40px"
            h="40px"
            bg={`${color}.100`}
            color={`${color}.600`}
            borderRadius="full"
            justify="center"
            align="center"
          >
            <Icon as={icon} boxSize={5} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default KpiCard;