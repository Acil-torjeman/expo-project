// src/components/organizer/events/EventPlanAssociation.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Box,
  Flex,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Stack,
  Grid,
  Image,
  Skeleton,
  useColorModeValue,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { FiMap, FiAlertTriangle, FiCheck, FiX, FiEye, FiInfo } from 'react-icons/fi';
import planService from '../../../services/plan.service';
import { useAuth } from '../../../context/AuthContext';

const EventPlanAssociation = ({
  isOpen,
  onClose,
  event,
  onAssociatePlan,
  onDissociatePlan,
}) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  
  const { user } = useAuth();
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const infoColor = useColorModeValue('gray.600', 'gray.400');
  const highlightBg = useColorModeValue('teal.50', 'teal.900');
  const previewBg = useColorModeValue('gray.50', 'gray.700');
  
  // Fetch plans on open
  useEffect(() => {
    if (!isOpen || !user) return;
    
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get organizer plans
        const plansData = await planService.getOrganizerPlans(user.id);
        
        // Filter out inactive plans
        const activePlans = plansData.filter(plan => plan.isActive);
        setPlans(activePlans);
        
        // Check if event has a plan
        if (event && event.plan) {
          // If plan is object with _id
          const planId = typeof event.plan === 'object' && event.plan._id 
            ? event.plan._id 
            : typeof event.plan === 'string'
              ? event.plan
              : null;
              
          if (planId) {
            // Get current plan details
            const eventPlan = await planService.getPlanById(planId);
            setCurrentPlan(eventPlan);
          }
        }
      } catch (err) {
        console.error('Error loading plans:', err);
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [isOpen, user, event]);
  
  // Fetch selected plan details
  useEffect(() => {
    if (!selectedPlanId) {
      setSelectedPlan(null);
      return;
    }
    
    const fetchPlanDetails = async () => {
      try {
        const planDetails = await planService.getPlanById(selectedPlanId);
        setSelectedPlan(planDetails);
      } catch (err) {
        console.error('Error loading plan details:', err);
        setSelectedPlan(null);
      }
    };
    
    fetchPlanDetails();
  }, [selectedPlanId]);
  
  // Handle plan selection
  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
  };
  
  // Handle associate plan
  const handleAssociatePlan = async () => {
    if (!selectedPlanId) return;
    
    setIsSubmitting(true);
    
    try {
      await onAssociatePlan(selectedPlanId);
      onClose();
    } catch (error) {
      console.error('Error associating plan:', error);
      setError(error.message || 'Failed to associate plan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dissociate plan
  const handleDissociatePlan = async () => {
    setIsSubmitting(true);
    
    try {
      await onDissociatePlan();
      onClose();
    } catch (error) {
      console.error('Error dissociating plan:', error);
      setError(error.message || 'Failed to dissociate plan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor}
        >
          Floor Plan Association
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="lg" color="teal.500" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          ) : (
            <Stack spacing={6}>
              {/* Current Plan Section */}
              <Box>
                <Text fontWeight="medium" mb={3}>Current Floor Plan</Text>
                {currentPlan ? (
                  <Box 
                    p={4} 
                    borderWidth="1px" 
                    borderColor={borderColor} 
                    borderRadius="md"
                    bg={highlightBg}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">{currentPlan.name}</Text>
                        <Text fontSize="sm" color={infoColor}>
                          {currentPlan.description?.substring(0, 100) || 'No description'}
                          {currentPlan.description?.length > 100 ? '...' : ''}
                        </Text>
                      </Box>
                      <IconButton
                        icon={<FiX />}
                        aria-label="Remove plan"
                        colorScheme="red"
                        variant="ghost"
                        onClick={handleDissociatePlan}
                        isLoading={isSubmitting}
                      />
                    </Flex>
                  </Box>
                ) : (
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Flex align="center">
                      <Icon as={FiInfo} mr={2} color="gray.500" />
                      <Text color="gray.500">No floor plan is currently associated with this event.</Text>
                    </Flex>
                  </Box>
                )}
              </Box>
              
              <Divider />
              
              {/* Associate New Plan Section */}
              <Box>
                <Text fontWeight="medium" mb={3}>Associate a Floor Plan</Text>
                
                {plans.length === 0 ? (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text>You don't have any active floor plans available.</Text>
                      <Text fontSize="sm" mt={1}>
                        Please create and activate a floor plan first.
                      </Text>
                    </Box>
                  </Alert>
                ) : (
                  <>
                    <FormControl mb={4}>
                      <FormLabel>Select Floor Plan</FormLabel>
                      <Select
                        placeholder="Select a floor plan"
                        value={selectedPlanId}
                        onChange={handlePlanChange}
                        isDisabled={isSubmitting}
                      >
                        {plans.map(plan => (
                          <option 
                            key={plan._id} 
                            value={plan._id}
                            disabled={currentPlan && currentPlan._id === plan._id}
                          >
                            {plan.name} {currentPlan && currentPlan._id === plan._id ? '(Current)' : ''}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedPlan && (
                      <Box
                        p={4}
                        bg={previewBg}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <Text fontWeight="medium" mb={2}>Plan Preview</Text>
                        <Grid templateColumns={{ base: '1fr', md: '3fr 2fr' }} gap={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="bold">{selectedPlan.name}</Text>
                            <Text fontSize="sm" mt={1}>
                              {selectedPlan.description || 'No description available'}
                            </Text>
                          </Box>
                          <Flex justify="flex-end" align="center">
                            <Button
                              leftIcon={<FiEye />}
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(planService.getPlanPdfUrl(selectedPlan.pdfPath), '_blank')}
                              isDisabled={!selectedPlan.pdfPath}
                            >
                              View PDF
                            </Button>
                          </Flex>
                        </Grid>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleAssociatePlan}
            isLoading={isSubmitting}
            isDisabled={!selectedPlanId || (currentPlan && currentPlan._id === selectedPlanId) || loading || plans.length === 0}
            leftIcon={<FiCheck />}
          >
            Associate Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventPlanAssociation;