// src/components/profile/PhoneInputComponent.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  Input,
  InputLeftAddon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Image,
  Text,
  Portal,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const PhoneInputComponent = ({ 
  name, 
  label, 
  countries, 
  required = false, 
  error, 
  placeholder,
  value = '',
  phoneCode = '',
  onChange, 
  onPhoneCodeChange 
}) => {
  // Find selected country based on phone code
  const selectedCountry = countries.find(c => c.code === phoneCode) || countries[0];
  const menuBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  const handleCountrySelect = (country) => {
    if (onPhoneCodeChange) {
      onPhoneCodeChange(country);
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
          value={value}
          onChange={handlePhoneChange}
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

export default PhoneInputComponent;