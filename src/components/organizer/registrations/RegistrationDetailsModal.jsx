// src/components/organizer/registrations/RegistrationDetailsModal.jsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Box,
  Icon,
  Heading,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin, FiInfo, FiFileText } from 'react-icons/fi';
import { getStatusColorScheme, getStatusDisplayText } from '../../../constants/registrationConstants';
import { getFileUrl } from '../../../utils/fileUtils';
import apiConfig from '../../../config/api.config';

const RegistrationDetailsModal = ({
  isOpen,
  onClose,
  registration,
  onApprove,
  onReject,
  isPending = false,
}) => {
  if (!registration) return null;
  
  // Extract data safely with proper cascading fallbacks
  const exhibitor = registration.exhibitor || {};
  const company = exhibitor.company || {};
  const user = exhibitor.user || {};
  const event = registration.event || {};
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Theme colors
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  
  // Format phone number with country code
  const formatPhone = (phoneCode, phone) => {
    if (!phone) return 'N/A';
    return `${phoneCode || ''} ${phone}`;
  };
  
  // Check if exhibitor data exists
  const hasExhibitorData = Object.keys(exhibitor).length > 0;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Registration Details
          <Badge
            ml={2}
            colorScheme={getStatusColorScheme(registration.status)}
            fontSize="sm"
          >
            {getStatusDisplayText(registration.status)}
          </Badge>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {/* Event details */}
          <Box mb={4} p={4} bg={sectionBg} borderRadius="md">
            <Heading size="sm" mb={2}>Event Information</Heading>
            <Text><strong>Event:</strong> {event?.name || 'Unknown Event'}</Text>
            <Text><strong>Registration Date:</strong> {formatDate(registration.createdAt)}</Text>
            
            {registration.status === 'approved' && registration.approvalDate && (
              <Text><strong>Approval Date:</strong> {formatDate(registration.approvalDate)}</Text>
            )}
            
            {registration.status === 'rejected' && registration.rejectionDate && (
              <Text><strong>Rejection Date:</strong> {formatDate(registration.rejectionDate)}</Text>
            )}
          </Box>
          
          {/* Exhibitor information */}
          {hasExhibitorData ? (
            <Box mb={4}>
              <Heading size="sm" mb={3}>Exhibitor Information</Heading>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiUser} color="teal.500" />
                  <Text><strong>Representative:</strong> {user?.username || user?.email || 'N/A'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiMail} color="teal.500" />
                  <Text><strong>Email:</strong> {user?.email || 'N/A'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiInfo} color="teal.500" />
                  <Text><strong>Function:</strong> {exhibitor?.representativeFunction || 'N/A'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiPhone} color="teal.500" />
                  <Text><strong>Contact:</strong> {formatPhone(exhibitor?.personalPhoneCode, exhibitor?.personalPhone)}</Text>
                </HStack>
              </VStack>
            </Box>
          ) : (
            <Box mb={4} p={4} bg="yellow.50" borderRadius="md">
              <HStack color="yellow.800">
                <Icon as={FiInfo} />
                <Text fontWeight="medium">Exhibitor information not available</Text>
              </HStack>
            </Box>
          )}
          
          <Divider my={4} />
          
          {/* Company information */}
          {hasExhibitorData && Object.keys(company).length > 0 ? (
            <Box mb={4}>
              <Heading size="sm" mb={3}>Company Information</Heading>
              <HStack mb={3}>
                <Avatar 
                  name={company?.companyName || 'Unknown Company'} 
                  src={company?.companyLogoPath ? 
                    getFileUrl(`${apiConfig.UPLOADS.LOGOS}/${company.companyLogoPath}`) : 
                    undefined
                  }
                  size="md"
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{company?.companyName || 'Unknown Company'}</Text>
                  <Text fontSize="sm" color="gray.500">{company?.country || 'N/A'}</Text>
                </VStack>
              </HStack>
              
              <VStack align="start" spacing={2} mt={2}>
                <HStack>
                  <Icon as={FiMapPin} color="teal.500" />
                  <Text><strong>Address:</strong> {
                    company?.companyAddress ? 
                    `${company.companyAddress}, ${company.postalCity || ''}, ${company.country || ''}` : 
                    'N/A'
                  }</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiBriefcase} color="teal.500" />
                  <Text><strong>Sector:</strong> {company?.sector || 'N/A'}</Text>
                </HStack>
                
                {company?.subsector && (
                  <HStack>
                    <Icon as={FiBriefcase} color="teal.500" />
                    <Text><strong>Subsector:</strong> {company.subsector}</Text>
                  </HStack>
                )}
                
                <HStack>
                  <Icon as={FiFileText} color="teal.500" />
                  <Text><strong>Registration Number:</strong> {company?.registrationNumber || 'N/A'}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiPhone} color="teal.500" />
                  <Text><strong>Company Phone:</strong> {formatPhone(company?.contactPhoneCode, company?.contactPhone)}</Text>
                </HStack>
              </VStack>
            </Box>
          ) : (
            <Box mb={4} p={4} bg="yellow.50" borderRadius="md">
              <HStack color="yellow.800">
                <Icon as={FiInfo} />
                <Text fontWeight="medium">Company information not available</Text>
              </HStack>
            </Box>
          )}
          
          {/* Participation note */}
          {registration.participationNote && (
            <Box mb={4} p={4} bg={sectionBg} borderRadius="md">
              <Heading size="sm" mb={2}>Participation Note</Heading>
              <Text>{registration.participationNote}</Text>
            </Box>
          )}
          
          {/* Rejection reason */}
          {registration.status === 'rejected' && registration.rejectionReason && (
            <Box mb={4} p={4} bg="red.50" borderRadius="md">
              <Heading size="sm" mb={2} color="red.700">Rejection Reason</Heading>
              <Text color="red.700">{registration.rejectionReason}</Text>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          {isPending ? (
            <>
              <Button colorScheme="red" variant="outline" mr={3} onClick={onReject}>
                Reject
              </Button>
              <Button colorScheme="green" onClick={onApprove}>
                Approve
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RegistrationDetailsModal;