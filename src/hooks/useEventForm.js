// src/hooks/useEventForm.js
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { EventStatus, EventVisibility } from '../constants/eventConstants';
import { getSubsectors } from '../constants/industrySectors';
import { getEventImageUrl } from '../utils/fileUtils';

const useEventForm = (event = null, onSubmit, isOpen) => {
  const toast = useToast();
  const isEditMode = !!event;
  const fileInputRef = useRef(null);

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
        // Add equipment IDs
        equipmentIds: selectedEquipment
      };
      
      // Pass the event data and image file to the parent component
      return await onSubmit(submitData, imageFile);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Display specific error if available
      if (error.message) {
        setErrors(prev => ({
          ...prev,
          general: error.message
        }));
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    formData,
    imageFile,
    imagePreview,
    selectedEquipment,
    selectedPlanId,
    errors,
    isSubmitting,
    currentStep,
    steps,
    availableSubsectors,
    isEditMode,
    fileInputRef,
    
    // Methods
    handleChange,
    handleSwitchChange,
    handleCheckboxGroupChange,
    handleImageUpload,
    handleRemoveImage,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    setSelectedEquipment,
    setSelectedPlanId,
    validateStep
  };
};

export default useEventForm;