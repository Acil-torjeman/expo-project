// src/components/organizer/events/PlanSelection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Grid,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Skeleton,
  Image,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  Link
} from '@chakra-ui/react';
import { FiMap, FiEye, FiAlertCircle } from 'react-icons/fi';
import planService from '../../../services/plan.service';

const PlanSelection = ({ 
  selectedPlanId, 
  onPlanChange,
  userId
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const selectedBg = useColorModeValue('teal.50', 'teal.900');
  const selectedBorder = useColorModeValue('teal.300', 'teal.600');
  const inactiveBadgeColor = useColorModeValue('gray.500', 'gray.500');
  const activeBadgeColor = useColorModeValue('green.500', 'green.500');
  
  // Fetch organizer plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      try {
        const plansData = await planService.getOrganizerPlans(userId);
        setPlans(plansData || []);
      } catch (err) {
        console.error('Error loading plans:', err);
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [userId]);

  const viewPlanPdf = (plan) => {
    if (plan.pdfPath) {
      window.open(planService.getPlanPdfUrl(plan.pdfPath), '_blank');
    }
  };
  
  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton height="100px" />
        <Skeleton height="100px" />
        <Skeleton height="100px" />
      </Stack>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }
  
  if (plans.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text>You don't have any floor plans yet</Text>
          <Text fontSize="sm" mt={1}>
            Please create a floor plan in the Plans section first
          </Text>
          <Link href="/organizer/plans" color="teal.500" mt={2} display="inline-block">
            <Button size="sm" leftIcon={<FiMap />} colorScheme="teal" mt={2}>
              Create Plans
            </Button>
          </Link>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Text mb={4}>Select a floor plan for your event. Inactive plans will be activated when associated with an event.</Text>
      
      <RadioGroup onChange={onPlanChange} value={selectedPlanId}>
        <Stack spacing={4}>
          {plans.map(plan => (
            <Box
              key={plan._id}
              p={4}
              borderWidth="1px"
              borderColor={selectedPlanId === plan._id ? selectedBorder : borderColor}
              borderRadius="md"
              bg={selectedPlanId === plan._id ? selectedBg : bgColor}
              cursor="pointer"
              onClick={() => onPlanChange(plan._id)}
              transition="all 0.2s"
              _hover={{ borderColor: "teal.300" }}
            >
              <Flex justify="space-between" align="center">
                <Radio value={plan._id} isChecked={selectedPlanId === plan._id}>
                  <Box ml={2}>
                    <Flex align="center">
                      <Text fontWeight="medium">{plan.name}</Text>
                      <Badge ml={2} colorScheme={plan.isActive ? "green" : "gray"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Flex>
                    <Text fontSize="sm" color="gray.500" mt={1}>{plan.description || 'No description available'}</Text>
                  </Box>
                </Radio>
                
                <Button
                  size="sm"
                  leftIcon={<FiEye />}
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewPlanPdf(plan);
                  }}
                >
                  View PDF
                </Button>
              </Flex>
            </Box>
          ))}
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default PlanSelection;