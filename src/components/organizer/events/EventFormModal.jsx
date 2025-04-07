// src/components/organizer/events/EventFormModal.jsx
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
  Select,
  Box,
  Text,
  Grid,
  GridItem,
  Switch,
  Checkbox,
  CheckboxGroup,
  Flex,
  Divider,
  Badge,
  IconButton,
  Image,
  Alert,
  AlertIcon,
  Progress,
  HStack,
  Heading,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiUpload, 
  FiX, 
  FiImage, 
  FiCheck, 
  FiArrowRight, 
  FiArrowLeft,
} from 'react-icons/fi';
import { IndustrySectors, getAllSectors, getSubsectors } from '../../../constants/industrySectors';
import { EventStatus, EventVisibility } from '../../../constants/eventConstants';
import EquipmentSelection from './EquipmentSelection';
import PlanSelection from './PlanSelection';
import SectorSubsectorSelection from './SectorSubsectorSelection';
import { useAuth } from '../../../context/AuthContext';
import { getEventImageUrl } from '../../../utils/fileUtils';

const EventFormModal = ({ 
  isOpen, 
  onClose, 
  event = null, 
  onSubmit 
}) => {
  const toast = useToast();
  const isEditMode = !!event;
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Form steps
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Basic Information", "Location", "Categories", "Settings", "Floor Plan", "Equipment", "Review"];
  
  // Equipment state
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  
  // Plan state
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
    openingHours: '',
    location: {
      address: '',
      city: '',
      postalCode: '',
      country: ''
    },
    allowedSectors: [],
    allowedSubsectors: [],
    allowedCountries: [],
    maxExhibitors: '',
    registrationDeadline: '',
    status: EventStatus.DRAFT,
    visibility: EventVisibility.PUBLIC,
    specialConditions: '',
  });
  
  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Available subsectors based on selected sectors
  const [availableSubsectors, setAvailableSubsectors] = useState([]);
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Colors

  
  // Initialize form when event data changes
  useEffect(() => {
    if (event) {
      // Format dates for the form inputs
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };
      
      // Edit mode - populate form with event data
      // Ensure sectors and subsectors are stored as strings
      const normalizedSectors = event.allowedSectors?.map(sector => String(sector)) || [];
      const normalizedSubsectors = event.allowedSubsectors?.map(subsector => String(subsector)) || [];
      
      setFormData({
        name: event.name || '',
        type: event.type || '',
        description: event.description || '',
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        openingHours: event.openingHours || '',
        location: {
          address: event.location?.address || '',
          city: event.location?.city || '',
          postalCode: event.location?.postalCode || '',
          country: event.location?.country || ''
        },
        allowedSectors: normalizedSectors,
        allowedSubsectors: normalizedSubsectors,
        allowedCountries: event.allowedCountries || [],
        maxExhibitors: event.maxExhibitors || '',
        registrationDeadline: formatDate(event.registrationDeadline),
        status: event.status || EventStatus.DRAFT,
        visibility: event.visibility || EventVisibility.PUBLIC,
        specialConditions: event.specialConditions || '',
      });
      
      // If event has an image, show it with proper URL
      if (event.imagePath) {
        setImagePreview(getEventImageUrl(event.imagePath));
      }
      
      // Update available subsectors based on selected sectors
      updateAvailableSubsectors(normalizedSectors);
      
      // If the event has associated equipment, set it
      if (event.equipmentIds && Array.isArray(event.equipmentIds)) {
        // Ensure all equipment IDs are strings for consistent comparison
        const normalizedEquipmentIds = event.equipmentIds.map(id => String(id));
        setSelectedEquipment(normalizedEquipmentIds);
      } else {
        setSelectedEquipment([]);
      }
      
      // If the event has an associated plan, set it
      if (event.plan) {
        const planId = typeof event.plan === 'object' ? event.plan._id : event.plan;
        setSelectedPlanId(String(planId));
      } else {
        setSelectedPlanId('');
      }
    } else {
      // Create mode - reset form
      resetForm();
    }
    
    // Reset errors
    setErrors({});
    
    // Reset to first step
    setCurrentStep(0);
  }, [event, isOpen]);
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      startDate: '',
      endDate: '',
      openingHours: '',
      location: {
        address: '',
        city: '',
        postalCode: '',
        country: ''
      },
      allowedSectors: [],
      allowedSubsectors: [],
      allowedCountries: [],
      maxExhibitors: '',
      registrationDeadline: '',
      status: EventStatus.DRAFT,
      visibility: EventVisibility.PUBLIC,
      specialConditions: '',
    });
    
    setImageFile(null);
    setImagePreview(null);
    setSelectedEquipment([]);
    setAvailableSubsectors([]);
    setSelectedPlanId('');
  };
  
  // Update available subsectors when selected sectors change
  const updateAvailableSubsectors = (selectedSectors) => {
    if (!selectedSectors || selectedSectors.length === 0) {
      setAvailableSubsectors([]);
      return;
    }
    
    const subsectors = [];
    selectedSectors.forEach(sectorId => {
      const sectSubsectors = getSubsectors(sectorId);
      if (sectSubsectors && sectSubsectors.length) {
        subsectors.push(...sectSubsectors);
      }
    });
    
    setAvailableSubsectors([...new Set(subsectors)]); // Remove duplicates
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for nested location properties
    if (name.startsWith('location.')) {
      const locationProperty = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationProperty]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      [name]: checked ? EventVisibility.PRIVATE : EventVisibility.PUBLIC
    }));
  };
  
  // Handle checkbox group changes
  const handleCheckboxGroupChange = (name, values) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
    
    // If sectors changed, update available subsectors
    if (name === 'allowedSectors') {
      updateAvailableSubsectors(values);
      
      // Clear subsectors that are no longer available
      setFormData(prev => {
        const newSubsectors = prev.allowedSubsectors.filter(
          subsector => {
            // Check if this subsector belongs to any of the selected sectors
            for (const sectorId of values) {
              if (getSubsectors(sectorId).includes(subsector)) {
                return true;
              }
            }
            return false;
          }
        );
        
        return {
          ...prev,
          allowedSubsectors: newSubsectors
        };
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or GIF image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size must be less than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Set image file and preview
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear error
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };
  
  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    // Step 0: Basic Information
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Event name is required';
      }
      
      if (!formData.type.trim()) {
        newErrors.type = 'Event type is required';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      if (!formData.openingHours.trim()) {
        newErrors.openingHours = 'Opening hours are required';
      }
      
      if (!isEditMode && !imageFile) {
        newErrors.image = 'Event image is required';
      }
    }
    
    // Step 1: Location
    else if (currentStep === 1) {
      if (!formData.location.address.trim()) {
        newErrors['location.address'] = 'Address is required';
      }
      
      if (!formData.location.city.trim()) {
        newErrors['location.city'] = 'City is required';
      }
      
      if (!formData.location.postalCode.trim()) {
        newErrors['location.postalCode'] = 'Postal code is required';
      }
      
      if (!formData.location.country.trim()) {
        newErrors['location.country'] = 'Country is required';
      }
    }
    
    // Step 2: Categories
    else if (currentStep === 2) {
      if (formData.allowedSectors.length === 0) {
        newErrors.allowedSectors = 'At least one industry sector is required';
      }
      
      if (formData.allowedSubsectors.length === 0) {
        newErrors.allowedSubsectors = 'At least one subsector is required';
      }
      
      if (!formData.registrationDeadline) {
        newErrors.registrationDeadline = 'Registration deadline is required';
      } else if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
        newErrors.registrationDeadline = 'Registration deadline must be before event start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Move to next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submitting
    const newErrors = {};
    
    // Basic required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.type.trim()) {
      newErrors.type = 'Event type is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.openingHours.trim()) {
      newErrors.openingHours = 'Opening hours are required';
    }
    
    if (!isEditMode && !imageFile) {
      newErrors.image = 'Event image is required';
    }
    
    // Location
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }
    
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }
    
    if (!formData.location.postalCode.trim()) {
      newErrors['location.postalCode'] = 'Postal code is required';
    }
    
    if (!formData.location.country.trim()) {
      newErrors['location.country'] = 'Country is required';
    }
    
    // Industry sectors
    if (formData.allowedSectors.length === 0) {
      newErrors.allowedSectors = 'At least one industry sector is required';
    }
    
    if (formData.allowedSubsectors.length === 0) {
      newErrors.allowedSubsectors = 'At least one subsector is required';
    }
    
    // Registration deadline
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    } else if (new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
      newErrors.registrationDeadline = 'Registration deadline must be before event start date';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Go to the first step with errors
      if (Object.keys(newErrors).some(key => 
        key === 'name' || key === 'type' || key === 'description' || 
        key === 'startDate' || key === 'endDate' || key === 'openingHours' || key === 'image'
      )) {
        setCurrentStep(0);
      } else if (Object.keys(newErrors).some(key => key.startsWith('location.'))) {
        setCurrentStep(1);
      } else if (Object.keys(newErrors).some(key => 
        key === 'allowedSectors' || key === 'allowedSubsectors' || 
        key === 'registrationDeadline' || key === 'maxExhibitors'
      )) {
        setCurrentStep(2);
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        // Convert maxExhibitors to number if present
        maxExhibitors: formData.maxExhibitors ? parseInt(formData.maxExhibitors, 10) : undefined,
        // Add the selected plan ID if present
        planId: selectedPlanId || null,
      };
      
      // Pass the event data, image file, and selected equipment to the parent component
      const result = await onSubmit(submitData, imageFile, selectedEquipment);
      
      if (result) {
        onClose();
      }
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
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderLocationStep();
      case 2:
        return renderCategoriesStep();
      case 3:
        return renderSettingsStep();
      case 4:
        return renderPlanStep();
      case 5:
        return renderEquipmentStep();
      case 6:
        return renderReviewStep();
      default:
        return null;
    }
  };
  
  // Step 0: Basic Information
  const renderBasicInfoStep = () => {
    return (
      <Stack spacing={4}>
        {/* General error */}
        {errors.general && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {errors.general}
          </Alert>
        )}
        
        {/* Event Image */}
        <FormControl isRequired isInvalid={!!errors.image}>
          <FormLabel>Event Image</FormLabel>
          <Box>
            {imagePreview ? (
              <Box position="relative" mb={3}>
                <Image 
                  src={imagePreview} 
                  alt="Event Preview" 
                  boxSize="200px" 
                  objectFit="cover" 
                  borderRadius="md"
                />
                <IconButton
                  icon={<FiX />}
                  aria-label="Remove image"
                  position="absolute"
                  top={2}
                  right={2}
                  size="sm"
                  colorScheme="red"
                  onClick={handleRemoveImage}
                />
              </Box>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={6}
                mb={3}
                cursor="pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <FiImage size={40} color="gray.400" style={{ marginBottom: '8px' }} />
                <Text>Click to upload event image</Text>
                <Text fontSize="xs" color="gray.500">JPEG, PNG or GIF, up to 5MB</Text>
              </Flex>
            )}
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/gif"
              display="none"
            />
            <Button
              leftIcon={<FiUpload />}
              onClick={() => fileInputRef.current.click()}
              size="sm"
              colorScheme="teal"
              variant="outline"
            >
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
            <FormErrorMessage>{errors.image}</FormErrorMessage>
          </Box>
        </FormControl>
        
        {/* Event Name */}
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Event Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter event name"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>
        
        {/* Event Type */}
        <FormControl isRequired isInvalid={!!errors.type}>
          <FormLabel>Event Type</FormLabel>
          <Input
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="e.g., Conference, Trade Show, Exhibition"
          />
          <FormErrorMessage>{errors.type}</FormErrorMessage>
        </FormControl>
        
        {/* Description */}
        <FormControl isRequired isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event"
            rows={4}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>
        
        {/* Dates */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isRequired isInvalid={!!errors.startDate}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.startDate}</FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl isRequired isInvalid={!!errors.endDate}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.endDate}</FormErrorMessage>
            </FormControl>
          </GridItem>
        </Grid>
        
        {/* Opening Hours */}
        <FormControl isRequired isInvalid={!!errors.openingHours}>
          <FormLabel>Opening Hours</FormLabel>
          <Input
            name="openingHours"
            value={formData.openingHours}
            onChange={handleChange}
            placeholder="e.g., 09:00 - 18:00 daily"
          />
          <FormErrorMessage>{errors.openingHours}</FormErrorMessage>
        </FormControl>
      </Stack>
    );
  };
  
  // Step 1: Location
  const renderLocationStep = () => {
    return (
      <Stack spacing={4}>
        {/* Address */}
        <FormControl isRequired isInvalid={!!errors['location.address']}>
          <FormLabel>Address</FormLabel>
          <Input
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            placeholder="Street address"
          />
          <FormErrorMessage>{errors['location.address']}</FormErrorMessage>
        </FormControl>
        
        {/* City */}
        <FormControl isRequired isInvalid={!!errors['location.city']}>
          <FormLabel>City</FormLabel>
          <Input
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            placeholder="City"
          />
          <FormErrorMessage>{errors['location.city']}</FormErrorMessage>
        </FormControl>
        
        {/* Postal Code */}
        <FormControl isRequired isInvalid={!!errors['location.postalCode']}>
          <FormLabel>Postal Code</FormLabel>
          <Input
            name="location.postalCode"
            value={formData.location.postalCode}
            onChange={handleChange}
            placeholder="Postal code"
          />
          <FormErrorMessage>{errors['location.postalCode']}</FormErrorMessage>
        </FormControl>
        
        {/* Country */}
        <FormControl isRequired isInvalid={!!errors['location.country']}>
          <FormLabel>Country</FormLabel>
          <Input
            name="location.country"
            value={formData.location.country}
            onChange={handleChange}
            placeholder="Country"
          />
          <FormErrorMessage>{errors['location.country']}</FormErrorMessage>
        </FormControl>
      </Stack>
    );
  };
  
  // Step 2: Categories
  const renderCategoriesStep = () => {
    return (
      <Stack spacing={4}>
        {/* Use the new sector/subsector selection component */}
        <SectorSubsectorSelection 
          selectedSectors={formData.allowedSectors}
          selectedSubsectors={formData.allowedSubsectors}
          onSectorsChange={(newSectors) => handleCheckboxGroupChange('allowedSectors', newSectors)}
          onSubsectorsChange={(newSubsectors) => handleCheckboxGroupChange('allowedSubsectors', newSubsectors)}
          errors={errors}
        />
        
        <Divider my={3} />
        
        {/* Registration Deadline */}
        <FormControl isRequired isInvalid={!!errors.registrationDeadline}>
          <FormLabel>Registration Deadline</FormLabel>
          <Input
            type="date"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.registrationDeadline}</FormErrorMessage>
        </FormControl>
        
        {/* Max Exhibitors */}
        <FormControl isInvalid={!!errors.maxExhibitors}>
          <FormLabel>Maximum Exhibitors (Optional)</FormLabel>
          <Input
            type="number"
            name="maxExhibitors"
            value={formData.maxExhibitors}
            onChange={handleChange}
            placeholder="Leave empty for unlimited"
            min={1}
          />
          <FormErrorMessage>{errors.maxExhibitors}</FormErrorMessage>
        </FormControl>
      </Stack>
    );
  };
  
  // Step 3: Settings
  const renderSettingsStep = () => {
    return (
      <Stack spacing={4}>
        {/* Event Status */}
        <FormControl>
          <FormLabel>Event Status</FormLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {Object.entries(EventStatus).map(([key, value]) => (
              <option key={key} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Draft events are not visible to exhibitors until published
          </Text>
        </FormControl>
        
        {/* Visibility */}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="visibility" mb="0">
            Private Event
          </FormLabel>
          <Switch
            id="visibility"
            name="visibility"
            isChecked={formData.visibility === EventVisibility.PRIVATE}
            onChange={handleSwitchChange}
            colorScheme="teal"
          />
        </FormControl>
        <Text fontSize="sm" color="gray.500" mb={3}>
          Private events are only visible to invited exhibitors
        </Text>
        
        {/* Special Conditions */}
        <FormControl>
          <FormLabel>Special Conditions or Requirements (Optional)</FormLabel>
          <Textarea
            name="specialConditions"
            value={formData.specialConditions}
            onChange={handleChange}
            placeholder="Any special conditions or requirements for exhibitors"
            rows={4}
          />
        </FormControl>
      </Stack>
    );
  };
  
  // Step 4: Plan Selection
  const renderPlanStep = () => {
    return (
      <Stack spacing={4}>
        <Heading as="h3" size="md" mb={3}>
          Select Floor Plan
        </Heading>
        
        <PlanSelection
          selectedPlanId={selectedPlanId}
          onPlanChange={setSelectedPlanId}
          userId={user?.id}
        />
        
        <Box mt={4}>
          <Text fontSize="sm" color="gray.500">
            Note: You can skip this step and associate a floor plan later
          </Text>
        </Box>
      </Stack>
    );
  };
  
  // Step 5: Equipment
  const renderEquipmentStep = () => {
    return (
      <Stack spacing={4}>
        <Text fontWeight="medium" mb={2}>Select Equipment for This Event</Text>
        
        <EquipmentSelection 
          selectedEquipment={selectedEquipment}
          onEquipmentChange={setSelectedEquipment}
        />
      </Stack>
    );
  };
  
  // Step 6: Review
  const renderReviewStep = () => {
    return (
      <Stack spacing={6}>
        <Text fontWeight="medium" fontSize="lg">Review Event Information</Text>
        
        {/* Basic info */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Basic Information</Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <Box>
              <Text fontWeight="medium">Name</Text>
              <Text>{formData.name}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Type</Text>
              <Text>{formData.type}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Dates</Text>
              <Text>{formData.startDate} to {formData.endDate}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Hours</Text>
              <Text>{formData.openingHours}</Text>
            </Box>
          </Grid>
        </Box>
        
        <Divider />
        
        {/* Location */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Location</Text>
          <Text>{formData.location.address}</Text>
          <Text>{formData.location.city}, {formData.location.postalCode}</Text>
          <Text>{formData.location.country}</Text>
        </Box>
        
        <Divider />
        
        {/* Categories */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Categories</Text>
          <Text fontWeight="medium">Industry Sectors</Text>
          <Flex wrap="wrap" gap={2} mb={3}>
            {formData.allowedSectors.map(sectorId => (
              <Badge key={sectorId} colorScheme="blue">
                {IndustrySectors[sectorId]?.name || sectorId}
              </Badge>
            ))}
          </Flex>
          
          <Text fontWeight="medium">Subsectors</Text>
          <Flex wrap="wrap" gap={2}>
            {formData.allowedSubsectors.map(subsector => (
              <Badge key={subsector} colorScheme="teal">
                {subsector}
              </Badge>
            ))}
          </Flex>
        </Box>
        
        <Divider />
        
        {/* Floor Plan */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Floor Plan</Text>
          {selectedPlanId ? (
            <Badge colorScheme="green">Selected</Badge>
          ) : (
            <Text color="gray.500">No floor plan selected</Text>
          )}
        </Box>
        
        <Divider />
        
        {/* Equipment */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Equipment</Text>
          {selectedEquipment.length === 0 ? (
            <Text color="gray.500">No equipment selected</Text>
          ) : (
            <Flex wrap="wrap" gap={2}>
              <Badge colorScheme="purple">
                {selectedEquipment.length} item(s) selected
              </Badge>
            </Flex>
          )}
        </Box>
        
        <Divider />
        
        {/* Settings */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Settings</Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            <Box>
              <Text fontWeight="medium">Status</Text>
              <Badge colorScheme={formData.status === 'published' ? 'green' : 'yellow'}>
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </Badge>
            </Box>
            <Box>
              <Text fontWeight="medium">Visibility</Text>
              <Badge colorScheme={formData.visibility === 'public' ? 'green' : 'purple'}>
                {formData.visibility.charAt(0).toUpperCase() + formData.visibility.slice(1)}
              </Badge>
            </Box>
            <Box>
              <Text fontWeight="medium">Maximum Exhibitors</Text>
              <Text>{formData.maxExhibitors || 'Unlimited'}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium">Registration Deadline</Text>
              <Text>{formData.registrationDeadline}</Text>
            </Box>
          </Grid>
        </Box>
      </Stack>
    );
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </ModalHeader>
        <ModalCloseButton />
        
        {/* Progress bar */}
        <Box px={6} pt={2} pb={4}>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="medium">{steps[currentStep]}</Text>
            <Text color="gray.500" fontSize="sm">
              Step {currentStep + 1} of {steps.length}
            </Text>
          </Flex>
          <Progress
            value={(currentStep + 1) / steps.length * 100}
            size="sm"
            colorScheme="teal"
            borderRadius="full"
          />
        </Box>
        
        <ModalBody>
          {renderStepContent()}
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor="gray.200">
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <HStack spacing={3}>
            {currentStep > 0 && (
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={handlePrevStep}
                variant="outline"
              >
                Back
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                rightIcon={<FiArrowRight />}
                colorScheme="teal"
                onClick={handleNextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                leftIcon={<FiCheck />}
                colorScheme="teal"
                type="submit" 
                isLoading={isSubmitting}
                loadingText="Saving"
              >
                {isEditMode ? 'Update Event' : 'Create Event'}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventFormModal;