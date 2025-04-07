import React from 'react';
import { Flex, Icon, Text, Tooltip, useColorModeValue, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon, label, isActive, isOpen, onClick, path }) => {
  const activeColor = "teal.500";
  const inactiveBg = useColorModeValue('transparent', 'transparent');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  const itemVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -10, opacity: 0 }
  };

  return (
    <Tooltip 
      label={label} 
      placement="right" 
      isDisabled={isOpen}
      hasArrow
    >
      <Flex
        as={motion.div}
        align="center"
        p="4"
        mx="2"
        my="1"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        bg={isActive ? 'teal.50' : inactiveBg}
        color={isActive ? activeColor : inactiveColor}
        onClick={onClick}
        _hover={{
          bg: hoverBg,
          color: isActive ? activeColor : 'teal.500',
        }}
        position="relative"
        overflow="hidden"
      >
        {/* Active indicator */}
        {isActive && (
          <Box
            as={motion.div}
            position="absolute"
            left="0"
            top="0"
            bottom="0"
            width="4px"
            borderRadius="full"
            bg="teal.500"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        
        {/* Icon always visible */}
        <Icon
          as={icon}
          fontSize="lg"
          transition="all 0.3s"
          color={isActive ? activeColor : inactiveColor}
          _groupHover={{
            color: isActive ? activeColor : 'teal.500',
          }}
        />
        
        {/* Label visible only when sidebar is open */}
        {isOpen && (
          <motion.div
            variants={itemVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <Text ml="4" fontSize="md" fontWeight={isActive ? "semibold" : "medium"}>
              {label}
            </Text>
          </motion.div>
        )}
      </Flex>
    </Tooltip>
  );
};

export default SidebarItem;