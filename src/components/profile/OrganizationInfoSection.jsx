// src/components/profile/OrganizationInfoSection.jsx
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
  Textarea,
  Select,
  Text,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { FiBriefcase, FiMapPin, FiGlobe } from 'react-icons/fi';
import { SimpleGrid } from './BasicInfoSection';
import PhoneInputComponent from './PhoneInputComponent';

const OrganizationInfoSection = ({ profile }) => {
  const {
    profileData,
    errors,
    handleProfileChange,
    handleCountryChange,
    countries
  } = profile;
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  
  // Handle country selection from PhoneInputComponent
  const handleCountrySelection = (country) => {
    handleCountryChange(country.name);
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
          <Icon as={FiBriefcase} mr={2} />
          Organization Information
        </Flex>
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {/* Organization Name */}
        <FormControl isInvalid={!!errors.organizationName}>
          <FormLabel>
            Organization Name <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="organizationName"
              value={profileData.organizationName || ''}
              onChange={handleProfileChange}
              placeholder="Organization name"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiBriefcase} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors.organizationName}</FormErrorMessage>
        </FormControl>
        
        {/* Organization Address */}
        <FormControl isInvalid={!!errors.organizationAddress}>
          <FormLabel>
            Organization Address <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="organizationAddress"
              value={profileData.organizationAddress || ''}
              onChange={handleProfileChange}
              placeholder="Address"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiMapPin} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors.organizationAddress}</FormErrorMessage>
        </FormControl>
        
        {/* Postal Code & City */}
        <FormControl isInvalid={!!errors.postalCity}>
          <FormLabel>
            Postal Code & City <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Input
            name="postalCity"
            value={profileData.postalCity || ''}
            onChange={handleProfileChange}
            placeholder="ZIP code, City"
            focusBorderColor="teal.400"
          />
          <FormErrorMessage>{errors.postalCity}</FormErrorMessage>
        </FormControl>
        
        {/* Country */}
        <FormControl isInvalid={!!errors.country}>
          <FormLabel>
            Country <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select 
            name="country" 
            value={profileData.country || ''} 
            onChange={(e) => {
              handleProfileChange(e);
              handleCountryChange(e.target.value);
            }}
            placeholder="Select your country"
            bg={inputBg}
            focusBorderColor="teal.400"
            _hover={{ borderColor: 'teal.300' }}
          >
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.country}</FormErrorMessage>
        </FormControl>
        
        {/* Website */}
        <FormControl>
          <FormLabel>Website</FormLabel>
          <InputGroup>
            <Input
              name="website"
              value={profileData.website || ''}
              onChange={handleProfileChange}
              placeholder="Organization website"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiGlobe} color="gray.500" />
            </Box>
          </InputGroup>
        </FormControl>
        
        {/* Contact Phone with country code */}
        <PhoneInputComponent
          name="contactPhone"
          label="Contact Phone"
          countries={countries}
          required={true}
          error={errors.contactPhone}
          placeholder="Organization phone number"
          value={profileData.contactPhone || ''}
          phoneCode={profileData.contactPhoneCode || '+216'}
          onChange={handleProfileChange}
          onPhoneCodeChange={handleCountrySelection}
        />
      </SimpleGrid>
      
      {/* Organization Description */}
      <FormControl mt={5}>
        <FormLabel>Organization Description</FormLabel>
        <Textarea
          name="organizationDescription"
          value={profileData.organizationDescription || ''}
          onChange={handleProfileChange}
          placeholder="Organization description"
          focusBorderColor="teal.400"
          rows={4}
        />
      </FormControl>
    </Box>
  );
};

export default OrganizationInfoSection;