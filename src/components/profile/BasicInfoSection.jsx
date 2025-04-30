// src/components/profile/BasicInfoSection.jsx
import React from 'react';
import {
  Box,
  Heading,
  Flex,
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  Text,
  useColorModeValue,
  Button,
  Divider
} from '@chakra-ui/react';
import { FiUser, FiMail, FiSave } from 'react-icons/fi';

const BasicInfoSection = ({ profile }) => {
  const {
    profileData,
    errors,
    handleProfileChange,
    isSaving,
    saveProfile
  } = profile;
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const gradientStart = useColorModeValue('teal.400', 'teal.600');
  const gradientEnd = useColorModeValue('teal.500', 'teal.700');
  
  return (
    <Box mb={6}>
      <Heading 
        as="h3" 
        size="md" 
        mb={4} 
        pb={2}
        borderBottom="1px"
        borderColor={borderColor}
        color={headingColor}
      >
        <Flex align="center">
          <Icon as={FiUser} mr={2} />
          Basic Information
        </Flex>
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={6}>
        {/* Username Field */}
        <FormControl isInvalid={!!errors.username}>
          <FormLabel>
            Username <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="username"
              value={profileData.username || ''}
              onChange={handleProfileChange}
              placeholder="Your username"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiUser} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors.username}</FormErrorMessage>
        </FormControl>
        
        {/* Email Field */}
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>
            Email <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="email"
              type="email"
              value={profileData.email || ''}
              onChange={handleProfileChange}
              placeholder="Your email"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiMail} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
      
      {/* Save Button */}
      <Flex justify="flex-end" mt={4}>
        <Button
          colorScheme="teal"
          size="lg"
          leftIcon={<FiSave />}
          isLoading={isSaving}
          loadingText="Saving"
          onClick={saveProfile}
          bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
          _hover={{ 
            bgGradient: `linear(to-r, ${gradientEnd}, ${gradientStart})`,
            transform: 'translateY(-2px)',
            boxShadow: 'lg'
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: 'md'
          }}
          transition="all 0.2s"
        >
          Save Changes
        </Button>
      </Flex>
      
      <Divider mt={6} />
    </Box>
  );
};

// Helper for grid layout
export const SimpleGrid = ({ children, columns, spacing }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={
        typeof columns === 'object'
          ? Object.entries(columns)
              .map(([bp, val]) => `repeat(${val}, 1fr)`)
              .join(', ')
          : `repeat(${columns}, 1fr)`
      }
      gridGap={spacing}
    >
      {children}
    </Box>
  );
};

export default BasicInfoSection;