// src/components/common/ui/ConfirmDialog.jsx
import React from 'react';
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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const ConfirmDialog = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  body = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColorScheme = 'red',
  onConfirm,
}) => {
  // Handle confirm action
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay 
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(5px)"
      />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        mx={4}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {typeof body === 'string' ? <Text>{body}</Text> : body}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {cancelText}
          </Button>
          <Button colorScheme={confirmColorScheme} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;