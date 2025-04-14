// src/components/organizer/registrations/ReviewRegistrationModal.jsx
import React, { useState } from 'react';
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
  FormLabel,
  Textarea,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  Box,
} from '@chakra-ui/react';
import { RegistrationStatus } from '../../../constants/registrationConstants';

const ReviewRegistrationModal = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  registration,
  isSubmitting = false,
}) => {
  const [reviewStatus, setReviewStatus] = useState(RegistrationStatus.APPROVED);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleSubmit = () => {
    if (reviewStatus === RegistrationStatus.APPROVED) {
      onApprove();
    } else {
      onReject(rejectionReason);
    }
  };
  
  const handleClose = () => {
    // Reset form state when closing
    setReviewStatus(RegistrationStatus.APPROVED);
    setRejectionReason('');
    onClose();
  };
  
  if (!registration) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Registration</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Text mb={4}>
            Review registration request from{' '}
            <strong>
              {registration.exhibitor?.company?.companyName || 'Unknown Company'}
            </strong>
          </Text>
          
          <FormControl mb={4}>
            <FormLabel>Decision</FormLabel>
            <RadioGroup value={reviewStatus} onChange={setReviewStatus}>
              <Stack direction="column" spacing={2}>
                <Radio value={RegistrationStatus.APPROVED} colorScheme="green">
                  Approve Registration
                </Radio>
                <Radio value={RegistrationStatus.REJECTED} colorScheme="red">
                  Reject Registration
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          
          {reviewStatus === RegistrationStatus.REJECTED && (
            <FormControl>
              <FormLabel>Rejection Reason</FormLabel>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
              />
              <Alert status="info" mt={2} size="sm" fontSize="sm">
                <AlertIcon />
                This reason will be included in the rejection email sent to the exhibitor.
              </Alert>
            </FormControl>
          )}
          
          {reviewStatus === RegistrationStatus.APPROVED && (
            <Box mt={4}>
              <Alert status="info" size="sm" fontSize="sm">
                <AlertIcon />
                An approval email will be sent to the exhibitor. They will then be able to select stands and equipment for their participation.
              </Alert>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme={reviewStatus === RegistrationStatus.APPROVED ? 'green' : 'red'}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={reviewStatus === RegistrationStatus.REJECTED && !rejectionReason.trim()}
          >
            {reviewStatus === RegistrationStatus.APPROVED ? 'Approve' : 'Reject'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReviewRegistrationModal;