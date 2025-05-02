// src/components/organizer/analytics/ChartContainer.jsx
import React from 'react';
import {
  Box,
  Heading,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

const ChartContainer = ({ title, description, children, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      {...props}
    >
      <Heading size="md" mb={description ? 1 : 3}>{title}</Heading>
      {description && <Text color="gray.500" mb={3} fontSize="sm">{description}</Text>}
      {children}
    </Box>
  );
};

export default ChartContainer;