// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import profileService from '../services/profile.service';
import { useAuth } from '../context/AuthContext';
import industrySectors from '../constants/industrySectors';

const useProfile = () => {
  const toast = useToast();
  const { user, updateUser } = useAuth();
  
  // States
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [countries, setCountries] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load countries from API or localStorage cache
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Check localStorage cache first
        const cachedData = localStorage.getItem('countries-cache');
        const cacheTimestamp = localStorage.getItem('countries-cache-timestamp');
        
        if (cachedData && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < 24 * 60 * 60 * 1000) { // 24 hours
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setCountries(parsedData);
              setIsLoadingCountries(false);
              return;
            }
          }
        }
        
        // No valid cache, fetch from API
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd');
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format countries data
        const formattedCountries = data
          .filter(country => country.idd && country.idd.root)
          .map(country => {
            const suffix = country.idd.suffixes ? country.idd.suffixes[0] || '' : '';
            return {
              name: country.name.common,
              code: country.idd.root + suffix,
              flag: country.flags.png || country.flags.svg
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        
        // Place Tunisia first (if it exists)
        const tunisiaIndex = formattedCountries.findIndex(c => c.name === 'Tunisia');
        if (tunisiaIndex > 0) {
          const tunisia = formattedCountries.splice(tunisiaIndex, 1)[0];
          formattedCountries.unshift(tunisia);
        }
        
        // Cache the data
        try {
          localStorage.setItem('countries-cache', JSON.stringify(formattedCountries));
          localStorage.setItem('countries-cache-timestamp', Date.now().toString());
        } catch (e) {
          console.warn("Could not cache countries data:", e);
        }
        
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error loading countries:", error);
        // Use fallback countries if needed
        const fallbackCountries = [
          { name: 'Tunisia', code: '+216', flag: 'https://flagcdn.com/w320/tn.png' },
          { name: 'France', code: '+33', flag: 'https://flagcdn.com/w320/fr.png' },
          { name: 'United States', code: '+1', flag: 'https://flagcdn.com/w320/us.png' },
          { name: 'Germany', code: '+49', flag: 'https://flagcdn.com/w320/de.png' },
          { name: 'United Kingdom', code: '+44', flag: 'https://flagcdn.com/w320/gb.png' },
        ];
        setCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, []);

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getProfile();
        
        // Set profile data
        setProfileData(data);
        
        // Set profile image URL based on user role
        if (data) {
          let imagePath = null;
          
          if (user?.role === 'exhibitor' && data.company) {
            imagePath = data.company.companyLogoPath;
          } else if (user?.role === 'organizer') {
            imagePath = data.organizationLogoPath;
          } else {
            // Admin or fallback
            imagePath = data.avatar;
          }
          
          if (imagePath) {
            setProfileImageUrl(profileService.getImageUrl(imagePath, user?.role));
          }
        }
      } catch (error) {
        // Error handling...
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);

  // Handle profile form changes
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (dot notation)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle password form changes
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle country change
  const handleCountryChange = useCallback((countryName) => {
    const selectedCountry = countries.find(c => c.name === countryName);
    
    if (selectedCountry) {
      if (user?.role === 'exhibitor') {
        setProfileData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            country: countryName,
            contactPhoneCode: selectedCountry.code
          },
          personalPhoneCode: selectedCountry.code
        }));
      } else if (user?.role === 'organizer') {
        setProfileData(prev => ({
          ...prev,
          country: countryName,
          contactPhoneCode: selectedCountry.code
        }));
      }
    }
  }, [countries, user]);

  // Handle sector change
  const handleSectorChange = useCallback((e) => {
    const sectorValue = e.target.value;
    
    if (user?.role === 'exhibitor') {
      setProfileData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          sector: sectorValue,
          subsector: '' // Reset subsector when sector changes
        }
      }));
    }
  }, [user]);

  // Handle image upload
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('File selected:', file?.name, file?.type, file?.size);
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, or GIF)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 2MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Store the file in state for later upload
      setProfileImage(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImageUrl(previewUrl);
      
      console.log('File stored in state and preview created');
    }
  }, [toast]);

  // Validate profile form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Basic validation
    if (!profileData.username?.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!profileData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Exhibitor validation
    if (user?.role === 'exhibitor' && profileData.company) {
      const company = profileData.company;
      
      if (!company.companyName?.trim()) {
        newErrors['company.companyName'] = 'Company name is required';
      }
      
      if (!company.companyAddress?.trim()) {
        newErrors['company.companyAddress'] = 'Company address is required';
      }
      
      if (!company.postalCity?.trim()) {
        newErrors['company.postalCity'] = 'Postal code and city are required';
      }
      
      if (!company.country?.trim()) {
        newErrors['company.country'] = 'Country is required';
      }
      
      if (!company.sector?.trim()) {
        newErrors['company.sector'] = 'Sector is required';
      }
      
      if (!company.subsector?.trim()) {
        newErrors['company.subsector'] = 'Subsector is required';
      }
      
      if (!company.registrationNumber?.trim()) {
        newErrors['company.registrationNumber'] = 'Registration number is required';
      }
      
      if (!company.contactPhone?.trim()) {
        newErrors['company.contactPhone'] = 'Contact phone is required';
      } else if (!/^[0-9]+$/.test(company.contactPhone)) {
        newErrors['company.contactPhone'] = 'Phone number must contain only digits';
      }
      
      if (!profileData.representativeFunction?.trim()) {
        newErrors.representativeFunction = 'Representative function is required';
      }
      
      if (!profileData.personalPhone?.trim()) {
        newErrors.personalPhone = 'Personal phone is required';
      } else if (!/^[0-9]+$/.test(profileData.personalPhone)) {
        newErrors.personalPhone = 'Phone number must contain only digits';
      }
    }
    
    // Organizer validation
    if (user?.role === 'organizer') {
      if (!profileData.organizationName?.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      
      if (!profileData.organizationAddress?.trim()) {
        newErrors.organizationAddress = 'Organization address is required';
      }
      
      if (!profileData.postalCity?.trim()) {
        newErrors.postalCity = 'Postal code and city are required';
      }
      
      if (!profileData.country?.trim()) {
        newErrors.country = 'Country is required';
      }
      
      if (!profileData.contactPhone?.trim()) {
        newErrors.contactPhone = 'Contact phone is required';
      } else if (!/^[0-9]+$/.test(profileData.contactPhone)) {
        newErrors.contactPhone = 'Phone number must contain only digits';
      }
    }
    
   
    setErrors(newErrors);
  
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the highlighted fields to save your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    return !hasErrors;
  }, [profileData, user, toast]);

  // Validate password form
  const validatePasswordForm = useCallback(() => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  // Get subsectors for selected sector
  const getSubsectors = useCallback(() => {
    if (user?.role === 'exhibitor' && profileData.company?.sector) {
      const sector = industrySectors.find(s => s.name === profileData.company.sector);
      return sector ? sector.subsectors : [];
    }
    return [];
  }, [profileData.company?.sector, user?.role]);

  // Save profile changes
  const saveProfile = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      // If there's a new profile image, upload it first
      if (profileImage) {
        try {
          console.log('Uploading profile image:', profileImage.name, profileImage.type, profileImage.size);
          const uploadResult = await profileService.uploadProfileImage(profileImage);
          console.log('Upload result:', uploadResult);
          
          // Get fresh data after image upload
          const updatedProfile = await profileService.getProfile();
          
          // IMPORTANT: Update our local state with new data before proceeding
          setProfileData(updatedProfile);
          
          // Update image URL based on role
          if (user?.role === 'exhibitor' && updatedProfile.company) {
            const imageUrl = profileService.getImageUrl(updatedProfile.company.companyLogoPath, user?.role);
            setProfileImageUrl(imageUrl);
          } else if (user?.role === 'organizer') {
            const imageUrl = profileService.getImageUrl(updatedProfile.organizationLogoPath, user?.role);
            setProfileImageUrl(imageUrl);
          } else {
            const imageUrl = profileService.getImageUrl(updatedProfile.avatar, user?.role);
            setProfileImageUrl(imageUrl);
          }
          
          // After image upload, SKIP the profile update to avoid overwriting the logo
          toast({
            title: 'Profile updated',
            description: 'Your profile image has been updated successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          // Reset profile image state
          setProfileImage(null);
          
          // Return early - do not proceed with profile update
          return;
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: 'Image upload failed',
            description: error.message || 'Failed to upload image',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      // Only proceed with profile data update if no image was uploaded
      const updatedProfile = await profileService.updateProfile(profileData);
      setProfileData(updatedProfile);
      
      // Update auth context if needed
      if (updateUser && updatedProfile) {
        updateUser({
          ...user,
          username: updatedProfile.username,
          email: updatedProfile.email
        });
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [profileData, profileImage, validateForm, toast, updateUser, user]);
  
  // Change password
  const changePassword = useCallback(async () => {
    if (!validatePasswordForm()) return;
    
    try {
      setIsSaving(true);
      
      await profileService.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [passwordData, validatePasswordForm, toast]);

  return {
    profileData,
    passwordData,
    profileImageUrl,
    isLoading,
    isSaving,
    errors,
    countries,
    isLoadingCountries,
    handleProfileChange,
    handlePasswordChange,
    handleImageChange,
    handleCountryChange,
    handleSectorChange,
    getSubsectors,
    saveProfile,
    changePassword
  };
};

export default useProfile;