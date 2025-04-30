// src/components/profile/PasswordSection.jsx
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
  InputRightElement,
  Button,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const PasswordSection = ({ profile }) => {
  const {
    passwordData,
    errors,
    handlePasswordChange,
    isSaving,
    changePassword
  } = profile;
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // Toggle password visibility
  const toggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  // Colors for theming
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const gradientStart = useColorModeValue('teal.400', 'teal.600');
  const gradientEnd = useColorModeValue('teal.500', 'teal.700');
  
  return (
    <MotionBox
      key="password-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        as="form"
        bg={bgColor}
        borderRadius="xl"
        boxShadow="md"
        p={6}
      >
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
            <Icon as={FiLock} mr={2} />
            Change Password
          </Flex>
        </Heading>
        
        <VStack spacing={5} align="stretch">
          {/* Current Password */}
          <FormControl isInvalid={!!errors.currentPassword}>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                focusBorderColor="teal.400"
              />
              <InputRightElement width="3rem">
                <Button 
                  h="1.5rem" 
                  size="sm" 
                  onClick={toggleCurrentPassword}
                  variant="ghost"
                >
                  <Icon as={showCurrentPassword ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
          </FormControl>
          
          {/* New Password */}
          <FormControl isInvalid={!!errors.newPassword}>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <Input
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                focusBorderColor="teal.400"
              />
              <InputRightElement width="3rem">
                <Button 
                  h="1.5rem" 
                  size="sm" 
                  onClick={toggleNewPassword}
                  variant="ghost"
                >
                  <Icon as={showNewPassword ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
          </FormControl>
          
          {/* Confirm Password */}
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup>
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                focusBorderColor="teal.400"
              />
              <InputRightElement width="3rem">
                <Button 
                  h="1.5rem" 
                  size="sm" 
                  onClick={toggleConfirmPassword}
                  variant="ghost"
                >
                  <Icon as={showConfirmPassword ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>
          
          {/* Password Requirements */}
          <Box 
            p={4} 
            bg={useColorModeValue('gray.50', 'gray.700')} 
            borderRadius="md"
            border="1px"
            borderColor={borderColor}
          >
            <Text fontWeight="medium" mb={2}>Password Requirements:</Text>
            <VStack align="start" spacing={1} fontSize="sm">
              <Text>• Minimum 8 characters</Text>
              <Text>• At least one uppercase letter (A-Z)</Text>
              <Text>• At least one lowercase letter (a-z)</Text>
              <Text>• At least one number (0-9)</Text>
              <Text>• At least one special character (@$!%*?&)</Text>
            </VStack>
          </Box>
          
          {/* Change Password Button */}
          <Flex justify="flex-end" mt={4}>
            <Button
              colorScheme="teal"
              size="lg"
              leftIcon={<FiLock />}
              isLoading={isSaving}
              loadingText="Updating"
              onClick={changePassword}
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
              Change Password
            </Button>
          </Flex>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default PasswordSection;