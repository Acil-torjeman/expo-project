// src/pages/organizer/Dashboard.jsx
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
  Divider,
  Stack,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiMap,
  FiUsers,
  FiSettings,
  FiPlus,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import useEvents from '../../hooks/useEvents';
import usePlans from '../../hooks/usePlans';
import useRegistrations from '../../hooks/useRegistrations';
import { useAuth } from '../../context/AuthContext';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/eventConstants';

const MotionCard = motion(Card);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvents();
  const { plans, loading: plansLoading } = usePlans();
  const { registrations, loading: registrationsLoading } = useRegistrations();

  const cardBg = useColorModeValue('white', 'gray.800');
  const gradientBg = useColorModeValue(
    'linear(to-r, teal.400, teal.600)',
    'linear(to-r, teal.600, teal.800)'
  );

  const recentEvents = events.slice(0, 3);
  const recentPlans = plans.slice(0, 3);
  const recentRegistrations = registrations.slice(0, 4);

  const quickActions = [
    {
      label: 'New Event',
      icon: FiCalendar,
      color: 'blue',
      path: '/organizer/events',
      description: 'Create a new event'
    },
    {
      label: 'New Plan',
      icon: FiMap,
      color: 'green',
      path: '/organizer/plans',
      description: 'Design floor plan'
    },
    {
      label: 'Equipment',
      icon: FiSettings,
      color: 'purple',
      path: '/organizer/equipment',
      description: 'Manage equipment'
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
                <Heading size={{ base: "lg", md: "xl" }}>Hello, {user?.username}!</Heading>
                <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9}>
                  Manage your events and grow your business
                </Text>
              </VStack>
              <Avatar size={{ base: "lg", md: "xl" }} name={user?.username} bg="whiteAlpha.200" />
            </Flex>
          </CardBody>
        </MotionCard>

        {/* Quick Actions */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          bg={cardBg}
          mb={8}
        >
          <CardBody>
            <Heading size="md" mb={4}>
              Quick Actions
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
              {quickActions.map((action, index) => (
                <MotionCard
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  variant="outline"
                  cursor="pointer"
                  _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                  onClick={() => navigate(action.path)}
                >
                  <CardBody p={6} textAlign="center">
                    <VStack spacing={3}>
                      <Box
                        p={4}
                        borderRadius="full"
                        bg={`${action.color}.100`}
                        color={`${action.color}.600`}
                      >
                        <Icon as={action.icon} boxSize={8} />
                      </Box>
                      <VStack spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {action.label}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {action.description}
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </CardBody>
        </MotionCard>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Events */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg={cardBg}
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">My Events</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  rightIcon={<FiArrowRight />}
                  onClick={() => navigate('/organizer/events')}
                >
                  View All
                </Button>
              </Flex>

              {eventsLoading ? (
                <Text color="gray.500">Loading...</Text>
              ) : recentEvents.length === 0 ? (
                <VStack py={8} spacing={4}>
                  <Icon as={FiCalendar} boxSize={12} color="gray.300" />
                  <VStack spacing={2}>
                    <Text color="gray.500" fontWeight="medium">
                      No events yet
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Create your first event to get started
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="teal"
                    onClick={() => navigate('/organizer/events')}
                  >
                    Create Event
                  </Button>
                </VStack>
              ) : (
                <Stack spacing={3}>
                  {recentEvents.map((event, index) => (
                    <MotionCard
                      key={event._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      variant="outline"
                      size="sm"
                      cursor="pointer"
                      _hover={{ shadow: 'md' }}
                      onClick={() => navigate('/organizer/events')}
                    >
                      <CardBody py={4}>
                        <HStack spacing={4}>
                          <Box
                            p={2}
                            borderRadius="md"
                            bg="teal.100"
                            color="teal.600"
                          >
                            <Icon as={FiCalendar} boxSize={5} />
                          </Box>
                          <VStack align="start" spacing={1} flex="1">
                            <Flex justify="space-between" w="full" align="center">
                              <Text fontWeight="semibold" noOfLines={1}>
                                {event.name}
                              </Text>
                              <Badge
                                colorScheme={getStatusColorScheme(event.status)}
                                size="sm"
                              >
                                {getStatusDisplayText(event.status)}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                              {event.location?.city}, {event.location?.country}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </Stack>
              )}
            </CardBody>
          </MotionCard>

          {/* Recent Plans */}
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            bg={cardBg}
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Floor Plans</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  rightIcon={<FiArrowRight />}
                  onClick={() => navigate('/organizer/plans')}
                >
                  View All
                </Button>
              </Flex>

              {plansLoading ? (
                <Text color="gray.500">Loading...</Text>
              ) : recentPlans.length === 0 ? (
                <VStack py={8} spacing={4}>
                  <Icon as={FiMap} boxSize={12} color="gray.300" />
                  <VStack spacing={2}>
                    <Text color="gray.500" fontWeight="medium">
                      No plans yet
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Create floor plans for your events
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => navigate('/organizer/plans')}
                  >
                    Create Plan
                  </Button>
                </VStack>
              ) : (
                <Stack spacing={3}>
                  {recentPlans.map((plan, index) => (
                    <MotionCard
                      key={plan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      variant="outline"
                      size="sm"
                      cursor="pointer"
                      _hover={{ shadow: 'md' }}
                      onClick={() => navigate('/organizer/plans')}
                    >
                      <CardBody py={4}>
                        <HStack spacing={4}>
                          <Box
                            p={2}
                            borderRadius="md"
                            bg="blue.100"
                            color="blue.600"
                          >
                            <Icon as={FiMap} boxSize={5} />
                          </Box>
                          <VStack align="start" spacing={1} flex="1">
                            <Flex justify="space-between" w="full" align="center">
                              <Text fontWeight="semibold" noOfLines={1}>
                                {plan.name}
                              </Text>
                              <Badge
                                colorScheme={plan.isActive ? 'green' : 'gray'}
                                size="sm"
                              >
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              {plan.description || 'No description'}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </Stack>
              )}
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Recent Activity */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          bg={cardBg}
          mt={6}
        >
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Recent Registrations</Heading>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="teal"
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/organizer/registrations')}
              >
                View All
              </Button>
            </Flex>

            {registrationsLoading ? (
              <Text color="gray.500">Loading...</Text>
            ) : recentRegistrations.length === 0 ? (
              <VStack py={6} spacing={3}>
                <Icon as={FiUsers} boxSize={10} color="gray.300" />
                <Text color="gray.500" textAlign="center">
                  No registrations yet
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {recentRegistrations.map((registration, index) => (
                  <MotionCard
                    key={registration._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    variant="outline"
                    size="sm"
                  >
                    <CardBody py={3}>
                      <HStack spacing={3}>
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={
                            registration.status === 'completed' ? 'blue.100' : 
                            registration.status === 'approved' ? 'green.100' : 
                            (registration.status === 'canceled' || registration.status === 'cancelled') ? 'gray.100' :
                            registration.status === 'rejected' ? 'red.100' : 
                            'orange.100'
                          }
                          color={
                            registration.status === 'completed' ? 'blue.600' : 
                            registration.status === 'approved' ? 'green.600' : 
                            (registration.status === 'canceled' || registration.status === 'cancelled') ? 'gray.600' :
                            registration.status === 'rejected' ? 'red.600' : 
                            'orange.600'
                          }
                        >
                          <Icon as={
                            registration.status === 'completed' || registration.status === 'approved' ? FiCheckCircle : 
                            FiClock
                          } boxSize={4} />
                        </Box>
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                            {registration.exhibitor?.company?.companyName || 'Company'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {registration.eventName || 'Event'}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={
                            registration.status === 'completed' ? 'blue' : 
                            registration.status === 'approved' ? 'green' : 
                            (registration.status === 'canceled' || registration.status === 'cancelled') ? 'gray' :
                            registration.status === 'rejected' ? 'red' : 
                            'orange'
                          }
                          size="sm"
                        >
                          {registration.status}
                        </Badge>
                      </HStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </MotionCard>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;