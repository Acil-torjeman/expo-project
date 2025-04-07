// src/pages/Selectrole.jsx
import React, { useRef, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  SimpleGrid, 
  VStack, 
  Button, 
  Icon, 
  useColorModeValue, 
  Flex,
  HStack,
  chakra,
  Link,
  Divider,
  Image
} from '@chakra-ui/react';
import { FaBuilding, FaCalendarCheck, FaChevronDown, FaCheck, FaUser, FaEnvelope, FaUserShield, FaTools, FaFileInvoice, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import PublicLayout from '../layouts/PublicLayout';
import boothLightImg from '../assets/images/booth-light.svg';
import boothDarkImg from '../assets/images/booth-dark.svg';

// Wrap motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

const RoleCard = ({ title, description, icon, benefits, cta, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        delay: 0.2
      } 
    }
  };
  
  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        duration: 0.3,
        delay: 0.5
      } 
    }
  };

  return (
    <MotionBox
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      bg={cardBg}
      rounded="xl"
      shadow="xl"
      overflow="hidden"
      height="100%"
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-5px)', 
        shadow: '2xl',
        borderColor: 'teal.500'
      }}
    >
      <Flex justify="center" pt={6} pb={3} px={6}>
        <MotionBox
          variants={iconVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          bg={useColorModeValue('teal.50', 'rgba(56, 178, 172, 0.3)')}
          color="teal.500"
          rounded="full"
          p={4}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} w={10} h={10} />
        </MotionBox>
      </Flex>

      <VStack spacing={4} p={6} align="center" flex="1">
        <Heading as="h3" size="lg" fontWeight="bold" textAlign="center">
          {title}
        </Heading>
        
        <Text fontSize="md" textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
          {description}
        </Text>
        
        <Divider my={2} />
        
        <VStack spacing={3} align="start" w="full">
          {benefits.map((benefit, index) => (
            <HStack key={index} align="start" spacing={3}>
              <Box
                minW="22px"
                h="22px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="full"
                bg={useColorModeValue("teal.100", "teal.900")}
                color={useColorModeValue("teal.700", "teal.200")}
                mt="2px"
              >
                <Icon as={FaCheck} boxSize="10px" />
              </Box>
              <Text fontSize="sm">{benefit}</Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      
      <Box p={6} pt={0}>
        <Button
          onClick={onClick}
          colorScheme="teal"
          size="lg"
          width="full"
          fontWeight="bold"
          py={6}
          boxShadow={`0 4px 6px ${shadowColor}`}
          _hover={{ 
            transform: 'translateY(-2px)', 
            boxShadow: `0 6px 10px ${shadowColor}`,
            bgGradient: "linear(to-r, teal.500, teal.600)"
          }}
          transition="all 0.2s"
          bgGradient="linear(to-r, teal.400, teal.500)"
        >
          {cta}
        </Button>
      </Box>
    </MotionBox>
  );
};

const Feature = ({ title, description, icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        delay: 0.1
      } 
    }
  };

  return (
    <MotionBox
      ref={ref}
      variants={featureVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      maxW="sm"
      p={5}
    >
      <Flex
        rounded="full"
        w={12}
        h={12}
        bg="teal.500"
        color="white"
        justify="center"
        align="center"
        mb={4}
      >
        <Icon as={icon} fontSize="2xl" />
      </Flex>
      <Heading as="h3" size="md" mb={2} fontWeight="semibold">
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {description}
      </Text>
    </MotionBox>
  );
};

