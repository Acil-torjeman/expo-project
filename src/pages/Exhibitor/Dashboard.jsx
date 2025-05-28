// src/pages/Exhibitor/Dashboard.jsx
import React, { useState, useEffect } from 'react';
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
  Divider,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiSearch,
  FiArrowRight,
  FiPackage,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import registrationService from '../../services/registration.service';
import eventService from '../../services/event.service';
import { useAuth } from '../../context/AuthContext';

const MotionCard = motion(Card);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, teal.400, teal.600)',
    'linear(to-r, teal.600, teal.800)'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRegistrations, availableEvents] = await Promise.all([
          registrationService.getMyRegistrations(),
          eventService.getPublicEvents(),
        ]);
        
        setRegistrations(userRegistrations);
        setPublicEvents(availableEvents.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedRegistrations = registrations.filter(r => r.status === 'completed');
  const pendingRegistrations = registrations.filter(r => r.status === 'pending');

  const stats = [
    {
      label: 'Total Registrations',
      value: registrations.length,
      icon: FiCalendar,
      color: 'blue',
    },
    {
      label: 'Completed',
      value: completedRegistrations.length,
      icon: FiCheckCircle,
      color: 'green',
    },
    {
      label: 'Pending',
      value: pendingRegistrations.length,
      icon: FiClock,
      color: 'orange',
    },
  ];

  return (
    <DashboardLayout>
      <Box p={{ base: 4, md: 6 }} minH="100vh">
        {/* Welcome Header */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bgGradient={gradientBg}
          color="white"
          mb={8}
        >
          <CardBody p={{ base: 6, md: 8 }}>
            <Flex align="center" justify="space-between" direction={{ base: "column", md: "row" }} textAlign={{ base: "center", md: "left" }}>
              <VStack align={{ base: "center", md: "start" }} spacing={3} mb={{ base: 4, md: 0 }}>
                <Heading size={{ base: "lg", md: "xl" }}>Welcome, {user?.username}!</Heading>
                <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9}>
                  Discover events and grow your business
                </Text>
                <HStack spacing={{ base: 4, md: 6 }} flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                  <HStack>
                    <Icon as={FiPackage} />
                    <Text fontSize={{ base: "sm", md: "md" }}>Exhibitor</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} />
                    <Text fontSize={{ base: "sm", md: "md" }}>{registrations.length} Registrations</Text>
                  </HStack>
                </HStack>
              </VStack>
              <Avatar size={{ base: "lg", md: "xl" }} name={user?.username} bg="whiteAlpha.200" />
            </Flex>
          </CardBody>
        </MotionCard>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {stats.map((stat, index) => (
            <MotionCard
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              bg={cardBg}
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
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

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* My Registrations */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            bg={cardBg}
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">My Registrations</Heading>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="teal"
                  onClick={() => navigate('/exhibitor/registrations')}
                >
                  View All
                </Button>
              </Flex>

              {loading ? (
                <Text color="gray.500">Loading...</Text>
              ) : registrations.length === 0 ? (
                <VStack py={6} spacing={3}>
                  <Icon as={FiCalendar} boxSize={8} color="gray.400" />
                  <Text color="gray.500" textAlign="center">
                    No registrations yet
                  </Text>
                  <Button
                    size="sm"
                    leftIcon={<FiSearch />}
                    colorScheme="teal"
                    onClick={() => navigate('/exhibitor/events')}
                  >
                    Browse Events
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  {registrations.slice(0, 3).map((registration, index) => (
                    <MotionCard
                      key={registration._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      variant="outline"
                      size="sm"
                    >
                      <CardBody py={3} px={{ base: 3, md: 4 }}>
                        <VStack align="start" spacing={2}>
                          <Flex justify="space-between" w="full" align="start">
                            <Text fontWeight="medium" noOfLines={1} fontSize={{ base: "sm", md: "md" }} flex="1" mr={2}>
                              {registration.event?.name || 'Event'}
                            </Text>
                            <Badge
                              colorScheme={
                                registration.status === 'completed'
                                  ? 'blue'
                                  : registration.status === 'approved'
                                  ? 'green'
                                  : 'orange'
                              }
                              size="sm"
                            >
                              {registration.status}
                            </Badge>
                          </Flex>
                          {registration.event && (
                            <Text fontSize="xs" color="gray.500">
                              {new Date(registration.event.startDate).toLocaleDateString()} 
                              {' - '}
                              {registration.event.location?.city}
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </VStack>
              )}
            </CardBody>
          </MotionCard>

          {/* Available Events */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg={cardBg}
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Available Events</Heading>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="teal"
                  onClick={() => navigate('/exhibitor/events')}
                >
                  Browse All
                </Button>
              </Flex>

              {loading ? (
                <Text color="gray.500">Loading...</Text>
              ) : publicEvents.length === 0 ? (
                <VStack py={6} spacing={3}>
                  <Icon as={FiSearch} boxSize={8} color="gray.400" />
                  <Text color="gray.500" textAlign="center">
                    No events available
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  {publicEvents.map((event, index) => (
                    <MotionCard
                      key={event._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      variant="outline"
                      size="sm"
                      cursor="pointer"
                      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                      onClick={() => navigate(`/exhibitor/events/${event._id}`)}
                    >
                      <CardBody py={3} px={{ base: 3, md: 4 }}>
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="md"
                              bg="teal.100"
                              color="teal.600"
                            >
                              <Icon as={FiCalendar} boxSize={4} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" noOfLines={1} fontSize={{ base: "sm", md: "md" }}>
                                {event.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {event.location?.city}, {event.location?.country}
                              </Text>
                            </VStack>
                          </HStack>
                          <Icon as={FiArrowRight} color="gray.400" display={{ base: "none", md: "block" }} />
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </VStack>
              )}
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Quick Actions */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          bg={cardBg}
          mt={6}
        >
          <CardBody>
            <Heading size="md" mb={4}>
              Quick Actions
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              <Button
                h={{ base: 12, md: 16 }}
                leftIcon={<FiSearch />}
                colorScheme="teal"
                variant="outline"
                fontSize={{ base: "sm", md: "md" }}
                onClick={() => navigate('/exhibitor/events')}
              >
                Browse Events
              </Button>
              <Button
                h={{ base: 12, md: 16 }}
                leftIcon={<FiCalendar />}
                colorScheme="blue"
                variant="outline"
                fontSize={{ base: "sm", md: "md" }}
                onClick={() => navigate('/exhibitor/registrations')}
              >
                My Registrations
              </Button>
              <Button
                h={{ base: 12, md: 16 }}
                leftIcon={<FiUser />}
                colorScheme="purple"
                variant="outline"
                fontSize={{ base: "sm", md: "md" }}
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </Button>
            </SimpleGrid>
          </CardBody>
        </MotionCard>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;