// src/components/organizer/stands/StandFormModal.jsx
import React, { useState, useEffect } from 'react';
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
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Text,
  Switch,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { StandType, StandStatus } from '../../../constants/standConstants';

const StandFormModal = ({ 
  isOpen, 
  onClose, 
  stand = null, 
  onSubmit,
  planId,
  planName,
}) => {
  const isEditMode = !!stand;
  
  // Form state
  const [formData, setFormData] = useState({
    number: '',
    area: 1,
    basePrice: 0,
    type: StandType.STANDARD,
    description: '',
    status: StandStatus.AVAILABLE,
    features: [''],
  });
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form when stand data changes
  useEffect(() => {
    if (stand) {
      // Edit mode - populate form with stand data
      setFormData({
        number: stand.number || '',
        area: stand.area || 1,
        basePrice: stand.basePrice || 0,
        type: stand.type || StandType.STANDARD,
        description: stand.description || '',
        status: stand.status || StandStatus.AVAILABLE,
        features: stand.features?.length ? [...stand.features] : [''],
      });
    } else {
      // Create mode - reset form
      setFormData({
        number: '',
        area: 1,
        basePrice: 0,
        type: StandType.STANDARD,
        description: '',
        status: StandStatus.AVAILABLE,
        features: [''],
      });
    }
    
    // Clear errors
    setErrors({});
  }, [stand, isOpen]);
  
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
  
  // Handle number input changes
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
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
    // For status, toggle between available and unavailable
    if (name === 'isAvailable') {
      setFormData(prev => ({
        ...prev,
        status: checked ? StandStatus.AVAILABLE : StandStatus.UNAVAILABLE
      }));
    }
  };
  
  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };
  
  // Add new feature
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  // Remove feature
  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      features: newFeatures.length ? newFeatures : [''] // Ensure at least one empty feature
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.number.trim()) {
      newErrors.number = 'Stand number is required';
    }
    
    if (!formData.area || formData.area <= 0) {
      newErrors.area = 'Area must be greater than 0';
    }
    
    if (formData.basePrice < 0) {
      newErrors.basePrice = 'Base price cannot be negative';
    }
    
    if (!formData.type) {
      newErrors.type = 'Stand type is required';
    }
    
    // Remove empty features
    const filteredFeatures = formData.features.filter(f => f.trim() !== '');
    formData.features = filteredFeatures.length ? filteredFeatures : [];
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
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
      
      // Add plan ID if provided and not in edit mode
      if (planId && !isEditMode) {
        submitData.plan = planId;
      }
      
      // Remove status if creating a new stand (backend will set default)
      if (!isEditMode) {
        delete submitData.status;
      }
      
      // Remove empty features
      submitData.features = submitData.features.filter(f => f.trim() !== '');
      
      await onSubmit(submitData);
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
            {isEditMode ? 'Edit Stand' : 'Add New Stand'}
            {planName && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                Plan: {planName}
              </Text>
            )}
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
              
              {/* Stand Number */}
              <FormControl isRequired isInvalid={!!errors.number}>
                <FormLabel>Stand Number</FormLabel>
                <Input
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="A1, B2, etc."
                />
                <FormErrorMessage>{errors.number}</FormErrorMessage>
              </FormControl>
              
              {/* Area */}
              <FormControl isRequired isInvalid={!!errors.area}>
                <FormLabel>Area (m²)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.area}
                  onChange={(valueString) => handleNumberChange('area', valueString)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.area}</FormErrorMessage>
              </FormControl>
              
              {/* Base Price */}
              <FormControl isRequired isInvalid={!!errors.basePrice}>
                <FormLabel>Base Price (USD)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.basePrice}
                  onChange={(valueString) => handleNumberChange('basePrice', valueString)}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.basePrice}</FormErrorMessage>
              </FormControl>
              
              {/* Stand Type */}
              <FormControl isRequired isInvalid={!!errors.type}>
                <FormLabel>Stand Type</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {Object.entries(StandType).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.type}</FormErrorMessage>
              </FormControl>
              
              {/* Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description of the stand"
                  rows={3}
                />
              </FormControl>
              
              {/* Features */}
              <FormControl>
                <FormLabel>Features</FormLabel>
                {formData.features.map((feature, index) => (
                  <Flex key={index} mb={2}>
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      mr={2}
                    />
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeFeature(index)}
                      isDisabled={formData.features.length <= 1}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))}
                <Button size="sm" onClick={addFeature} mt={2}>
                  Add Feature
                </Button>
              </FormControl>
              
              {/* Availability (Status) */}
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isAvailable" mb="0">
                  Available for Booking
                </FormLabel>
                <Switch
                  id="isAvailable"
                  name="isAvailable"
                  isChecked={formData.status === StandStatus.AVAILABLE}
                  onChange={handleSwitchChange}
                  colorScheme="green"
                />
              </FormControl>
              
              {/* Current Status (in edit mode) */}
              {isEditMode && (
                <Box>
                  <FormLabel>Current Status</FormLabel>
                  <Badge
                    colorScheme={
                      formData.status === StandStatus.AVAILABLE
                        ? 'green'
                        : formData.status === StandStatus.RESERVED
                        ? 'blue'
                        : 'red'
                    }
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {formData.status}
                  </Badge>
                  {formData.status === StandStatus.RESERVED && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      Note: Reserved stands cannot be directly modified. An exhibitor has already booked this stand.
                    </Text>
                  )}
                </Box>
              )}
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
              isDisabled={isEditMode && formData.status === StandStatus.RESERVED}
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default StandFormModal;