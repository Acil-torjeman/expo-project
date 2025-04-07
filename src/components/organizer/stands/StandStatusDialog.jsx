// src/components/organizer/stands/StandStatusDialog.jsx
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
  Text,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { StandStatus, getStatusColorScheme } from '../../../constants/standConstants';

const StandStatusDialog = ({
  isOpen,
  onClose,
  stand,
  newStatus,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  if (!stand) return null;
  
  // Get color scheme based on new status
  const getColorScheme = () => {
    if (newStatus === StandStatus.AVAILABLE) return 'green';
    if (newStatus === StandStatus.UNAVAILABLE) return 'red';
    return 'blue';
  };
  
  // Get title based on new status
  const getTitle = () => {
    if (newStatus === StandStatus.AVAILABLE) return 'Mark Stand as Available';
    if (newStatus === StandStatus.UNAVAILABLE) return 'Mark Stand as Unavailable';
    return 'Change Stand Status';
  };
  
  // Get description based on new status
  const getMessage = () => {
    if (newStatus === StandStatus.AVAILABLE) {
      return `Are you sure you want to mark Stand ${stand.number} as available? This will allow exhibitors to reserve it.`;
    }
    if (newStatus === StandStatus.UNAVAILABLE) {
      return `Are you sure you want to mark Stand ${stand.number} as unavailable? This will prevent exhibitors from reserving it.`;
    }
    return `Are you sure you want to change the status of Stand ${stand.number}?`;
  };
  
  // Handle confirm action
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(stand._id, newStatus, reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle close (reset reason)
  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor}
        >
          {getTitle()}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <Text mb={3}>{getMessage()}</Text>
          
          <Box display="flex" alignItems="center" mb={4}>
            <Text mr={2}>Current Status:</Text>
            <Badge colorScheme={getStatusColorScheme(stand.status)}>
              {stand.status}
            </Badge>
          </Box>
          
          <Box display="flex" alignItems="center" mb={6}>
            <Text mr={2}>New Status:</Text>
            <Badge colorScheme={getStatusColorScheme(newStatus)}>
              {newStatus}
            </Badge>
          </Box>
          
          <FormControl>
            <FormLabel>Reason (Optional)</FormLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter a reason for this status change (optional)"
              resize="vertical"
              rows={3}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme={getColorScheme()}
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StandStatusDialog;