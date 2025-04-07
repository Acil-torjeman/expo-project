// src/components/organizer/equipment/EquipmentFormModal.jsx
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
  Select,
  Textarea,
  FormErrorMessage,
  Stack,
  Switch,
  InputGroup,
  InputLeftAddon,
  Box,
  Text,
  Image,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';

// Equipment categories and units
const EQUIPMENT_CATEGORIES = [
  { value: 'stand', label: 'Stand' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'audio_visual', label: 'Audio-Visual' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'connectivity', label: 'Connectivity' },
  { value: 'other', label: 'Other' },
];

const EQUIPMENT_UNITS = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'day', label: 'Per Day' },
  { value: 'event', label: 'Per Event' },
  { value: 'piece', label: 'Per Piece' },
  { value: 'square_meter', label: 'Per Square Meter' },
];

const EquipmentFormModal = ({ 
  isOpen, 
  onClose, 
  equipment = null, 
  onSubmit 
}) => {
  const isEditMode = !!equipment;
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0',
    unit: 'piece',
    quantity: 1,
    category: 'other',
    isAvailable: true,
  });
  
  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form when equipment data changes
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        price: equipment.price !== undefined ? 
          equipment.price === Math.floor(equipment.price) ? 
            equipment.price.toString() : 
            equipment.price.toString() : 
          '',
        unit: equipment.unit || 'piece',
        quantity: equipment.quantity || 1,
        category: equipment.category || 'other',
        isAvailable: equipment.isAvailable !== undefined ? equipment.isAvailable : true,
      });
      
      // Set preview if equipment has an image
      if (equipment.imageUrl) {
        setPreviewUrl(equipment.imageUrl);
      } else {
        setPreviewUrl(null);
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        price: '0',
        unit: 'piece',
        quantity: 1,
        category: 'other',
        isAvailable: true,
      });
      setPreviewUrl(null);
    }
    
    // Clear selected file
    setSelectedFile(null);
    
    // Clear errors
    setErrors({});
  }, [equipment, isOpen]);
  
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
    if (name === 'price') {
      // Handle both comma and period as decimal separator
      let processedValue = typeof value === 'string' ? value.replace(',', '.') : value;
      
      if (typeof processedValue === 'number') {
        const valueStr = processedValue.toString();
        const decimalIndex = valueStr.indexOf('.');
        
        if (decimalIndex !== -1 && valueStr.length - decimalIndex > 4) {
          processedValue = parseFloat(valueStr.substring(0, decimalIndex + 4));
        }
      }
      
      value = isNaN(parseFloat(processedValue)) ? 0 : parseFloat(processedValue);
    }
    
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
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        setErrors(prev => ({
          ...prev,
          file: 'Only image files are accepted (JPEG, PNG, GIF)'
        }));
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must not exceed 5MB'
        }));
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
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
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate price
    let validPrice = 0;
    if (typeof formData.price === 'string') {
      const normalizedPrice = formData.price.replace(',', '.');
      validPrice = parseFloat(normalizedPrice);
    } else {
      validPrice = formData.price;
    }
    
    if (isNaN(validPrice)) {
      newErrors.price = 'Price must be a valid number';
    } else if (validPrice < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
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
      
      // Only include isAvailable for edit operations, not for create
      if (!isEditMode) {
        delete submitData.isAvailable;
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
            {isEditMode ? 'Edit Equipment' : 'Add New Equipment'}
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
                  placeholder="Equipment name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              {/* Description */}
              <FormControl isRequired isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the equipment"
                  rows={3}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>
              
              {/* Price */}
              <FormControl isRequired isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <InputLeftAddon children="$" />
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    name="price"
                    value={formData.price}
                    onChange={(e) => {
                      // Only accept digits, points, and commas
                      const inputValue = e.target.value;
                      
                      if (inputValue === '' || /^[0-9]*[.,]?[0-9]*$/.test(inputValue)) {
                        setFormData(prev => ({
                          ...prev,
                          price: inputValue
                        }));
                      }
                    }}
                    placeholder="0.000"
                    borderLeftRadius={0}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.price}</FormErrorMessage>
              </FormControl>
              
              {/* Unit */}
              <FormControl isRequired>
                <FormLabel>Pricing Unit</FormLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {EQUIPMENT_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              {/* Quantity */}
              <FormControl isRequired isInvalid={!!errors.quantity}>
                <FormLabel>Available Quantity</FormLabel>
                <Input
                  type="number"
                  min={1}
                  name="quantity"
                  value={formData.quantity}
                  onChange={(e) => handleNumberChange('quantity', parseInt(e.target.value))}
                />
                <FormErrorMessage>{errors.quantity}</FormErrorMessage>
              </FormControl>
              
              {/* Category */}
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {EQUIPMENT_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              {/* Image upload */}
              <FormControl isInvalid={!!errors.file}>
                <FormLabel>Equipment Image</FormLabel>
                <Input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
                <Button 
                  leftIcon={<FiUpload />} 
                  onClick={handleUploadClick}
                  colorScheme="gray"
                  mb={2}
                >
                  {selectedFile ? 'Change Image' : 'Upload Image'}
                </Button>
                
                {selectedFile && (
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    Selected: {selectedFile.name}
                  </Text>
                )}
                
                {previewUrl && (
                  <Box borderWidth={1} borderRadius="md" p={2} mt={2}>
                    <Image 
                      src={previewUrl} 
                      alt="Equipment preview" 
                      maxH="200px" 
                      mx="auto"
                    />
                  </Box>
                )}
                
                <FormErrorMessage>{errors.file}</FormErrorMessage>
              </FormControl>
              
              {/* Availability (only for edit mode) */}
              {isEditMode && (
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="isAvailable" mb="0">
                    Is Available
                  </FormLabel>
                  <Switch
                    id="isAvailable"
                    name="isAvailable"
                    isChecked={formData.isAvailable}
                    onChange={handleSwitchChange}
                    colorScheme="teal"
                  />
                </FormControl>
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
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EquipmentFormModal;