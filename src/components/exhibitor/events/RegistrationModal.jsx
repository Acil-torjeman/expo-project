// src/components/exhibitor/events/RegistrationModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  Text,
  Textarea,
  Box,
  HStack,
  Icon,
  VStack,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
  Heading,
  Tag, // Added this import
} from '@chakra-ui/react';
import { FiInfo, FiAlertTriangle, FiBriefcase, FiMapPin, FiPhone, FiEdit, FiUser, FiFileText, FiTag } from 'react-icons/fi';

const RegistrationModal = ({
  isOpen,
  onClose,
  event,
  exhibitor,
  onRegister,
  isRegistering,
}) => {
  const [participationNote, setParticipationNote] = useState('');
  const navigate = useNavigate();
  
  // Colors
  const warningBgColor = useColorModeValue('yellow.50', 'yellow.900');
  const warningTextColor = useColorModeValue('yellow.700', 'yellow.200');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700');
  const infoBgColor = useColorModeValue('blue.50', 'blue.900');
  const infoTextColor = useColorModeValue('blue.700', 'blue.200');
  const modalBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Check if exhibitor has company data
  const hasCompany = exhibitor && exhibitor.company;
  
  // Check if exhibitor's sector is included in event's allowed sectors (case-insensitive)
  const isSectorAllowed = (() => {
    if (!hasCompany || !exhibitor.company.sector || !event?.allowedSectors) return false;
    
    // Convert company sector to lowercase for comparison
    const companySector = exhibitor.company.sector.toLowerCase();
    
    // Convert all event sectors to lowercase and check if company sector is included
    return event.allowedSectors.some(sector => 
      sector.toLowerCase() === companySector
    );
  })();
  
  // Check if exhibitor's subsector is included in event's allowed subsectors (case-insensitive)
  const isSubsectorAllowed = (() => {
    if (!hasCompany || !exhibitor.company.subsector || !event?.allowedSubsectors) return false;
    
    // Convert company subsector to lowercase for comparison
    const companySubsector = exhibitor.company.subsector.toLowerCase();
    
    // Convert all event subsectors to lowercase and check if company subsector is included
    return event.allowedSubsectors.some(subsector => 
      subsector.toLowerCase() === companySubsector
    );
  })();
  
  // Check if either sector or subsector is allowed
  const hasSectorMatch = isSectorAllowed || isSubsectorAllowed;
  
  const handleSubmit = () => {
    onRegister({
      eventId: event._id,
      participationNote
    });
  };
  
  const goToProfile = () => {
    navigate('/exhibitor/settings');
    onClose();
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent 
        maxH="85vh" 
        display="flex" 
        flexDirection="column"
        borderRadius="xl"
      >
        {/* Fixed Header */}
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor} 
          position="sticky" 
          top="0" 
          bg={modalBg}
          zIndex="1"
          py={4}
          borderTopRadius="xl"
          textAlign="center"
        >
          Register for {event?.name}
          <ModalCloseButton />
        </ModalHeader>
        
        {/* Scrollable Body */}
        <ModalBody flex="1" overflow="auto" py={5} px={6}>
          {/* Sector compatibility warning */}
          {hasCompany && (exhibitor.company.sector || exhibitor.company.subsector) && !hasSectorMatch && (
            <Box mb={5} p={4} bg={warningBgColor} borderRadius="lg">
              <HStack spacing={3} color={warningTextColor}>
                <Icon as={FiAlertTriangle} boxSize={5} />
                <Text fontWeight="medium">Sector Compatibility Warning</Text>
              </HStack>
              <Text fontSize="sm" color={warningTextColor} mt={2} ml={8}>
                Your company's sector/subsector doesn't match the event's allowed categories. 
                You can still register, but the organizer might reject your registration.
              </Text>
            </Box>
          )}
          
          <Text mb={5} textAlign="center">
            This will submit your registration request for this event. Your registration will need to be approved by the organizer.
          </Text>
          
          {/* Exhibitor Information Section */}
          <Heading size="sm" mb={3} textAlign="center">Verification Information</Heading>
          <Text fontSize="sm" mb={5} color="gray.500" textAlign="center">
            Please verify that the following information is correct before submitting your registration.
          </Text>
          
          {/* Personal Information */}
          <Box mb={5} p={5} bg={sectionBgColor} borderRadius="lg">
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontWeight="bold">Personal Information</Text>
            </Flex>
            <Divider mb={4} />
            <VStack align="start" spacing={3}>
              {exhibitor && (
                <>
                  <HStack>
                    <Icon as={FiUser} color="teal.500" />
                    <Text fontWeight="medium">Representative:</Text>
                    <Text>{exhibitor.user?.username || exhibitor.user?.email || 'Not specified'}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiInfo} color="teal.500" />
                    <Text fontWeight="medium">Function:</Text>
                    <Text>{exhibitor.representativeFunction || 'Not specified'}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiPhone} color="teal.500" />
                    <Text fontWeight="medium">Contact:</Text>
                    <Text>
                      {exhibitor.personalPhoneCode} {exhibitor.personalPhone}
                    </Text>
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
          
          {/* Company Information Section */}
          {hasCompany ? (
            <Box mb={5} p={5} bg={sectionBgColor} borderRadius="lg">
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="bold">Company Information</Text>
                <Button 
                  size="sm" 
                  leftIcon={<FiEdit />} 
                  variant="outline"
                  colorScheme="teal"
                  borderRadius="full"
                  onClick={goToProfile}
                >
                  Edit Profile
                </Button>
              </Flex>
              <Divider mb={4} />
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FiBriefcase} color="teal.500" />
                  <Text fontWeight="medium">Company:</Text>
                  <Text>{exhibitor.company.companyName}</Text>
                </HStack>
                
                {exhibitor.company.sector && (
                  <HStack>
                    <Icon as={FiTag} color="teal.500" />
                    <Text fontWeight="medium">Sector:</Text>
                    <Text>
                      {exhibitor.company.sector}
                      {!isSectorAllowed && (
                        <Badge ml={2} colorScheme="yellow" borderRadius="full">
                          Not in event sectors
                        </Badge>
                      )}
                    </Text>
                  </HStack>
                )}
                
                {exhibitor.company.subsector && (
                  <HStack>
                    <Icon as={FiTag} color="teal.500" />
                    <Text fontWeight="medium">Subsector:</Text>
                    <Text>
                      {exhibitor.company.subsector}
                      {!isSubsectorAllowed && (
                        <Badge ml={2} colorScheme="yellow" borderRadius="full">
                          Not in event subsectors
                        </Badge>
                      )}
                    </Text>
                  </HStack>
                )}
                
                {exhibitor.company.registrationNumber && (
                  <HStack>
                    <Icon as={FiFileText} color="teal.500" />
                    <Text fontWeight="medium">Registration Number:</Text>
                    <Text>{exhibitor.company.registrationNumber}</Text>
                  </HStack>
                )}
                
                <HStack alignItems="flex-start">
                  <Icon as={FiMapPin} color="teal.500" mt={1} />
                  <Text fontWeight="medium">Address:</Text>
                  <Text>{exhibitor.company.companyAddress}, {exhibitor.company.postalCity}, {exhibitor.company.country}</Text>
                </HStack>
                
                <HStack>
                  <Icon as={FiPhone} color="teal.500" />
                  <Text fontWeight="medium">Company Contact:</Text>
                  <Text>
                    {exhibitor.company.contactPhoneCode} {exhibitor.company.contactPhone}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          ) : (
            <Box mb={5} p={4} bg={warningBgColor} borderRadius="lg">
              <HStack spacing={3} color={warningTextColor}>
                <Icon as={FiAlertTriangle} boxSize={5} />
                <Text fontWeight="medium">Company Information Missing</Text>
              </HStack>
              <Text fontSize="sm" color={warningTextColor} mt={2} mb={3}>
                Please update your company profile before registering.
              </Text>
              <Flex justifyContent="center">
                <Button 
                  leftIcon={<FiEdit />} 
                  colorScheme="yellow"
                  variant="outline"
                  borderRadius="full"
                  onClick={goToProfile}
                >
                  Update Profile
                </Button>
              </Flex>
            </Box>
          )}
          
          {/* Event Categories Section */}
          <Box mb={5} p={5} bg={sectionBgColor} borderRadius="lg">
            <Text fontWeight="bold" mb={3}>Event Categories</Text>
            <Divider mb={4} />
            
            {/* Show event sectors */}
            {event?.allowedSectors && event.allowedSectors.length > 0 && (
              <Box mb={3}>
                <Text fontWeight="medium" mb={2}>Allowed Sectors:</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {event.allowedSectors.map((sector, index) => (
                    <Tag key={index} colorScheme="teal" borderRadius="full">
                      {sector}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
            
            {/* Show event subsectors */}
            {event?.allowedSubsectors && event.allowedSubsectors.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2}>Allowed Subsectors:</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {event.allowedSubsectors.map((subsector, index) => (
                    <Tag key={index} colorScheme="blue" borderRadius="full">
                      {subsector}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
          
          {/* Participation Note */}
          <FormControl mb={5}>
            <Text fontWeight="medium" mb={3} textAlign="center">
              Participation Note (Optional)
            </Text>
            <Textarea
              placeholder="Tell the organizer more about your interest in this event..."
              value={participationNote}
              onChange={(e) => setParticipationNote(e.target.value)}
              rows={4}
              borderRadius="md"
              resize="vertical"
              focusBorderColor="teal.400"
            />
          </FormControl>
          
          {/* What happens next info */}
          <Box p={4} bg={infoBgColor} borderRadius="lg">
            <HStack spacing={3} color={infoTextColor}>
              <Icon as={FiInfo} boxSize={5} />
              <Text fontWeight="medium">What happens next?</Text>
            </HStack>
            <Text fontSize="sm" color={infoTextColor} mt={2} ml={8}>
              After approval, you'll be able to select stands and equipment for your participation.
            </Text>
          </Box>
        </ModalBody>
        
        {/* Fixed Footer */}
        <ModalFooter 
          borderTopWidth="1px" 
          borderColor={borderColor}
          position="sticky" 
          bottom="0"
          bg={modalBg}
          zIndex="1"
          py={4}
          borderBottomRadius="xl"
          justifyContent="center"
          gap={3}
        >
          <Button 
            variant="outline" 
            borderRadius="full"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            borderRadius="full"
            onClick={handleSubmit}
            isLoading={isRegistering}
            isDisabled={!hasCompany}
            px={6}
          >
            Submit Registration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RegistrationModal;