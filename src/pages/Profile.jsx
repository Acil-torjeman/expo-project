// src/pages/Profile.jsx
import React from 'react';
import {
  Container,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Spinner,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import useProfile from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import BasicInfoSection from '../components/profile/BasicInfoSection';
import CompanyInfoSection from '../components/profile/CompanyInfoSection';
import RepresentativeInfoSection from '../components/profile/RepresentativeInfoSection';
import OrganizationInfoSection from '../components/profile/OrganizationInfoSection';
import PasswordSection from '../components/profile/PasswordSection';

const MotionBox = motion(Box);

const Profile = () => {
  const { user } = useAuth();
  const profile = useProfile();
  
  // Track active tab for animations
  const [activeTab, setActiveTab] = React.useState(0);
  
  // Loading state
  if (profile.isLoading || profile.isLoadingCountries) {
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
  
  // Determine user type for role-specific fields
  const isExhibitor = user?.role === 'exhibitor';
  const isOrganizer = user?.role === 'organizer';
  
  return (
    <DashboardLayout title="My Profile">
      <Container maxW="container.lg" py={6}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Profile Header Card */}
          <ProfileHeader 
            profile={profile} 
            user={user} 
          />
          
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
                    bg={useColorModeValue('white', 'gray.800')}
                    borderRadius="xl"
                    boxShadow="md"
                    p={6}
                  >
                    {/* Basic Information */}
                    <BasicInfoSection profile={profile} />
                    
                    {/* Exhibitor-specific fields */}
                    {isExhibitor && (
                      <>
                        <CompanyInfoSection profile={profile} />
                        <RepresentativeInfoSection profile={profile} />
                      </>
                    )}
                    
                    {/* Organizer-specific fields */}
                    {isOrganizer && (
                      <OrganizationInfoSection profile={profile} />
                    )}
                  </Box>
                </MotionBox>
              </TabPanel>
              
              {/* Security Tab */}
              <TabPanel p={0}>
                <PasswordSection profile={profile} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Container>
    </DashboardLayout>
  );
};

export default Profile;