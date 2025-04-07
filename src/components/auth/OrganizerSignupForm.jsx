// src/components/auth/OrganizerSignupForm.jsx
import React from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Checkbox,
  SimpleGrid,
  Textarea,
  Text,
  Spinner,
  InputGroup,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Image,
  Portal,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiUpload, FiUser, FiMail, FiLock, FiBriefcase, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import useOrganizerSignup from '../../hooks/useOrganizerSignup';
import SignupBase from './SignupBase';

const steps = ['Organization Details', 'Account Details'];

// Component for phone number with international code
const PhoneInputComponent = ({ 
  name, 
  label, 
  countries, 
  required = false, 
  error, 
  placeholder, 
  defaultValue = '', 
  defaultCode = '+33', 
  onChange, 
  onBlur, 
  onPhoneCodeChange 
}) => {
  // Find selected country based on phone code
  const selectedCountry = countries.find(c => c.code === defaultCode) || countries[0];
  const menuBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const handleCountrySelect = (country) => {
    if (onPhoneCodeChange) {
      onPhoneCodeChange(name + 'Code', country.code);
    }
  };

  const handlePhoneChange = (e) => {
    // Filter to accept only digits
    const input = e.target.value;
    const filteredInput = input.replace(/[^\d]/g, '');
    e.target.value = filteredInput;
    onChange(e);
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>
        {label} {required && <Text as="span" color="red.500">*</Text>}
      </FormLabel>
      <InputGroup>
        <InputLeftAddon p={0} overflow="hidden" bg="transparent">
          <Menu placement="bottom" closeOnSelect={true}>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              px={3} 
              py={0} 
              h="100%" 
              borderLeftRadius="md"
              borderRightRadius="0"
              bg="teal.500"
              color="white" 
              _hover={{ bg: "teal.600" }}
            >
              <Flex align="center">
                {selectedCountry && (
                  <>
                    <Image 
                      src={selectedCountry.flag} 
                      alt={`${selectedCountry.name} flag`} 
                      boxSize="20px" 
                      mr={1} 
                    />
                    <Text fontSize="sm" display={['none', 'block']}>
                      {selectedCountry.code}
                    </Text>
                  </>
                )}
              </Flex>
            </MenuButton>
            <Portal>
              <MenuList 
                maxH="300px" 
                overflowY="auto" 
                zIndex={1500} 
                boxShadow="xl" 
                w="max-content" 
                minW="220px"
                bg={menuBg}
              >
                {countries.map((country) => (
                  <MenuItem 
                    key={country.name} 
                    onClick={() => handleCountrySelect(country)}
                  >
                    <Flex align="center" width="100%">
                      <Image 
                        src={country.flag} 
                        alt={`${country.name} flag`} 
                        boxSize="20px" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">{country.name}</Text>
                      <Text fontSize="sm" color="gray.500" ml="auto">
                        {country.code}
                      </Text>
                    </Flex>
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
        </InputLeftAddon>
        <Input
          name={name}
          placeholder={placeholder || "Phone number"}
          defaultValue={defaultValue}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          bg={inputBg}
          focusBorderColor="teal.400"
          _hover={{ borderColor: 'teal.300' }}
          pl={2}
        />
      </InputGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

// Component for file uploads
const FileUpload = ({ name, label, accept, required, error, onBlur, onChange }) => {
  // Keep a local reference to the selected file
  const [selectedFile, setSelectedFile] = React.useState(null);
  const hasError = !!error;
  
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const borderColorHover = useColorModeValue('teal.400', 'teal.300');
  const borderColorError = useColorModeValue('red.300', 'red.500');
  const borderColorSuccess = useColorModeValue('teal.500', 'teal.300');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const textColorSuccess = useColorModeValue('teal.600', 'teal.200');

  // Handle file change
  const handleFileChange = (e) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files[0]) {
      // Update local state with selected file
      setSelectedFile(fileInput.files[0]);
      // Call original onChange to update form data
      onChange(e);
    }
    // Call onBlur if needed
    if (onBlur) onBlur(e);
  };
  
  return (
    <FormControl isInvalid={hasError}>
      <FormLabel>
        {label} {required && <Text as="span" color="red.500">*</Text>}
      </FormLabel>
      <Box
        border="2px dashed"
        borderColor={hasError ? borderColorError : selectedFile ? borderColorSuccess : borderColor}
        borderRadius="md"
        p={4}
        textAlign="center"
        cursor="pointer"
        onClick={() => document.getElementById(name).click()}
        _hover={{ borderColor: borderColorHover }}
        height="85px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
        backgroundColor={selectedFile ? bgColor : "transparent"}
        transition="all 0.2s"
      >
        {selectedFile ? (
          <>
            <Text 
              fontWeight="medium" 
              color={textColorSuccess}
              fontSize="sm" 
              noOfLines={1} 
              maxWidth="90%" 
              isTruncated
            >
              {selectedFile.name}
            </Text>
            <Text 
              fontSize="xs" 
              color={textColor}
              mt={1}
            >
              {Math.round(selectedFile.size / 1024)} KB - Click to change
            </Text>
          </>
        ) : (
          <Flex direction="column" align="center">
            <Icon as={FiUpload} mb={2} color={textColor} />
            <Text color={textColor}>Click to upload</Text>
          </Flex>
        )}
      </Box>
      <Input
        id={name}
        type="file"
        name={name}
        display="none"
        onChange={handleFileChange}
        accept={accept}
      />
      <FormErrorMessage>
        {error}
      </FormErrorMessage>
    </FormControl>
  );
};

const OrganizerSignupForm = () => {
  const {
    step,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    countries,
    isLoadingCountries,
    registrationStatus,
    errorMessage,
    handleChange,
    handleBlur,
    handleCountryChange,
    handlePhoneCodeChange,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    getFormValue
  } = useOrganizerSignup();

  // Input background based on color mode
  const inputBg = useColorModeValue('white', 'gray.700');

  // Display spinner while loading countries
  if (isLoadingCountries) {
    return (
      <Flex justify="center" align="center" minH="400px" direction="column">
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text mt={4} fontSize="lg">Loading countries data...</Text>
      </Flex>
    );
  }

  // Form content for each step
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <VStack spacing={6} w="full">
            <FormControl isInvalid={touched.organizationName && errors.organizationName}>
              <FormLabel>
                Organization Name <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  name="organizationName"
                  defaultValue={getFormValue('organizationName')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Organization Name"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'teal.300' }}
                  pl={10}
                />
                <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                  <Icon as={FiBriefcase} color="gray.500" />
                </Box>
              </InputGroup>
              <FormErrorMessage>
                {errors.organizationName}
              </FormErrorMessage>
            </FormControl>
            
            <SimpleGrid columns={[1, 2]} spacing={5} w="full">
              <FormControl isInvalid={touched.organizationAddress && errors.organizationAddress}>
                <FormLabel>
                  Organization Address <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <InputGroup>
                  <Input
                    name="organizationAddress"
                    defaultValue={getFormValue('organizationAddress')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Street and Number"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pl={10}
                  />
                  <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                    <Icon as={FiMapPin} color="gray.500" />
                  </Box>
                </InputGroup>
                <FormErrorMessage>
                  {errors.organizationAddress}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={touched.postalCity && errors.postalCity}>
                <FormLabel>
                  Postal Code, City <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Input
                  name="postalCity"
                  defaultValue={getFormValue('postalCity')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Postal Code, City"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'teal.300' }}
                />
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={[1, 2]} spacing={5} w="full">
              <FormControl isInvalid={touched.country && errors.country}>
                <FormLabel>
                  Country <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Select 
                  name="country" 
                  defaultValue={getFormValue('country')} 
                  onChange={(e) => {
                    handleChange(e);
                    handleCountryChange(e.target.value);
                  }}
                  onBlur={handleBlur}
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
                <FormErrorMessage>
                  {errors.country}
                </FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Website</FormLabel>
                <InputGroup>
                  <Input
                    name="website"
                    defaultValue={getFormValue('website')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Website (Optional)"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pl={10}
                  />
                  <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                    <Icon as={FiGlobe} color="gray.500" />
                  </Box>
                </InputGroup>
              </FormControl>
            </SimpleGrid>
            
            {/* Username field */}
            <FormControl isInvalid={touched.username && errors.username}>
              <FormLabel>
                Username <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  name="username"
                  defaultValue={getFormValue('username')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your full name"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'teal.300' }}
                  pl={10}
                />
                <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                  <Icon as={FiUser} color="gray.500" />
                </Box>
              </InputGroup>
              <FormErrorMessage>
                {errors.username}
              </FormErrorMessage>
            </FormControl>
            
            <PhoneInputComponent
              name="contactPhone"
              label="Contact Phone"
              countries={countries}
              required={true}
              error={touched.contactPhone && errors.contactPhone}
              placeholder="Contact Phone"
              defaultValue={getFormValue('contactPhone')}
              defaultCode={getFormValue('contactPhoneCode')}
              onChange={handleChange}
              onBlur={handleBlur}
              onPhoneCodeChange={handlePhoneCodeChange}
            />
            
            <FormControl>
              <FormLabel>
                Organization Description
              </FormLabel>
              <Textarea
                name="organizationDescription"
                defaultValue={getFormValue('organizationDescription')}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Organization Description (Optional)"
                size="md"
                bg={inputBg}
                focusBorderColor="teal.400"
                _hover={{ borderColor: 'teal.300' }}
              />
            </FormControl>
            
            <FileUpload
              name="organizationLogo"
              label="Organization Logo"
              accept="image/png, image/jpeg, image/gif"
              required={true}
              error={touched.organizationLogo && errors.organizationLogo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={6} w="full">
            <FormControl isInvalid={touched.email && errors.email}>
              <FormLabel>
                Email Address <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <InputGroup>
                <Input
                  name="email"
                  defaultValue={getFormValue('email')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email for account login"
                  type="email"
                  bg={inputBg}
                  focusBorderColor="teal.400"
                  _hover={{ borderColor: 'teal.300' }}
                  pl={10}
                />
                <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                  <Icon as={FiMail} color="gray.500" />
                </Box>
              </InputGroup>
              <FormErrorMessage>
                {errors.email}
              </FormErrorMessage>
            </FormControl>
            <SimpleGrid columns={[1, 2]} spacing={5} w="full">
              <FormControl isInvalid={touched.password && errors.password}>
                <FormLabel>
                  Password <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    defaultValue={getFormValue('password')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a password"
                    type="password"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pl={10}
                  />
                  <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                    <Icon as={FiLock} color="gray.500" />
                  </Box>
                </InputGroup>
                <FormErrorMessage>
                  {errors.password}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={touched.confirmPassword && errors.confirmPassword}>
                <FormLabel>
                  Confirm Password <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <InputGroup>
                  <Input
                    name="confirmPassword"
                    defaultValue={getFormValue('confirmPassword')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    type="password"
                    bg={inputBg}
                    focusBorderColor="teal.400"
                    _hover={{ borderColor: 'teal.300' }}
                    pl={10}
                  />
                  <Box position="absolute" left="0.75rem" top="50%" transform="translateY(-50%)">
                    <Icon as={FiLock} color="gray.500" />
                  </Box>
                </InputGroup>
                <FormErrorMessage>
                  {errors.confirmPassword}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <Box 
              p={5} 
              bg={useColorModeValue("gray.50", "gray.800")}
              borderRadius="md" 
              w="full" 
              mt={2}
              borderWidth="1px"
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <FormControl 
                display="flex" 
                alignItems="flex-start" 
                isInvalid={touched.consent && errors.consent}
                mb={3}
              >
                <Checkbox 
                  name="consent" 
                  defaultChecked={getFormValue('consent')} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  mt={1}
                  colorScheme="teal" 
                />
                <Box ml={2}>
                  <FormLabel mb={0}>
                    Terms and Conditions <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                    I have read and accept the terms and conditions of the platform.
                  </Text>
                  {touched.consent && errors.consent && (
                    <Text color="red.500" fontSize="sm">{errors.consent}</Text>
                  )}
                </Box>
              </FormControl>
              <FormControl 
                display="flex" 
                alignItems="flex-start" 
                isInvalid={touched.dataConsent && errors.dataConsent}
              >
                <Checkbox 
                  name="dataConsent" 
                  defaultChecked={getFormValue('dataConsent')} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  mt={1}
                  colorScheme="teal"
                />
                <Box ml={2}>
                  <FormLabel mb={0}>
                    Data Usage Policy <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                    I agree to the processing of my personal data according to the data usage policy.
                  </Text>
                  {touched.dataConsent && errors.dataConsent && (
                    <Text color="red.500" fontSize="sm">{errors.dataConsent}</Text>
                  )}
                </Box>
              </FormControl>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <SignupBase 
      title="Create Organizer Account"
      roleType="Organizer"
      steps={steps}
      currentStep={step}
      prevStep={prevStep}
      nextStep={nextStep}
      isSubmitting={isSubmitting}
      isSubmitted={isSubmitted}
      registrationStatus={registrationStatus}
      errorMessage={errorMessage}
      resetForm={resetForm}
      handleSubmit={handleSubmit}
    >
      {renderStepContent()}
    </SignupBase>
  );
};

export default OrganizerSignupForm;