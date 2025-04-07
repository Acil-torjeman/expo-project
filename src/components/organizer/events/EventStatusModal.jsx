// src/components/organizer/events/EventStatusModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Text,
  Flex,
  Badge,
  Stack,
  useColorModeValue,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { EventStatus, getStatusColorScheme, getStatusDisplayText } from '../../../constants/eventConstants';

const EventStatusModal = ({
  isOpen,
  onClose,
  event,
  onUpdateStatus,
}) => {
  // Tous les hooks doivent être déclarés d'abord, sans condition
  const [selectedStatus, setSelectedStatus] = useState(
    event?.status || EventStatus.DRAFT
  );
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Handle status change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  // Handle reason change
  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!event || selectedStatus === event.status) {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onUpdateStatus(event._id, selectedStatus, reason);
      onClose();
    } catch (error) {
      console.error('Error updating event status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get alert message based on status change
  const getAlertMessage = () => {
    if (!event) return null;
    
    if (selectedStatus === EventStatus.PUBLISHED && event.status !== EventStatus.PUBLISHED) {
      return {
        type: 'info',
        message: 'Publishing this event will make it visible to all eligible exhibitors.'
      };
    } else if (selectedStatus === EventStatus.CANCELLED && event.status !== EventStatus.CANCELLED) {
      return {
        type: 'warning',
        message: 'Cancelling this event will prevent new registrations and notify all registered exhibitors.'
      };
    } else if (selectedStatus === EventStatus.COMPLETED && event.status !== EventStatus.COMPLETED) {
      return {
        type: 'info',
        message: 'Marking this event as completed will archive it and prevent further modifications.'
      };
    }
    return null;
  };
  
  const alertMessage = getAlertMessage();

  // Rendu conditionnel du contenu plutôt que du composant entier
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          Update Event Status
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          {event ? (
            <Stack spacing={4}>
              <Flex align="center" mb={2}>
                <Text fontWeight="medium" mr={2}>Current Status:</Text>
                <Badge colorScheme={getStatusColorScheme(event.status)} px={2} py={1}>
                  {getStatusDisplayText(event.status)}
                </Badge>
              </Flex>
              
              <FormControl>
                <FormLabel>New Status</FormLabel>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  {Object.entries(EventStatus).map(([key, value]) => (
                    <option key={key} value={value}>
                      {getStatusDisplayText(value)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              {alertMessage && (
                <Alert status={alertMessage.type} borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{alertMessage.message}</Text>
                </Alert>
              )}
              
              <FormControl mt={4}>
                <FormLabel>Reason (Optional)</FormLabel>
                <Textarea
                  value={reason}
                  onChange={handleReasonChange}
                  placeholder="Provide a reason for this status change"
                  rows={4}
                />
              </FormControl>
            </Stack>
          ) : (
            <Text>Loading event data...</Text>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          {event && (
            <Button
              colorScheme={getStatusColorScheme(selectedStatus)}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={selectedStatus === event.status}
            >
              Update Status
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventStatusModal;