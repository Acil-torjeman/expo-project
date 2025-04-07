// src/components/auth/SignupBase.jsx
import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Divider,
  VStack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import PublicLayout from '../../layouts/PublicLayout';

const MotionBox = motion(Box);

/**
 * Base component for signup forms with consistent styling and stepper
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form content for current step
 * @param {string} props.title - Form title
 * @param {string} props.roleType - 'Exhibitor' or 'Organizer'
 * @param {Array} props.steps - Array of step names
 * @param {number} props.currentStep - Current step index
 * @param {Function} props.prevStep - Function to go to previous step
 * @param {Function} props.nextStep - Function to go to next step
 * @param {boolean} props.isSubmitting - Whether form is submitting
 * @param {boolean} props.isSubmitted - Whether form was submitted successfully
 * @param {string} props.registrationStatus - 'SUCCESS', 'FAILED', or 'PENDING'
 * @param {string} props.errorMessage - Error message to display
 * @param {Function} props.resetForm - Function to reset the form
 * @param {Function} props.handleSubmit - Function to handle form submission
 */
const SignupBase = ({
  children,
  title,
  roleType,
  steps,
  currentStep,
  prevStep,
  nextStep,
  isSubmitting,
  isSubmitted,
  registrationStatus,
  errorMessage,
  resetForm,
  handleSubmit,
}) => {
  // Colors based on color mode
  const formBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const stepperBg = useColorModeValue('gray.100', 'gray.700');
  const activeStepBg = useColorModeValue('teal.500', 'teal.400');
  const completedStepBg = useColorModeValue('teal.100', 'teal.800');
  const stepperTextColor = useColorModeValue('gray.700', 'gray.300');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Function to determine the button text for the current step
  const getButtonText = () => {
    if (currentStep === steps.length - 1) {
      return isSubmitting ? 'Submitting...' : 'Create Account';
    }
    return 'Next Step';
  };

  return (
    <PublicLayout>
      <Container maxW="4xl" px={4} py={8}>
        <MotionBox 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          bg={formBg}
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
        >
          {/* Form header */}
          <Box 
            bg="teal.500" 
            py={6} 
            px={8}
            color="white"
            bgGradient="linear(to-r, teal.500, teal.600)"
          >
            <Heading size="lg">{title}</Heading>
            <Text mt={1} fontSize="md" opacity={0.9}>
              Register as a {roleType} to access the platform
            </Text>
          </Box>

          {/* Step progress */}
          <Box px={8} pt={6}>
            <Stepper index={currentStep} colorScheme="teal" size={{base: "sm", md: "md"}}
              my={4} gap={4}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator
                    bg={index < currentStep ? completedStepBg : index === currentStep ? activeStepBg : stepperBg}
                    borderColor={index <= currentStep ? "teal.500" : borderColor}
                  >
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box flexShrink="0">
                    <StepTitle color={index <= currentStep ? headingColor : stepperTextColor}>
                      {step}
                    </StepTitle>
                    <StepDescription color={textColor} display={{base: "none", md: "block"}}>
                      Step {index + 1}
                    </StepDescription>
                  </Box>
                  <StepSeparator 
                    bg={index < currentStep ? activeStepBg : borderColor}
                  />
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Form content */}
          <Box px={8} py={8}>
            {/* Success, error, and pending messages */}
            {isSubmitted && registrationStatus === 'SUCCESS' && (
              <Alert status="success" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Registration Successful</AlertTitle>
                  <AlertDescription>
                    Your account has been created. Please check your email to verify your account within 24 hours,
                    otherwise your account will be deleted.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            {registrationStatus === 'FAILED' && (
              <Alert status="error" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Registration Failed</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "An error occurred during registration. Please try again."}
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            {registrationStatus === 'PENDING' && (
              <Alert status="warning" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Account Created - Action Required</AlertTitle>
                  <AlertDescription>
                    Your account has been created, but we couldn't send the verification email.
                    Please contact support to activate your account.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Conditional rendering of form or success message */}
            {!isSubmitted ? (
              <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                {/* Form fields provided as children */}
                {children}
                
                {/* Form buttons */}
                <Flex width="100%" justify="space-between" mt={4}>
                  {currentStep > 0 ? (
                    <Button 
                      onClick={prevStep} 
                      colorScheme="gray"
                      size="lg"
                      boxShadow={`0 4px 6px ${shadowColor}`}
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        boxShadow: `0 6px 10px ${shadowColor}` 
                      }}
                      transition="all 0.2s"
                    >
                      Back
                    </Button>
                  ) : <Box />}
                  
                  <Button 
                    type={currentStep === steps.length - 1 ? 'submit' : 'button'}
                    onClick={currentStep === steps.length - 1 ? undefined : nextStep}
                    colorScheme="teal"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                    boxShadow={`0 4px 6px ${shadowColor}`}
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      boxShadow: `0 6px 10px ${shadowColor}`,
                      bgGradient: "linear(to-r, teal.500, teal.600)"
                    }}
                    transition="all 0.2s"
                    bgGradient="linear(to-r, teal.400, teal.500)"
                  >
                    {getButtonText()}
                  </Button>
                </Flex>
              </VStack>
            ) : (
              <VStack spacing={6} align="center">
                <Text fontSize="lg" textAlign="center" color={textColor}>
                  Thank you for registering with MyExpo Platform!
                </Text>
                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  onClick={() => window.location.href = '/login'}
                  boxShadow={`0 4px 6px ${shadowColor}`}
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: `0 6px 10px ${shadowColor}` 
                  }}
                  transition="all 0.2s"
                >
                  Go to Login Page
                </Button>
              </VStack>
            )}

            {/* Option to try again if registration failed */}
            {registrationStatus === 'FAILED' && (
              <Box mt={4} textAlign="center">
                <Button
                  colorScheme="teal"
                  variant="outline"
                  onClick={resetForm}
                >
                  Try Again
                </Button>
              </Box>
            )}
          </Box>
        </MotionBox>
      </Container>
    </PublicLayout>
  );
};

export default SignupBase;