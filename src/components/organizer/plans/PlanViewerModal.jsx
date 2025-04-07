// src/components/organizer/plans/PlanViewerModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Heading,
  Text,
  Badge,
  Box,
  Icon,
  Spinner,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import planService from '../../../services/plan.service';

const PlanViewerModal = ({ isOpen, onClose, planId }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme-responsive colors
  const bgColor = useColorModeValue('white', '#2D3748');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'white');
  const iconHoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  
  // Fetch plan data when planId changes
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await planService.getPlanById(planId);
        setPlan(data);
      } catch (err) {
        console.error('Error loading plan:', err);
        setError(err.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, isOpen]);
  
  // Get PDF URL with native toolbar
  const getPdfUrl = (pdfPath) => {
    if (!pdfPath) return '';
    return `${planService.getPlanPdfUrl(pdfPath)}#toolbar=1&navpanes=0`;
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent 
        maxW="75vw" 
        h="85vh" 
        mx="auto" 
        my="auto" 
        bg={bgColor}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pr="60px">
          <Flex justifyContent="space-between" alignItems="center">
            {plan ? (
              <Box>
                <Heading size="lg" color={textColor}>{plan.name}</Heading>
                <Flex mt={2} align="center">
                  <Badge 
                    colorScheme={plan.isActive ? 'green' : 'red'} 
                    mr={2}
                  >
                    {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Box>
            ) : (
              <Heading size="lg" color={textColor}>Floor Plan Viewer</Heading>
            )}
            
            {plan?.pdfPath && (
              <IconButton
                icon={<FiExternalLink />}
                aria-label="Open in new tab"
                variant="ghost"
                color={iconColor}
                size="md"
                mr={8}
                onClick={() => window.open(planService.getPlanPdfUrl(plan.pdfPath), '_blank')}
                _hover={{ bg: iconHoverBg }}
              />
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton color={iconColor} />
        
        <ModalBody p={0} position="relative" bg={bgColor}>
          {loading ? (
            <Flex justify="center" align="center" height="100%" width="100%">
              <Spinner size="xl" thickness="4px" color="teal.500" />
            </Flex>
          ) : error ? (
            <Flex justify="center" align="center" height="100%" width="100%" p={8}>
              <Text color="red.500">{error}</Text>
            </Flex>
          ) : plan?.pdfPath ? (
            <Box 
              position="relative" 
              w="100%" 
              h="100%" 
              overflow="hidden"
            >
              {/* Use native PDF viewer with toolbar */}
              <iframe
                src={getPdfUrl(plan.pdfPath)}
                width="100%"
                height="100%"
                title={plan.name}
                frameBorder="0"
                style={{ border: 'none' }}
              />
            </Box>
          ) : (
            <Flex justify="center" align="center" height="100%" width="100%">
              <Text color={textColor}>No PDF available for this plan</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlanViewerModal;