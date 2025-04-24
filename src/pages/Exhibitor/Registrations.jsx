// src/pages/exhibitor/Registrations.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  Icon,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiClipboard, 
  FiChevronRight, 
  FiBox, 
  FiInfo,
  FiRefreshCw,
  FiCreditCard

} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import useExhibitorRegistrations from '../../hooks/useExhibitorRegistrations';
import { getStatusColorScheme, getStatusDisplayText } from '../../constants/registrationConstants';

const Registrations = () => {
  const navigate = useNavigate();
  
  // Utilisation du hook personnalisé pour gérer les inscriptions
  const {
    registrations,
    loading,
    error,
    fetchRegistrations
  } = useExhibitorRegistrations();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleViewDetails = (registrationId) => {
    navigate(`/exhibitor/registrations/${registrationId}`);
  };
  
  const handleProceedToSelection = (registrationId) => {
    // FIXED: Use the correct path for selection wizard
    navigate(`/exhibitor/registrations/${registrationId}/selection`);
  };

  
  return (
    <DashboardLayout title="My Registrations">
      <Box p={4}>
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
        >
          <Box>
            <Heading size="lg" mb={1}>My Registrations</Heading>
            <Text color="gray.500">
              Manage your event registrations, stands, and equipment
            </Text>
          </Box>
          <HStack spacing={3} mt={{ base: 4, md: 0 }}>
            <Button 
              colorScheme="teal" 
              variant="outline"
              leftIcon={<FiRefreshCw />}
              onClick={fetchRegistrations}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button 
              colorScheme="teal" 
              leftIcon={<FiCalendar />} 
              onClick={() => navigate('/exhibitor/events')}
            >
              Browse Events
            </Button>
          </HStack>
        </Flex>
        
        {/* Error message */}
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        )}
        
        {loading ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </Flex>
        ) : registrations.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Icon as={FiClipboard} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" mb={2}>No Registrations Found</Heading>
            <Text color="gray.500" mb={6}>
              You haven't registered for any events yet.
            </Text>
            <Button 
              colorScheme="teal" 
              onClick={() => navigate('/exhibitor/events')}
            >
              Browse Available Events
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {registrations.map(registration => {
              const event = registration.event || {};
              const status = registration.status;
              
              return (
                <Card 
                  key={registration._id} 
                  borderRadius="lg" 
                  overflow="hidden" 
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor={`${getStatusColorScheme(status)}.200`}
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="start" mb={3}>
                      <Heading size="md" noOfLines={2}>{event.name || 'Unknown Event'}</Heading>
                      <Badge 
                        colorScheme={getStatusColorScheme(status)}
                        fontSize="sm"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {getStatusDisplayText(status)}
                      </Badge>
                    </Flex>
                    
                    <VStack align="start" spacing={2} mb={4}>
                      <HStack>
                        <Icon as={FiCalendar} color="teal.500" />
                        <Text>{event.startDate ? formatDate(event.startDate) : 'N/A'} - {event.endDate ? formatDate(event.endDate) : 'N/A'}</Text>
                      </HStack>
                      
                      {event.location && (
                        <HStack>
                          <Icon as={FiMapPin} color="teal.500" />
                          <Text>{event.location.city}, {event.location.country}</Text>
                        </HStack>
                      )}
                      
                      <HStack>
                        <Icon as={FiClock} color="teal.500" />
                        <Text>Registered on {formatDate(registration.createdAt)}</Text>
                      </HStack>
                    </VStack>
                    
                    {/* Show status-specific information */}
                    {status === 'pending' && (
                      <Alert status="info" borderRadius="md" mb={4}>
                        <AlertIcon />
                        Your registration is pending approval
                      </Alert>
                    )}
                    
                    {status === 'rejected' && (
                      <Alert status="error" borderRadius="md" mb={4}>
                        <AlertIcon />
                        {registration.rejectionReason || 'Registration was rejected'}
                      </Alert>
                    )}
                    
                    {status === 'approved' && !registration.standSelectionCompleted && (
                      <Alert status="success" borderRadius="md" mb={4}>
                        <AlertIcon />
                        Registration approved. Select your stands and equipment.
                      </Alert>
                    )}
                    
                    {status === 'completed' && (
                      <Box mb={4}>
                        <Divider my={3} />
                        <Text fontWeight="medium" mb={2}>Your Reservation</Text>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FiBox} color="teal.500" />
                            <Text>
                              {registration.stands?.length || 0} Stand(s) Selected
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiClipboard} color="teal.500" />
                            <Text>
                              {registration.equipment?.length || 0} Equipment Item(s)
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                    
                    <Divider my={3} />
                    
                    <Flex justify="space-between" align="center">
                      <Button 
                        variant="outline" 
                        colorScheme="teal"
                        leftIcon={<FiInfo />}
                        onClick={() => handleViewDetails(registration._id)}
                      >
                        Details
                      </Button>
                      
                      {status === 'approved' && !registration.standSelectionCompleted && (
                        <Button 
                          colorScheme="teal"
                          rightIcon={<FiChevronRight />}
                          onClick={() => handleProceedToSelection(registration._id)}
                        >
                          Select Stands
                        </Button>
                      )}
                      
                      {status === 'approved' && registration.standSelectionCompleted && !registration.equipmentSelectionCompleted && (
                        <Button 
                          colorScheme="teal"
                          rightIcon={<FiChevronRight />}
                          onClick={() => navigate(`/exhibitor/registrations/${registration._id}/equipment`)}
                        >
                          Select Equipment
                        </Button>
                      )}
                      
                      {status === 'completed' && (
                        <Button 
                          colorScheme="blue"
                          leftIcon={<FiCreditCard />}
                          isDisabled
                        >
                          View Invoice
                        </Button>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Registrations;