const Hero = ({ scrollToRoles }) => {
  // Use gradients instead of background images
  const bgGradient = useColorModeValue(
    'linear(to-br, white, teal.50, white)',
    'linear(to-br, gray.800, teal.900, gray.800)'
  );
  
  const buttonShadow = useColorModeValue(
    '0 4px 6px rgba(49, 151, 149, 0.25)',
    '0 4px 10px rgba(49, 151, 149, 0.6)'
  );
  
  // Use appropriate image based on color mode
  const boothImage = useColorModeValue(boothLightImg, boothDarkImg);

  return (
    <Box 
      position="relative"
      minH="calc(100vh - 64px)"
      bgGradient={bgGradient}
      overflow="hidden"
      display="flex"
      alignItems="center"
      py={0}
      mt={-1}
      borderTop="none"
    >
      {/* Decorative gradient overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bgGradient={useColorModeValue(
          "radial-gradient(circle at 30% 30%, rgba(129, 230, 217, 0.2), transparent 70%)",
          "radial-gradient(circle at 30% 30%, rgba(129, 230, 217, 0.15), transparent 70%)"
        )}
        zIndex="0"
      />

      <Container maxW="container.xl" position="relative" zIndex="1">
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          align="center" 
          justify="space-between"
        >
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            maxW={{ base: "100%", lg: "50%" }}
            pr={{ lg: 10 }}
            mb={{ base: 10, lg: 0 }}
          >
            <MotionHeading
              as="h1"
              size="2xl"
              fontWeight="bold"
              lineHeight="1.2"
              mb={6}
              bgGradient="linear(to-r, teal.400, teal.600)"
              bgClip="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Streamline Your Exhibition Management
            </MotionHeading>
            
            <MotionText
              fontSize="xl"
              color={useColorModeValue('gray.600', 'gray.400')}
              mb={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              MyExpo Platform connects exhibitors and organizers with powerful tools to create
              and manage successful exhibitions. Choose your role to get started today.
            </MotionText>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                size="lg"
                colorScheme="teal"
                rightIcon={<FaChevronDown />}
                onClick={scrollToRoles}
                boxShadow={buttonShadow}
                bgGradient="linear(to-r, teal.400, teal.500)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(49, 151, 149, 0.4)',
                  bgGradient: "linear(to-r, teal.500, teal.600)",
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                px={8}
              >
                Get Started
              </Button>
            </MotionBox>
          </MotionBox>
          
          {/* Replace image with actual booth SVG */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            maxW={{ base: "100%", lg: "50%" }}
            textAlign="center"
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            ml={{lg: "-30px"}}
          >
              <MotionBox
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{ 
                  duration: 4,
                  ease: "easeInOut", 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1 // Commence l'animation flottante après la transition initiale
                }}
              >
                <Image 
                  src={boothImage} 
                  alt="Exhibition Booth" 
                  maxH="550px" 
                  objectFit="contain"
                />
              </MotionBox>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const rolesRef = useRef(null);

  const scrollToRoles = () => {
    rolesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const exhibitorBenefits = [
    "Showcase your products and services to a targeted audience",
    "Connect with industry decision-makers and potential clients",
    "Generate high-quality leads and build your business network",
    "Gain market visibility and strengthen your brand presence",
    "Stay updated on industry trends and competitor insights"
  ];

  const organizerBenefits = [
    "Powerful tools to create and manage professional events",
    "Complete control over exhibitor applications and floor plans",
    "Streamlined communications with participants and stakeholders",
    "Comprehensive analytics and reporting capabilities",
    "Automated billing and payment processing systems"
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box 
        position="relative" 
        mt="-8" // Compense le padding top du PublicLayout
        mb="-8" // Compense le padding bottom du PublicLayout
        minH="calc(100vh - 64px + 16px)" // Ajuste pour prendre en compte les paddings
        overflow="hidden"
      >
        <Hero scrollToRoles={scrollToRoles} />
      </Box>
      
      {/* Features Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <MotionHeading
              as="h2"
              size="xl"
              fontWeight="bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Why Choose <chakra.span color="teal.500">MyExpo Platform</chakra.span>
            </MotionHeading>
            <MotionText
              fontSize="lg"
              color={useColorModeValue('gray.600', 'gray.400')}
              maxW="3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our platform offers essential tools for exhibition management, connecting
              exhibitors and organizers with everything needed for successful events.
            </MotionText>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            <Feature
              icon={FaUser}
              title="User Account Management"
              description="Simple account creation with secure email verification and password reset functionality."
            />
            <Feature
              icon={FaCalendarCheck}
              title="Event Management"
              description="Create, view, and manage exhibition events with comprehensive details and participant tracking."
            />
            <Feature
              icon={FaBuilding}
              title="Exhibitor Registration"
              description="Streamlined registration process for exhibitors with document uploads and verification."
            />
            <Feature
              icon={FaTools}
              title="Equipment Management"
              description="Organize and track all equipment needed for events, ensuring everything is properly allocated."
            />
            <Feature
              icon={FaFileInvoice}
              title="Invoice & Payment"
              description="View and manage invoices with payment tracking to keep financial records organized."
            />
            <Feature
              icon={FaBell}
              title="Notifications & Messages"
              description="Stay updated with real-time notifications and communicate directly with other users."
            />
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Role Selection Section */}
      <Box 
        py={20} 
        ref={rolesRef} 
        id="roles" 
        bg={useColorModeValue('white', 'gray.800')}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <MotionHeading
              as="h2"
              size="xl"
              fontWeight="bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Choose Your Role
            </MotionHeading>
            <MotionText
              fontSize="lg"
              color={useColorModeValue('gray.600', 'gray.400')}
              maxW="3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Register based on your role in the exhibition industry to access
              tailored features and functionality.
            </MotionText>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            <RoleCard 
              title="I am an Exhibitor"
              description="Showcase your business at industry-leading events and connect with your target audience"
              icon={FaBuilding}
              benefits={exhibitorBenefits}
              cta="Register as Exhibitor"
              onClick={() => navigate('/signup/exhibitor')}
            />
            
            <RoleCard 
              title="I am an Organizer"
              description="Create and manage exceptional exhibitions with our powerful management tools"
              icon={FaCalendarCheck}
              benefits={organizerBenefits}
              cta="Register as Organizer"
              onClick={() => navigate('/signup/organizer')}
            />
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW="container.xl">
          <MotionFlex
            direction="column"
            align="center"
            textAlign="center"
            bg={useColorModeValue('white', 'gray.800')}
            p={10}
            borderRadius="xl"
            shadow="xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="lg" mb={4}>
              Ready to Transform Your Exhibition Experience?
            </Heading>
            <Text fontSize="lg" mb={6} maxW="2xl" color={useColorModeValue('gray.600', 'gray.400')}>
              Join exhibitors and organizers who are already using MyExpo Platform
              to create successful exhibitions and meaningful connections.
            </Text>
            <HStack spacing={4}>
              <Button
                as={Link}
                href="/login"
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                px={8}
                boxShadow="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Log In
              </Button>
              <Button
                as={Link}
                href="#roles"
                onClick={scrollToRoles}
                variant="outline"
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                px={8}
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                Sign Up
              </Button>
            </HStack>
          </MotionFlex>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Home;