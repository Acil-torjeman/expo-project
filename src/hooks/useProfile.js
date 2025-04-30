// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import profileService from '../services/profile.service';
import { useAuth } from '../context/AuthContext';

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
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

 // Load profile data
useEffect(() => {
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      
      console.log('Profile data loaded:', data); // Debug log
      
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
          setProfileImageUrl(profileService.getImageUrl(imagePath));
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Could not load profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  // Handle image upload
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
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
      
      setProfileImage(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImageUrl(previewUrl);
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

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

  // Save profile changes
  const saveProfile = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      
      // If there's a new profile image, upload it first
      if (profileImage) {
        await profileService.uploadProfileImage(profileImage);
        
        toast({
          title: 'Image updated',
          description: 'Your profile image has been updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Save profile data
      const updatedProfile = await profileService.updateProfile(profileData);
      
      // Update local profile data
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
    handleProfileChange,
    handlePasswordChange,
    handleImageChange,
    saveProfile,
    changePassword
  };
};

export default useProfile;