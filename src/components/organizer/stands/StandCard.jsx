import React from 'react';
import {
  Box,
  Badge,
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
  HStack,
  Heading,
  Portal,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiEye, 
  FiEdit,
  FiTrash2, 
  FiX, 
  FiCheck,
  FiTag,
  FiBox,
  FiDollarSign,
} from 'react-icons/fi';
import { StandStatus, getStatusColorScheme, getTypeColorScheme } from '../../../constants/standConstants';

const StandCard = ({ 
  stand, 
  onView, 
  onEdit, 
  onDelete,
  onStatusChange,
}) => {
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Gérer le clic sur la carte
  const handleCardClick = (e) => {
    // Très important: vérifier si le clic provient du menu ou de ses éléments
    if (e.target.closest('.card-action-menu') || e.target.closest('.chakra-menu__menu-list')) {
      return;
    }
    onView(stand);
  };
  
  // Gérer les actions du menu avec arrêt de propagation explicite
  const handleMenuAction = (e, action, ...args) => {
    e.stopPropagation(); // Arrêter la propagation
    action(...args);
  };

  return (
    <Box 
      position="relative"
      height="220px"
      transition="all 0.3s"
      _hover={{transform: "translateY(-8px)"}}
    >
      <Box
        borderWidth="1px"
        borderRadius="xl"
        overflow="hidden"
        bg={bgColor}
        borderColor={borderColor}
        position="relative"
        cursor="pointer"
        onClick={handleCardClick}
        transition="all 0.3s"
        _hover={{ 
          boxShadow: "lg", 
          borderColor: "teal.400",
        }}
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
      >
        {/* Bannière colorée en haut de la carte */}
        <Box 
          height="6px" 
          width="100%" 
          bg={`${getTypeColorScheme(stand.type)}.400`}
          position="absolute"
          top="0"
          left="0"
        />
        
        {/* En-tête avec badges et numéro de stand */}
        <Flex 
          justifyContent="space-between" 
          alignItems="flex-start"
          p={4}
          pt={5}
          pb={0}
        >
          <Box>
            <Heading 
              as="h3" 
              size="md" 
              color={textColor}
              fontWeight="bold"
            >
              Stand {stand.number}
            </Heading>
          </Box>
          
          <Badge 
            colorScheme={getStatusColorScheme(stand.status)}
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
            textTransform="uppercase"
            fontWeight="bold"
            letterSpacing="0.5px"
          >
            {stand.status}
          </Badge>
        </Flex>
        
        {/* Badge de type */}
        <Box px={4} pt={2}>
          <Badge 
            colorScheme={getTypeColorScheme(stand.type)}
            borderRadius="full"
            px={2}
            py={0.5}
            fontSize="xs"
            textTransform="capitalize"
            fontWeight="medium"
          >
            {stand.type}
          </Badge>
        </Box>
        
        {/* Contenu principal */}
        <Box p={4} pt={3} flex="1" display="flex" flexDirection="column" justifyContent="space-between">
          {/* Informations sur le stand */}
          <Box>
            <HStack spacing={2} mb={2} alignItems="center">
              <Box as={FiBox} color="teal.500" />
              <Text fontSize="sm" fontWeight="medium">
                {stand.area} m²
              </Text>
            </HStack>
            
            <HStack spacing={2} mb={2} alignItems="center">
              <Box as={FiDollarSign} color="teal.500" />
              <Text fontSize="sm" fontWeight="medium">
                {formatCurrency(stand.basePrice)}
              </Text>
            </HStack>
            
            {stand.features && stand.features.length > 0 && (
              <HStack spacing={2} alignItems="center">
                <Box as={FiTag} color="teal.500" />
                <Text fontSize="sm" fontWeight="medium">
                  {stand.features.length} feature{stand.features.length > 1 ? 's' : ''}
                </Text>
              </HStack>
            )}
          </Box>
          
          {/* Menu d'actions */}
          <Menu placement="bottom-end" isLazy closeOnSelect>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              color="gray.500"
              alignSelf="flex-end"
              _hover={{ bg: cardHoverBg, color: "teal.500" }}
              aria-label="Options"
              className="card-action-menu"
              onClick={(e) => e.stopPropagation()} // Arrêter la propagation ici
            />
            <Portal>
              <MenuList 
                zIndex={1500} 
                shadow="lg"
                borderRadius="md"
                p={1}
                bg={bgColor}
                borderColor={borderColor}
                onClick={(e) => e.stopPropagation()} // Arrêter la propagation pour tout le MenuList
              >
                <MenuItem 
                  icon={<FiEye />} 
                  onClick={(e) => handleMenuAction(e, onView, stand)}
                  borderRadius="md"
                  _hover={{ bg: "teal.50", color: "teal.700" }}
                >
                  View Details
                </MenuItem>
                
                <MenuItem 
                  icon={<FiEdit />}
                  onClick={(e) => handleMenuAction(e, onEdit, stand)}
                  isDisabled={stand.status === StandStatus.RESERVED}
                  borderRadius="md"
                  _hover={{ bg: "teal.50", color: "teal.700" }}
                >
                  Edit
                </MenuItem>
                
                {stand.status === StandStatus.AVAILABLE ? (
                  <MenuItem 
                    icon={<FiX />}
                    onClick={(e) => handleMenuAction(e, onStatusChange, stand, StandStatus.UNAVAILABLE)}
                    borderRadius="md"
                    _hover={{ bg: "red.50", color: "red.600" }}
                  >
                    Mark Unavailable
                  </MenuItem>
                ) : stand.status === StandStatus.UNAVAILABLE ? (
                  <MenuItem 
                    icon={<FiCheck />}
                    onClick={(e) => handleMenuAction(e, onStatusChange, stand, StandStatus.AVAILABLE)}
                    borderRadius="md"
                    _hover={{ bg: "green.50", color: "green.600" }}
                  >
                    Mark Available
                  </MenuItem>
                ) : null}
                
                <MenuItem 
                  icon={<FiTrash2 />}
                  onClick={(e) => handleMenuAction(e, onDelete, stand)}
                  isDisabled={stand.status === StandStatus.RESERVED}
                  color="red.500"
                  borderRadius="md"
                  _hover={{ bg: "red.50", color: "red.600" }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default StandCard;