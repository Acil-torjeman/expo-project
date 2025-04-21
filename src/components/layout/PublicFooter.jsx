// src/components/layout/PublicFooter.jsx
import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Image,
  Flex,
  HStack,
  VStack,
  Link,
  Icon,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiMail, FiGlobe, FiPhoneCall } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import logoFull from '../../assets/MyExpo.svg';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'white');
  const linkColor = useColorModeValue('gray.600', 'gray.400');
  const linkHoverColor = useColorModeValue('teal.500', 'teal.300');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      color={textColor}
      borderTopWidth={1}
      borderStyle="solid"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Elements - using gradients instead of images */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        opacity="0.05"
        zIndex="0"
        backgroundImage={
          useColorModeValue(
            "radial-gradient(circle at 25% 0%, rgba(56, 178, 172, 0.6) 0%, transparent 25%), " +
            "radial-gradient(circle at 75% 80%, rgba(129, 230, 217, 0.4) 0%, transparent 30%)",
            "radial-gradient(circle at 25% 0%, rgba(56, 178, 172, 0.2) 0%, transparent 20%), " +
            "radial-gradient(circle at 75% 80%, rgba(56, 178, 172, 0.3) 0%, transparent 30%)"
          )
        }
      />

      <Container as={Stack} maxW={'6xl'} py={10} position="relative" zIndex="1">
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          {/* First column with logo and about text */}
          <Stack spacing={6}>
            <Box>
              <Image src={logoFull} alt="MyExpo Platform" maxWidth="150px" />
            </Box>
            <Text fontSize={'sm'}>
              MyExpo is the comprehensive platform for managing international exhibitions,
              connecting exhibitors with event organizers worldwide.
            </Text>
            <HStack spacing={5}>
              <Link href="https://facebook.com" isExternal aria-label="Facebook">
                <Icon as={FaFacebook} w={5} h={5} color={linkColor} _hover={{ color: linkHoverColor }} />
              </Link>
              <Link href="https://twitter.com" isExternal aria-label="Twitter">
                <Icon as={FaTwitter} w={5} h={5} color={linkColor} _hover={{ color: linkHoverColor }} />
              </Link>
              <Link href="https://linkedin.com" isExternal aria-label="LinkedIn">
                <Icon as={FaLinkedin} w={5} h={5} color={linkColor} _hover={{ color: linkHoverColor }} />
              </Link>
              <Link href="https://instagram.com" isExternal aria-label="Instagram">
                <Icon as={FaInstagram} w={5} h={5} color={linkColor} _hover={{ color: linkHoverColor }} />
              </Link>
            </HStack>
          </Stack>

          {/* Solutions column */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>
              Solutions
            </Text>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>For Exhibitors</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>For Organizers</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Exhibition Management</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Analytics & Insights</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Registration System</Link>
          </Stack>

          {/* Resources column */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>
              Resources
            </Text>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Blog</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Case Studies</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Documentation</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Tutorials</Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>Support Center</Link>
          </Stack>

          {/* Contact column - Updated with Tunisia */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>
              Contact
            </Text>
            <VStack spacing={3} align="start">
              <HStack>
                <Icon as={FiMail} color={linkHoverColor} />
                <Link href="mailto:info@myexpo.com" color={linkColor} _hover={{ color: linkHoverColor }}>
                  info@myexpo.com
                </Link>
              </HStack>
              <HStack>
                <Icon as={FiPhoneCall} color={linkHoverColor} />
                <Link href="tel:+21612345678" color={linkColor} _hover={{ color: linkHoverColor }}>
                  +216 12 345 678
                </Link>
              </HStack>
              <HStack>
                <Icon as={FiGlobe} color={linkHoverColor} />
                <Text fontSize="sm">Tunisia</Text>
              </HStack>
            </VStack>
          </Stack>
        </SimpleGrid>

        <Divider my={6} borderColor={borderColor} />

        {/* Bottom footer area with links and copyright */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
          fontSize="sm"
        >
          <Text>
            © {currentYear} MyExpo Platform. Made with love by {' '} 
            <Link href="https://eyeotech.com/" isExternal color={linkColor} _hover={{ color: linkHoverColor }}>
              Eyeotech ♥
            </Link>
          </Text>
          <HStack spacing={4} mt={{ base: 4, md: 0 }}>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>
              Terms
            </Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>
              Privacy
            </Link>
            <Link as={RouterLink} to="#" color={linkColor} _hover={{ color: linkHoverColor }}>
              Cookies
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}