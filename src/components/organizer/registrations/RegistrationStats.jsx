// src/components/organizer/registrations/RegistrationStats.jsx
import React, { useMemo } from 'react';
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiStar } from 'react-icons/fi';
import { RegistrationStatus } from '../../../constants/registrationConstants';

const RegistrationStats = ({ registrations = [] }) => {
  // Calculate stats from registrations
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === RegistrationStatus.PENDING).length;
    const approved = registrations.filter(r => r.status === RegistrationStatus.APPROVED).length;
    const rejected = registrations.filter(r => r.status === RegistrationStatus.REJECTED).length;
    const completed = registrations.filter(r => r.status === RegistrationStatus.COMPLETED).length;
    
    return { total, pending, approved, rejected, completed };
  }, [registrations]);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Stats data
  const statsItems = [
    {
      label: 'Total Registrations',
      value: stats.total,
      icon: FiUsers,
      color: 'blue',
      helpText: 'Total registration requests'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: FiClock,
      color: 'yellow',
      helpText: 'Awaiting your review'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: FiCheckCircle,
      color: 'green',
      helpText: 'Approved registrations'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: FiXCircle,
      color: 'red',
      helpText: 'Rejected registrations'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: FiStar,
      color: 'purple',
      helpText: 'Fully completed registrations'
    }
  ];
  
  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
      {statsItems.map((stat, index) => (
        <Box
          key={index}
          bg={bgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Stat>
              <StatLabel color="gray.500">{stat.label}</StatLabel>
              <StatNumber>{stat.value}</StatNumber>
              <StatHelpText>{stat.helpText}</StatHelpText>
            </Stat>
            <Icon 
              as={stat.icon} 
              boxSize={10} 
              color={`${stat.color}.400`} 
              opacity={0.8} 
            />
          </Flex>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default RegistrationStats;