import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Badge,
  Divider,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  ListIcon,
  Heading,
  Skeleton,
  Button,
  ButtonGroup,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCheckCircle, FiEdit, FiX, FiInfo } from 'react-icons/fi';
import { StandStatus, getStatusColorScheme, getTypeColorScheme } from '../../../constants/standConstants';
import standService from '../../../services/stand.service';

const StandDetailsModal = ({ 
  isOpen, 
  onClose, 
  standId,
  onEdit,
  onChangeStatus 
}) => {
  const [stand, setStand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme-responsive colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Fetch stand data when standId changes
  useEffect(() => {
    const fetchStand = async () => {
      if (!standId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await standService.getStandById(standId);
        setStand(data);
      } catch (err) {
        console.error('Error loading stand:', err);
        setError(err.message || 'Failed to load stand');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStand();
  }, [standId, isOpen]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Handle edit button click
  const handleEdit = () => {
    onEdit(stand);
    onClose();
  };
  
  // Handle status change button click
  const handleChangeStatus = (newStatus) => {
    onChangeStatus(stand, newStatus);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor}
          pb={4} // Add bottom padding for better spacing
          pr={12} // Add right padding to avoid overlap with close button
        >
          {loading ? (
            <Skeleton height="1.5rem" width="60%" />
          ) : (
            <Flex justifyContent="space-between" alignItems="center">
              <Text color={textColor}>Stand {stand?.number}</Text>
              
              {/* Status badge with proper spacing from close button */}
              <Badge 
                colorScheme={getStatusColorScheme(stand?.status)} 
                fontSize="0.8rem" 
                py={1} 
                px={3}
                borderRadius="full"
                mr={2} // Add right margin to separate from close button
              >
                {stand?.status}
              </Badge>
            </Flex>
          )}
        </ModalHeader>
        <ModalCloseButton top={3} right={3} /> {/* Reposition for better spacing */}
        
        <ModalBody py={6}>
          {loading ? (
            <SimpleGrid columns={1} spacing={4}>
              <Skeleton height="100px" />
              <Skeleton height="100px" />
              <Skeleton height="150px" />
            </SimpleGrid>
          ) : error ? (
            <Box textAlign="center" py={10}>
              <Text color="red.500">{error}</Text>
            </Box>
          ) : stand ? (
            <Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <Stat>
                  <StatLabel color={secondaryTextColor}>Type</StatLabel>
                  <Flex alignItems="center" mt={1}>
                    <Badge colorScheme={getTypeColorScheme(stand.type)} py={1} px={2} borderRadius="md">
                      {stand.type}
                    </Badge>
                  </Flex>
                </Stat>
                
                <Stat>
                  <StatLabel color={secondaryTextColor}>Area</StatLabel>
                  <StatNumber>{stand.area} m²</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel color={secondaryTextColor}>Base Price</StatLabel>
                  <StatNumber>{formatCurrency(stand.basePrice)}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel color={secondaryTextColor}>Plan</StatLabel>
                  <StatNumber>
                    {typeof stand.plan === 'object' ? stand.plan.name : 'N/A'}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
              
              <Divider my={6} borderColor={borderColor} />
              
              {stand.description && (
                <Box mb={6}>
                  <Heading as="h4" size="sm" mb={2} color={textColor}>
                    Description
                  </Heading>
                  <Text color={secondaryTextColor}>{stand.description}</Text>
                </Box>
              )}
              
              {stand.features && stand.features.length > 0 && (
                <Box>
                  <Heading as="h4" size="sm" mb={2} color={textColor}>
                    Features
                  </Heading>
                  <List spacing={2}>
                    {stand.features.map((feature, index) => (
                      <ListItem key={index} display="flex" alignItems="center">
                        <ListIcon as={FiCheckCircle} color="green.500" />
                        <Text color={secondaryTextColor}>{feature}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Divider my={6} borderColor={borderColor} />
              
              <ButtonGroup spacing={4} width="100%">
                <Button
                  leftIcon={<FiEdit />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={handleEdit}
                  isDisabled={stand.status === StandStatus.RESERVED}
                  width={{ base: '100%', md: 'auto' }}
                >
                  Edit
                </Button>
                
                {stand.status === StandStatus.AVAILABLE ? (
                  <Button
                    leftIcon={<FiX />}
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleChangeStatus(StandStatus.UNAVAILABLE)}
                    width={{ base: '100%', md: 'auto' }}
                  >
                    Mark Unavailable
                  </Button>
                ) : stand.status === StandStatus.UNAVAILABLE ? (
                  <Button
                    leftIcon={<FiCheckCircle />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => handleChangeStatus(StandStatus.AVAILABLE)}
                    width={{ base: '100%', md: 'auto' }}
                  >
                    Mark Available
                  </Button>
                ) : (
                  <Button
                    leftIcon={<FiInfo />}
                    colorScheme="blue"
                    variant="outline"
                    isDisabled
                    width={{ base: '100%', md: 'auto' }}
                  >
                    Reserved by Exhibitor
                  </Button>
                )}
              </ButtonGroup>
              
              {stand.status === StandStatus.RESERVED && (
                <Text color="red.500" fontSize="sm" mt={4}>
                  This stand is currently reserved by an exhibitor and cannot be modified.
                </Text>
              )}
            </Box>
          ) : (
            <Box textAlign="center" py={10}>
              <Text>No stand data available</Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StandDetailsModal;