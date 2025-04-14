// src/components/exhibitor/events/RegistrationModal.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
} from '@chakra-ui/react';
import { FiInfo, FiAlertTriangle, FiBriefcase, FiMapPin, FiPhone, FiEdit } from 'react-icons/fi';

const RegistrationModal = ({
  isOpen,
  onClose,
  event,
  exhibitor,
  onRegister,
  isRegistering,
}) => {
  const [participationNote, setParticipationNote] = useState('');
  const cancelRef = useRef();
  const navigate = useNavigate();
  
  // Colors
  const warningBgColor = useColorModeValue('yellow.50', 'yellow.900');
  const warningTextColor = useColorModeValue('yellow.700', 'yellow.200');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700');
  const infoBgColor = useColorModeValue('blue.50', 'blue.900');
  const infoTextColor = useColorModeValue('blue.700', 'blue.200');
  
  // Check if exhibitor has company data
  const hasCompany = exhibitor && exhibitor.company;
  
  // Check if exhibitor's sector is included in event's allowed sectors
  const isSectorAllowed = hasCompany && exhibitor.company.sector && 
    event?.allowedSectors?.includes(exhibitor.company.sector);
  
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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size="lg"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Register for {event?.name}
          </AlertDialogHeader>
          
          <AlertDialogBody>
            {/* Sector compatibility warning */}
            {hasCompany && exhibitor.company.sector && !isSectorAllowed && (
              <Box mb={4} p={3} bg={warningBgColor} borderRadius="md">
                <HStack spacing={2} color={warningTextColor}>
                  <Icon as={FiAlertTriangle} />
                  <Text fontWeight="medium">Sector Compatibility Warning</Text>
                </HStack>
                <Text fontSize="sm" color={warningTextColor} mt={1}>
                  Your company's sector "{exhibitor.company.sector}" is not listed in the event's allowed sectors. 
                  You can still register, but the organizer might reject your registration.
                </Text>
              </Box>
            )}
            
            <Text mb={4}>
              This will submit your registration request for this event. Your registration will need to be approved by the organizer.
            </Text>
            
            {/* Company Information Section */}
            {hasCompany ? (
              <Box mb={4} p={4} bg={sectionBgColor} borderRadius="md">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold">Your Company Information</Text>
                  <Button 
                    size="sm" 
                    leftIcon={<FiEdit />} 
                    variant="outline"
                    onClick={goToProfile}
                  >
                    Edit Profile
                  </Button>
                </Flex>
                <Divider mb={3} />
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FiBriefcase} color="teal.500" />
                    <Text fontWeight="medium">Company:</Text>
                    <Text>{exhibitor.company.companyName}</Text>
                  </HStack>
                  
                  {exhibitor.company.sector && (
                    <HStack>
                      <Icon as={FiInfo} color="teal.500" />
                      <Text fontWeight="medium">Sector:</Text>
                      <Text>
                        {exhibitor.company.sector}
                        {!isSectorAllowed && (
                          <Badge ml={2} colorScheme="yellow">Not in event sectors</Badge>
                        )}
                      </Text>
                    </HStack>
                  )}
                  
                  <HStack>
                    <Icon as={FiMapPin} color="teal.500" />
                    <Text fontWeight="medium">Location:</Text>
                    <Text>{exhibitor.company.companyAddress}, {exhibitor.company.country}</Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiPhone} color="teal.500" />
                    <Text fontWeight="medium">Contact:</Text>
                    <Text>
                      {exhibitor.company.contactPhoneCode} {exhibitor.company.contactPhone}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ) : (
              <Box mb={4} p={3} bg={warningBgColor} borderRadius="md">
                <HStack spacing={2} color={warningTextColor}>
                  <Icon as={FiAlertTriangle} />
                  <Text fontWeight="medium">Company Information Missing</Text>
                </HStack>
                <Text fontSize="sm" color={warningTextColor} mt={1}>
                  Please update your company profile before registering.
                </Text>
                <Button 
                  size="sm" 
                  leftIcon={<FiEdit />} 
                  colorScheme="yellow"
                  variant="outline"
                  mt={2}
                  onClick={goToProfile}
                >
                  Update Profile
                </Button>
              </Box>
            )}
            
            {/* Participation Note */}
            <FormControl>
              <Text fontWeight="medium" mb={2}>
                Participation Note (Optional)
              </Text>
              <Textarea
                placeholder="Tell the organizer more about your interest in this event..."
                value={participationNote}
                onChange={(e) => setParticipationNote(e.target.value)}
                rows={4}
              />
            </FormControl>
            
            {/* What happens next info */}
            <Box mt={4} p={3} bg={infoBgColor} borderRadius="md">
              <HStack spacing={2} color={infoTextColor}>
                <Icon as={FiInfo} />
                <Text fontWeight="medium">What happens next?</Text>
              </HStack>
              <Text fontSize="sm" color={infoTextColor} mt={1}>
                After approval, you'll be able to select stands and equipment for your participation.
              </Text>
            </Box>
          </AlertDialogBody>
          
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              ml={3}
              onClick={handleSubmit}
              isLoading={isRegistering}
            >
              Submit Registration
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default RegistrationModal;