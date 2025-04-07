// src/components/common/ui/FilterModal.jsx
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
  Text,
  Divider,
  Flex,
  useColorModeValue,
  Box,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiX, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FilterModal = ({ 
  isOpen, 
  onClose, 
  onApply, 
  onReset, 
  initialFilters,
  children,
  title = "Filters"
}) => {
  // Regrouper tous les hooks au début du composant
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const modalSize = useBreakpointValue({ base: 'full', md: 'md' });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const activeBadgeBg = useColorModeValue('teal.50', 'teal.900');
  const activeBadgeColor = useColorModeValue('teal.700', 'teal.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Update tempFilters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setTempFilters(initialFilters);
    }
  }, [initialFilters, isOpen]);
  
  // Handle apply filters
  const handleApply = () => {
    onApply(tempFilters);
  };
  
  // Handle reset filters
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      // Default reset logic if onReset not provided
      const resetFilters = {};
      Object.keys(tempFilters).forEach(key => {
        if (typeof tempFilters[key] === 'boolean') {
          resetFilters[key] = false;
        } else if (Array.isArray(tempFilters[key])) {
          resetFilters[key] = [];
        } else {
          resetFilters[key] = '';
        }
      });
      setTempFilters(resetFilters);
      onApply(resetFilters);
    }
  };
  
  // Determine active filters count
  const activeFiltersCount = Object.entries(tempFilters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'includeDeleted') return value === true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  }).length;
  
  // Clone children and pass tempFilters and setTempFilters
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        filters: tempFilters,
        setFilters: setTempFilters
      });
    }
    return child;
  });

  // Toujours rendre le Modal, mais le cacher si !isOpen
  // Éviter le rendu conditionnel qui pourrait perturber l'ordre des hooks
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={modalSize}
      motionPreset="slideInRight"
    >
      <ModalOverlay 
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(5px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        minH={isMobile ? "100vh" : "auto"}
      >
        <ModalHeader>
          <Flex align="center" justify="space-between">
            <Flex align="center">
              {isMobile && (
                <IconButton
                  aria-label="Close"
                  icon={<FiArrowLeft />}
                  variant="ghost"
                  mr={2}
                  onClick={onClose}
                />
              )}
              <Text>{title}</Text>
            </Flex>
            {!isMobile && (
              <IconButton
                aria-label="Close"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={onClose}
              />
            )}
          </Flex>
        </ModalHeader>
        <Divider />
        
        <ModalBody>
          <Box my={4}>
            {childrenWithProps}
          </Box>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderTopColor={borderColor}
          p={4}
        >
          <Flex justify="space-between" w="100%">
            <Button 
              variant="ghost" 
              colorScheme="gray" 
              mr={3} 
              onClick={handleReset}
              isDisabled={activeFiltersCount === 0}
            >
              Reset All
            </Button>
            <Flex>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="teal" 
                onClick={handleApply}
                isDisabled={activeFiltersCount === 0}
              >
                Apply
                {activeFiltersCount > 0 && (
                  <Box
                    ml={2}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={activeBadgeBg}
                    color={activeBadgeColor}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {activeFiltersCount}
                  </Box>
                )}
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;