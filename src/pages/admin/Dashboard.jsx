import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Spinner,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { FiUsers, FiCalendar, FiAlertCircle, FiDollarSign, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Color values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Attempt to fetch data from backend
        // For demonstration, we'll wrap this in try/catch to show both scenarios
        
        try {
          // In a real app, these would be your actual endpoints
          // If they don't exist yet, it will fall back to default values
          
          // Get user stats
          const userStatsResponse = await api.get('/admin/stats/users');
          
          // Get recent users
          const recentUsersResponse = await api.get('/admin/users/recent');
          
          // Update state with real data
          setStats({
            totalUsers: userStatsResponse.data.totalUsers || 0,
            pendingUsers: userStatsResponse.data.pendingUsers || 0,
            totalEvents: userStatsResponse.data.totalEvents || 0,
            activeEvents: userStatsResponse.data.activeEvents || 0,
          });
          
          setRecentUsers(recentUsersResponse.data || []);
        
        } catch (apiError) {
          console.log("Backend API not available yet, using default values");
          
          // If backend endpoints are not available yet, use default values
          setStats({
            totalUsers: 0,
            pendingUsers: 0,
            totalEvents: 0,
            activeEvents: 0,
          });
          
          setRecentUsers([]);
        }
        
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Just for demonstration to make it look like data is loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
  }, []);
  
  // Format date utility function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <DashboardLayout>
      <Box py={4} px={4}>
        {/* Welcome header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          pb={4}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <Box>
            <Heading size="lg" mb={1}>Welcome to Admin Dashboard</Heading>
            <Text color="gray.500">
              Manage your exhibition platform from here
            </Text>
          </Box>
          
          <Flex mt={{ base: 4, md: 0 }} gap={3}>
            <Button 
              leftIcon={<FiUsers />}
              colorScheme="teal"
              onClick={() => navigate('/admin/accounts')}
            >
              Manage Users
            </Button>
          </Flex>
        </Flex>
        
        {loading ? (
          <Flex justify="center" align="center" minH="300px" direction="column">
            <Spinner size="xl" color="teal.500" thickness="4px" mb={4} />
            <Text>Loading dashboard data...</Text>
          </Flex>
        ) : error ? (
          <Flex justify="center" align="center" minH="300px" bg="red.50" borderRadius="md" p={6} direction="column">
            <Icon as={FiAlertCircle} boxSize={10} color="red.500" mb={4} />
            <Text color="red.500" fontSize="lg" fontWeight="medium">{error}</Text>
            <Button mt={4} colorScheme="red" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Flex>
        ) : (
          <>
            {/* Stats cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
              {/* Total Users card */}
              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Flex
                      rounded="full"
                      w={10}
                      h={10}
                      bg="teal.100"
                      color="teal.700"
                      justify="center"
                      align="center"
                      mr={3}
                    >
                      <Icon as={FiUsers} boxSize={5} />
                    </Flex>
                    <Text fontWeight="medium" fontSize="sm" color="gray.600">
                      Total Users
                    </Text>
                  </Flex>
                  <Stat>
                    <StatNumber fontSize="2xl">{stats.totalUsers}</StatNumber>
                    <StatHelpText mb={0}>
                      From all user types
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              {/* Pending Users card */}
              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Flex
                      rounded="full"
                      w={10}
                      h={10}
                      bg="orange.100"
                      color="orange.700"
                      justify="center"
                      align="center"
                      mr={3}
                    >
                      <Icon as={FiAlertCircle} boxSize={5} />
                    </Flex>
                    <Text fontWeight="medium" fontSize="sm" color="gray.600">
                      Pending Approvals
                    </Text>
                  </Flex>
                  <Stat>
                    <StatNumber fontSize="2xl">{stats.pendingUsers}</StatNumber>
                    <StatHelpText mb={0}>
                      Users awaiting approval
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              {/* Total Events card */}
              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Flex
                      rounded="full"
                      w={10}
                      h={10}
                      bg="blue.100"
                      color="blue.700"
                      justify="center"
                      align="center"
                      mr={3}
                    >
                      <Icon as={FiCalendar} boxSize={5} />
                    </Flex>
                    <Text fontWeight="medium" fontSize="sm" color="gray.600">
                      Total Events
                    </Text>
                  </Flex>
                  <Stat>
                    <StatNumber fontSize="2xl">{stats.totalEvents}</StatNumber>
                    <StatHelpText mb={0}>
                      Events on the platform
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              {/* Active Events card */}
              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Flex
                      rounded="full"
                      w={10}
                      h={10}
                      bg="green.100"
                      color="green.700"
                      justify="center"
                      align="center"
                      mr={3}
                    >
                      <Icon as={FiDollarSign} boxSize={5} />
                    </Flex>
                    <Text fontWeight="medium" fontSize="sm" color="gray.600">
                      Active Events
                    </Text>
                  </Flex>
                  <Stat>
                    <StatNumber fontSize="2xl">{stats.activeEvents}</StatNumber>
                    <StatHelpText mb={0}>
                      Currently active events
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            {/* Recent users table */}
            <Card shadow="md" bg={cardBg} borderRadius="lg">
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Recent Users</Heading>
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    size="sm"
                    rightIcon={<FiEye />}
                    onClick={() => navigate('/admin/accounts')}
                  >
                    View All
                  </Button>
                </Flex>
                
                {recentUsers.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No recent users found
                  </Text>
                ) : (
                  <Box overflowX="auto">
                    <Table size="md" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>User</Th>
                          <Th>Email</Th>
                          <Th>Role</Th>
                          <Th>Status</Th>
                          <Th>Created</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentUsers.map(user => (
                          <Tr key={user.id}>
                            <Td>
                              <Flex align="center">
                                <Avatar 
                                  size="sm" 
                                  name={user.name || user.username} 
                                  src={user.avatar} 
                                  mr={2}
                                  bg={user.role === 'admin' ? 'purple.500' : user.role === 'organizer' ? 'blue.500' : 'orange.500'}
                                />
                                <Text fontWeight="medium">{user.name || user.username}</Text>
                              </Flex>
                            </Td>
                            <Td>{user.email}</Td>
                            <Td>
                              <Badge variant="subtle" colorScheme={user.role === 'admin' ? 'purple' : user.role === 'organizer' ? 'blue' : 'orange'}>
                                {user.role}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={
                                user.status === 'active' ? 'green' : 
                                user.status === 'pending' ? 'yellow' : 
                                user.status === 'inactive' ? 'gray' : 'red'
                              }>
                                {user.status}
                              </Badge>
                            </Td>
                            <Td>{formatDate(user.createdAt)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;