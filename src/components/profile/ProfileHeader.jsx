// src/components/profile/ProfileHeader.jsx
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Icon,
  Avatar,
  Image,
  Input,
  useColorModeValue
} from '@chakra-ui/react';
import { FiMail, FiBriefcase, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ProfileHeader = ({ profile, user }) => {
  const {
    profileData,
    profileImageUrl,
    handleImageChange
  } = profile;
  
  // File input reference
  const fileInputRef = React.useRef(null);
  
  // Colors for theming
  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const gradientStart = useColorModeValue('teal.400', 'teal.600');
  const gradientEnd = useColorModeValue('teal.500', 'teal.700');
  
  // Animation variant
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  // Handle file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Determine user type
  const isExhibitor = user?.role === 'exhibitor';
  const isOrganizer = user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';
  
  // Get role-specific data
  const companyData = isExhibitor ? profileData.company || {} : {};
  
  return (
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
          
          {isOrganizer && (
            <Flex align="center">
              <Icon as={FiBriefcase} mr={2} color="teal.500" />
              <Text>{profileData.organizationName || 'Organization'}</Text>
            </Flex>
          )}
        </MotionBox>
      </Flex>
    </MotionBox>
  );
};

export default ProfileHeader;