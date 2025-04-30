// src/pages/Profile.jsx
import React from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
  Avatar,
  Image,
  Spinner,
  Textarea,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEdit2, 
  FiSave, 
  FiCamera, 
  FiPhone, 
  FiBriefcase, 
  FiMapPin, 
  FiGlobe,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import useProfile from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Profile = () => {
  const { user } = useAuth();
  const {
    profileData,
    passwordData,
    profileImageUrl,
    isLoading,
    isSaving,
    errors,
    handleProfileChange,
    handlePasswordChange,
    handleImageChange,
    saveProfile,
    changePassword
  } = useProfile();
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // File input reference
  const fileInputRef = React.useRef(null);
  
  // Colors for theming
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gradientStart = useColorModeValue('teal.400', 'teal.600');
  const gradientEnd = useColorModeValue('teal.500', 'teal.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // Track active tab for animations
  const [activeTab, setActiveTab] = React.useState(0);
  
  // Toggle password visibility
  const toggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  // Handle file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Profile">
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner 
              size="xl" 
              thickness="4px" 
              color="teal.500" 
              speed="0.65s"
              emptyColor="gray.200"
            />
            <Text>Loading your profile...</Text>
          </VStack>
        </Flex>
      </DashboardLayout>
    );
  }
  
  // Determine user type for role-specific fields
  const isExhibitor = user?.role === 'exhibitor';
  const isOrganizer = user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';
  
  // Get role-specific data
  const companyData = isExhibitor ? profileData.company || {} : {};
  const organizationData = isOrganizer ? profileData.organization || {} : {};
  
  return (
    <DashboardLayout title="My Profile">
      <Container maxW="container.lg" py={6}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Profile Header Card */}
          <MotionBox
            variants={itemVariants}
            bg={bgColor}
            borderRadius="xl"
            boxShadow="md"
            overflow="hidden"
            mb={6}
            position="relative"
          >
            {/* Decorative gradient top bar */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              height="5px"
              bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
            />
            
            <Flex 
              direction={{ base: 'column', md: 'row' }}
              align="center"
              p={6}
              pt={8}
            >
              {/* Profile Image/Logo */}
              <MotionBox
                variants={itemVariants}
                position="relative"
                mr={{ base: 0, md: 8 }}
                mb={{ base: 4, md: 0 }}
                onClick={triggerFileInput}
                cursor="pointer"
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
                borderRadius="full"
                boxShadow="lg"
              >
                <Box
                  borderRadius="full"
                  boxSize={{ base: "120px", md: "150px" }}
                  overflow="hidden"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                >
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Avatar
                      size="full"
                      name={profileData.username || user?.username}
                      bg="teal.500"
                    />
                  )}
                </Box>
                
                {/* Camera overlay */}
                <Flex
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  height="40px"
                  bg="rgba(0,0,0,0.6)"
                  color="white"
                  align="center"
                  justify="center"
                  fontSize="sm"
                  borderBottomRadius="full"
                >
                  <Icon as={FiCamera} mr={2} />
                  <Text>Change Photo</Text>
                </Flex>
                
                <Input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </MotionBox>
              
              {/* Profile Info */}
              <MotionBox variants={itemVariants} flex="1">
                <Heading as="h1" size="xl" mb={2} color={headingColor}>
                  {profileData.username || user?.username}
                </Heading>
                
                <Flex align="center" mb={2}>
                  <Badge 
                    colorScheme={isAdmin ? 'purple' : isOrganizer ? 'blue' : 'orange'}
                    fontSize="md"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </Flex>
                
                <Flex align="center" mb={2}>
                  <Icon as={FiMail} mr={2} color="teal.500" />
                  <Text>{profileData.email || user?.email}</Text>
                </Flex>
                
                {isExhibitor && companyData && (
                  <Flex align="center">
                    <Icon as={FiBriefcase} mr={2} color="teal.500" />
                    <Text>{companyData.companyName || 'Company'}</Text>
                  </Flex>
                )}
                
                {isOrganizer && organizationData && (
                  <Flex align="center">
                    <Icon as={FiBriefcase} mr={2} color="teal.500" />
                    <Text>{organizationData.organizationName || 'Organization'}</Text>
                  </Flex>
                )}
              </MotionBox>
            </Flex>
          </MotionBox>
          
          {/* Profile Tabs */}
          <Tabs 
            colorScheme="teal" 
            variant="soft-rounded" 
            onChange={setActiveTab}
            index={activeTab}
          >
            <TabList mb={4} overflowX="auto" py={2}>
              <Tab mr={2}>
                <Icon as={FiUser} mr={2} />
                Personal Info
              </Tab>
              <Tab>
                <Icon as={FiLock} mr={2} />
                Security
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Personal Info Tab */}
              <TabPanel p={0}>
                <MotionBox
                  key={`tab-content-0`}
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
                    <Stack spacing={6}>
                      {/* Basic Info Section */}
                      <Box>
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
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                          {/* Username Field */}
                          <FormControl isInvalid={!!errors.username}>
                            <FormLabel>Username</FormLabel>
                            <InputGroup>
                              <Input
                                name="username"
                                value={profileData.username || ''}
                                onChange={handleProfileChange}
                                placeholder="Your username"
                                focusBorderColor="teal.400"
                              />
                            </InputGroup>
                            <FormErrorMessage>{errors.username}</FormErrorMessage>
                          </FormControl>
                          
                          {/* Email Field */}
                          <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                              <Input
                                name="email"
                                type="email"
                                value={profileData.email || ''}
                                onChange={handleProfileChange}
                                placeholder="Your email"
                                focusBorderColor="teal.400"
                              />
                            </InputGroup>
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                      
                      {/* Exhibitor-specific fields */}
                      {isExhibitor && (
                        <>
                          <Divider />
                          
                          {/* Company Section */}
                          <Box>
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
                              <FormControl>
                                <FormLabel>Company Name</FormLabel>
                                <Input
                                  name="company.companyName"
                                  value={companyData.companyName || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Company name"
                                  focusBorderColor="teal.400"
                                />
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
                              <FormControl>
                                <FormLabel>Company Address</FormLabel>
                                <Input
                                  name="company.companyAddress"
                                  value={companyData.companyAddress || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Address"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Postal Code & City */}
                              <FormControl>
                                <FormLabel>Postal Code & City</FormLabel>
                                <Input
                                  name="company.postalCity"
                                  value={companyData.postalCity || ''}
                                  onChange={handleProfileChange}
                                  placeholder="ZIP code, City"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Country */}
                              <FormControl>
                                <FormLabel>Country</FormLabel>
                                <Input
                                  name="company.country"
                                  value={companyData.country || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Country"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Website */}
                              <FormControl>
                                <FormLabel>Website</FormLabel>
                                <Input
                                  name="company.website"
                                  value={companyData.website || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Company website"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Contact Phone */}
                              <FormControl>
                                <FormLabel>Contact Phone</FormLabel>
                                <Input
                                  name="company.contactPhone"
                                  value={companyData.contactPhone || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Contact phone"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Phone Code */}
                              <FormControl>
                                <FormLabel>Phone Code</FormLabel>
                                <Input
                                  name="company.contactPhoneCode"
                                  value={companyData.contactPhoneCode || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Phone code (e.g. +1)"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
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
                          </Box>
                          
                          <Divider />
                          
                          {/* Representative Information */}
                          <Box>
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
                              <FormControl>
                                <FormLabel>Function/Position</FormLabel>
                                <Input
                                  name="representativeFunction"
                                  value={profileData.representativeFunction || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Your function in the company"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Personal Phone */}
                              <FormControl>
                                <FormLabel>Personal Phone</FormLabel>
                                <Input
                                  name="personalPhone"
                                  value={profileData.personalPhone || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Your personal phone"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Personal Phone Code */}
                              <FormControl>
                                <FormLabel>Phone Code</FormLabel>
                                <Input
                                  name="personalPhoneCode"
                                  value={profileData.personalPhoneCode || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Phone code (e.g. +1)"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                            </SimpleGrid>
                          </Box>
                        </>
                      )}
                      
                      {/* Organizer-specific fields */}
                      {isOrganizer && (
                        <>
                          <Divider />
                          
                          {/* Organization Section */}
                          <Box>
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
                              <FormControl>
                                <FormLabel>Organization Name</FormLabel>
                                <Input
                                  name="organization.organizationName"
                                  value={organizationData.organizationName || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Organization name"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Organization Address */}
                              <FormControl>
                                <FormLabel>Organization Address</FormLabel>
                                <Input
                                  name="organization.organizationAddress"
                                  value={organizationData.organizationAddress || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Address"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Postal Code & City */}
                              <FormControl>
                                <FormLabel>Postal Code & City</FormLabel>
                                <Input
                                  name="organization.postalCity"
                                  value={organizationData.postalCity || ''}
                                  onChange={handleProfileChange}
                                  placeholder="ZIP code, City"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Country */}
                              <FormControl>
                                <FormLabel>Country</FormLabel>
                                <Input
                                  name="organization.country"
                                  value={organizationData.country || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Country"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Website */}
                              <FormControl>
                                <FormLabel>Website</FormLabel>
                                <Input
                                  name="organization.website"
                                  value={organizationData.website || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Organization website"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Contact Phone */}
                              <FormControl>
                                <FormLabel>Contact Phone</FormLabel>
                                <Input
                                  name="organization.contactPhone"
                                  value={organizationData.contactPhone || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Contact phone"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                              
                              {/* Phone Code */}
                              <FormControl>
                                <FormLabel>Phone Code</FormLabel>
                                <Input
                                  name="organization.contactPhoneCode"
                                  value={organizationData.contactPhoneCode || ''}
                                  onChange={handleProfileChange}
                                  placeholder="Phone code (e.g. +1)"
                                  focusBorderColor="teal.400"
                                />
                              </FormControl>
                            </SimpleGrid>
                            
                            {/* Organization Description */}
                            <FormControl mt={5}>
                              <FormLabel>Organization Description</FormLabel>
                              <Textarea
                                name="organization.organizationDescription"
                                value={organizationData.organizationDescription || ''}
                                onChange={handleProfileChange}
                                placeholder="Organization description"
                                focusBorderColor="teal.400"
                                rows={4}
                              />
                            </FormControl>
                          </Box>
                        </>
                      )}
                      
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
                    </Stack>
                  </Box>
                </MotionBox>
              </TabPanel>
              
              {/* Security Tab */}
              <TabPanel p={0}>
                <MotionBox
                  key={`tab-content-1`}
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
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Container>
    </DashboardLayout>
  );
};

// Helper component
const SimpleGrid = ({ children, columns, spacing }) => {
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

export default Profile;