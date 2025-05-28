// src/pages/admin/Dashboard.jsx
import React from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Card,
  CardBody,
  Avatar,
  Button,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FiUsers, FiUserCheck, FiUserX, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import useUsers from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';

const MotionCard = motion(Card);

const Dashboard = () => {
  const { user } = useAuth();
  const { users, loading } = useUsers();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, teal.400, teal.600)',
    'linear(to-r, teal.600, teal.800)'
  );
  
  const activeUsers = users.filter(u => u.status === 'active');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const recentUsers = users.slice(0, 5);
  
  const stats = [
    { label: 'Total Users', value: users.length, icon: FiUsers, color: 'blue' },
    { label: 'Active Users', value: activeUsers.length, icon: FiUserCheck, color: 'green' },
    { label: 'Pending Approval', value: pendingUsers.length, icon: FiUserX, color: 'orange' },
    { label: 'Growth', value: '+12%', icon: FiTrendingUp, color: 'purple' },
  ];

  return (
    <DashboardLayout>
      <Box p={6} minH="100vh">
        {/* Welcome Header */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bgGradient={gradientBg}
          color="white"
          mb={8}
        >
          <CardBody p={8}>
            <Flex align="center" justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="xl">Welcome back, {user?.username}!</Heading>
                <Text fontSize="lg" opacity={0.9}>
                  Here's what's happening on your platform today
                </Text>
              </VStack>
              <Avatar size="xl" name={user?.username} bg="whiteAlpha.200" />
            </Flex>
          </CardBody>
        </MotionCard>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {stats.map((stat, index) => (
            <MotionCard
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              bg={cardBg}
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              cursor="pointer"
            >
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm">
                      {stat.label}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {loading ? '...' : stat.value}
                    </Text>
                  </VStack>
                  <Box
                    p={3}
                    borderRadius="full"
                    bg={`${stat.color}.100`}
                    color={`${stat.color}.600`}
                  >
                    <Icon as={stat.icon} boxSize={6} />
                  </Box>
                </HStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>

        {/* Recent Users */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          bg={cardBg}
        >
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md">Recent Users</Heading>
              <Button colorScheme="teal" variant="ghost" size="sm">
                View All
              </Button>
            </Flex>
            
            <VStack spacing={4} align="stretch">
              {recentUsers.map((recentUser, index) => (
                <MotionCard
                  key={recentUser._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  variant="outline"
                  size="sm"
                >
                  <CardBody py={3}>
                    <HStack justify="space-between">
                      <HStack>
                        <Avatar size="sm" name={recentUser.username} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{recentUser.username}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {recentUser.email}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <Badge colorScheme="teal" variant="subtle">
                          {recentUser.role}
                        </Badge>
                        <Badge
                          colorScheme={
                            recentUser.status === 'active' ? 'green' : 'orange'
                          }
                        >
                          {recentUser.status}
                        </Badge>
                      </HStack>
                    </HStack>
                  </CardBody>
                </MotionCard>
              ))}
            </VStack>
          </CardBody>
        </MotionCard>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;