// src/components/profile/CompanyInfoSection.jsx
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
import { FiBriefcase, FiMapPin, FiGlobe, FiClipboard } from 'react-icons/fi';
import { SimpleGrid } from './BasicInfoSection';
import PhoneInputComponent from './PhoneInputComponent';
import industrySectors from '../../constants/industrySectors';

const CompanyInfoSection = ({ profile }) => {
  const {
    profileData,
    errors,
    handleProfileChange,
    handleCountryChange,
    handleSectorChange,
    getSubsectors,
    countries
  } = profile;
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');
  
  // Get company data
  const companyData = profileData.company || {};
  const subsectors = getSubsectors();
  
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
          Company Information
        </Flex>
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {/* Company Name */}
        <FormControl isInvalid={!!errors['company.companyName']}>
          <FormLabel>
            Company Name <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="company.companyName"
              value={companyData.companyName || ''}
              onChange={handleProfileChange}
              placeholder="Company name"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiBriefcase} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors['company.companyName']}</FormErrorMessage>
        </FormControl>
        
        {/* Trade Name */}
        <FormControl>
          <FormLabel>Trade Name</FormLabel>
          <Input
            name="company.tradeName"
            value={companyData.tradeName || ''}
            onChange={handleProfileChange}
            placeholder="Trade name (optional)"
            focusBorderColor="teal.400"
          />
        </FormControl>
        
        {/* Company Address */}
        <FormControl isInvalid={!!errors['company.companyAddress']}>
          <FormLabel>
            Company Address <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="company.companyAddress"
              value={companyData.companyAddress || ''}
              onChange={handleProfileChange}
              placeholder="Address"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiMapPin} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors['company.companyAddress']}</FormErrorMessage>
        </FormControl>
        
        {/* Postal Code & City */}
        <FormControl isInvalid={!!errors['company.postalCity']}>
          <FormLabel>
            Postal Code & City <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Input
            name="company.postalCity"
            value={companyData.postalCity || ''}
            onChange={handleProfileChange}
            placeholder="ZIP code, City"
            focusBorderColor="teal.400"
          />
          <FormErrorMessage>{errors['company.postalCity']}</FormErrorMessage>
        </FormControl>
        
        {/* Country */}
        <FormControl isInvalid={!!errors['company.country']}>
          <FormLabel>
            Country <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select 
            name="company.country" 
            value={companyData.country || ''} 
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
          <FormErrorMessage>{errors['company.country']}</FormErrorMessage>
        </FormControl>
        
        {/* Registration Number */}
        <FormControl isInvalid={!!errors['company.registrationNumber']}>
          <FormLabel>
            Registration Number <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <InputGroup>
            <Input
              name="company.registrationNumber"
              value={companyData.registrationNumber || ''}
              onChange={handleProfileChange}
              placeholder="Business registration number"
              focusBorderColor="teal.400"
              pl={10}
            />
            <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
              <Icon as={FiClipboard} color="gray.500" />
            </Box>
          </InputGroup>
          <FormErrorMessage>{errors['company.registrationNumber']}</FormErrorMessage>
        </FormControl>
        
        {/* Industry Sector */}
        <FormControl isInvalid={!!errors['company.sector']}>
          <FormLabel>
            Industry Sector <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select 
            name="company.sector" 
            value={companyData.sector || ''} 
            onChange={(e) => {
              handleProfileChange(e);
              handleSectorChange(e);
            }}
            placeholder="Select your sector"
            bg={inputBg}
            focusBorderColor="teal.400"
            _hover={{ borderColor: 'teal.300' }}
          >
            {industrySectors.map((sector, index) => (
              <option key={index} value={sector.name}>
                {sector.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors['company.sector']}</FormErrorMessage>
        </FormControl>
        
        {/* Industry Subsector */}
        <FormControl isInvalid={!!errors['company.subsector']}>
          <FormLabel>
            Industry Subsector <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select
            name="company.subsector"
            value={companyData.subsector || ''}
            onChange={handleProfileChange}
            isDisabled={!companyData.sector}
            placeholder="Select your subsector"
            bg={inputBg}
            focusBorderColor="teal.400"
            _hover={{ borderColor: 'teal.300' }}
          >
            {subsectors.map((sub, idx) => (
              <option key={idx} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors['company.subsector']}</FormErrorMessage>
        </FormControl>
        
        {/* Company Size */}
        <FormControl>
          <FormLabel>Company Size</FormLabel>
          <Select 
            name="company.companySize" 
            value={companyData.companySize || ''} 
            onChange={handleProfileChange}
            placeholder="Select company size"
            bg={inputBg}
            focusBorderColor="teal.400"
            _hover={{ borderColor: 'teal.300' }}
          >
            <option value="Micro-entreprise">Micro Enterprise</option>
            <option value="PME">SME</option>
            <option value="Grand groupe">Large Group</option>
          </Select>
        </FormControl>
        
        {/* Website */}
        <FormControl>
          <FormLabel>Website</FormLabel>
          <InputGroup>
            <Input
              name="company.website"
              value={companyData.website || ''}
              onChange={handleProfileChange}
              placeholder="Company website (Optional)"
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
          name="company.contactPhone"
          label="Contact Phone"
          countries={countries}
          required={true}
          error={errors['company.contactPhone']}
          placeholder="Company phone number"
          value={companyData.contactPhone || ''}
          phoneCode={companyData.contactPhoneCode || '+216'}
          onChange={handleProfileChange}
          onPhoneCodeChange={handleCountrySelection}
        />
      </SimpleGrid>
      
      {/* Company Description */}
      <FormControl mt={5}>
        <FormLabel>Company Description</FormLabel>
        <Textarea
          name="company.companyDescription"
          value={companyData.companyDescription || ''}
          onChange={handleProfileChange}
          placeholder="Company description"
          focusBorderColor="teal.400"
          rows={4}
        />
      </FormControl>
      
      <Divider mt={6} />
    </Box>
  );
};

export default CompanyInfoSection;