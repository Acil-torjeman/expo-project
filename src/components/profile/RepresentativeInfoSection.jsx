// src/components/profile/RepresentativeInfoSection.jsx
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
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { SimpleGrid } from './BasicInfoSection';
import PhoneInputComponent from './PhoneInputComponent';

const RepresentativeInfoSection = ({ profile }) => {
  const {
    profileData,
    errors,
    handleProfileChange,
    countries
  } = profile;
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  
  // Handle country selection from PhoneInputComponent
  const handleCountrySelection = (country) => {
    profile.handleCountryChange(country.name);
  };
  
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
          Representative Information
        </Flex>
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {/* Representative Function */}
        <FormControl isInvalid={!!errors.representativeFunction}>
          <FormLabel>
            Function/Position <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Input
            name="representativeFunction"
            value={profileData.representativeFunction || ''}
            onChange={handleProfileChange}
            placeholder="Your function in the company"
            focusBorderColor="teal.400"
          />
          <FormErrorMessage>{errors.representativeFunction}</FormErrorMessage>
        </FormControl>
        
        {/* Personal Phone with country code */}
        <PhoneInputComponent
          name="personalPhone"
          label="Personal Phone"
          countries={countries}
          required={true}
          error={errors.personalPhone}
          placeholder="Your personal phone"
          value={profileData.personalPhone || ''}
          phoneCode={profileData.personalPhoneCode || '+216'}
          onChange={handleProfileChange}
          onPhoneCodeChange={handleCountrySelection}
        />
      </SimpleGrid>
    </Box>
  );
};

export default RepresentativeInfoSection;