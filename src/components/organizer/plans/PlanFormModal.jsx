// src/components/organizer/plans/PlanFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  Input,
  Textarea,
  FormErrorMessage,
  Stack,
  Switch,
  Box,
  Text,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';

const PlanFormModal = ({ 
  isOpen, 
  onClose, 
  plan = null, 
  onSubmit 
}) => {
  const isEditMode = !!plan;
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  
  // PDF file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form when plan data changes
  useEffect(() => {
    if (plan) {
      // Edit mode
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
      
      // Set PDF filename if exists
      if (plan.pdfPath) {
        setFileName(plan.pdfPath);
      } else {
        setFileName(null);
      }
    } else {
      // Create mode
      setFormData({
        name: '',
        description: '',
        isActive: true,
      });
      setFileName(null);
    }
    
    // Clear selected file
    setSelectedFile(null);
    
    // Clear errors
    setErrors({});
  }, [plan, isOpen]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle switch changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle file changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({
          ...prev,
          file: 'Only PDF files are accepted'
        }));
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must not exceed 10MB'
        }));
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      
      // Clear error
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!isEditMode && !selectedFile) {
      newErrors.file = 'PDF file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      
      // For new plans, remove isActive as it will be set by the backend
      if (!isEditMode) {
        delete submitData.isActive;
      } else {
        // Make sure isActive is a boolean, not a string (for edit mode only)
        if (submitData.isActive !== undefined) {
          submitData.isActive = Boolean(submitData.isActive);
        }
      }
      
      await onSubmit(submitData, selectedFile);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Display specific error if available
      if (error.message) {
        setErrors(prev => ({
          ...prev,
          general: error.message
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEditMode ? 'Edit Floor Plan' : 'Add New Floor Plan'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Stack spacing={4}>
              {/* General error */}
              {errors.general && (
                <Box bg="red.50" p={3} borderRadius="md" color="red.500">
                  {errors.general}
                </Box>
              )}
              
              {/* Name */}
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Floor plan name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              {/* Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description of the floor plan"
                  rows={3}
                />
              </FormControl>
              
              {/* PDF upload */}
              <FormControl isInvalid={!!errors.file}>
                <FormLabel>
                  {isEditMode ? 'Update PDF File' : 'PDF File *'}
                </FormLabel>
                <Input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <Button 
                  leftIcon={<FiUpload />} 
                  onClick={handleUploadClick}
                  colorScheme="gray"
                  mb={2}
                >
                  {selectedFile ? 'Change PDF' : isEditMode ? 'Update PDF' : 'Upload PDF'}
                </Button>
                
                {(selectedFile || fileName) && (
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {selectedFile ? `Selected: ${selectedFile.name}` : `Current file: ${fileName}`}
                  </Text>
                )}
                
                <FormErrorMessage>{errors.file}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving"
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default PlanFormModal;