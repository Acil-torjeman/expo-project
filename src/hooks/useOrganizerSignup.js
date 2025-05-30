// src/hooks/useOrganizerSignup.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const fallbackCountries = [
  { name: 'France', code: '+33', flag: 'https://flagcdn.com/w320/fr.png' },
  { name: 'United States', code: '+1', flag: 'https://flagcdn.com/w320/us.png' },
  { name: 'United Kingdom', code: '+44', flag: 'https://flagcdn.com/w320/gb.png' },
  { name: 'Germany', code: '+49', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Spain', code: '+34', flag: 'https://flagcdn.com/w320/es.png' },
];

const ORGANIZER_FORM_FIELDS = {
  organizationName: '',
  organizationAddress: '',
  postalCity: '',
  country: 'Tunisia',
  contactPhone: '',
  contactPhoneCode: '+216',
  website: '',
  organizationDescription: '',
  organizationLogo: null,
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  consent: false,
  dataConsent: false,
};

const REQUIRED_FIELDS_BY_STEP = [
  [
    'organizationName', 'organizationAddress', 'postalCity', 'country',
    'contactPhone', 'organizationLogo', 'username'
  ],
  [
    'email', 'password', 'confirmPassword', 'consent', 'dataConsent'
  ]
];

const useOrganizerSignup = () => {
  const toast = useToast();
  
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countries, setCountries] = useState(fallbackCountries);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const formValues = useRef({...ORGANIZER_FORM_FIELDS});
  const validationTimeoutsRef = useRef({});
  
  const validateField = useCallback((name, value) => {
    if (validationTimeoutsRef.current[name]) {
      clearTimeout(validationTimeoutsRef.current[name]);
    }
    
    validationTimeoutsRef.current[name] = setTimeout(() => {
      const newErrors = { ...errors };
      
      switch (name) {
        case 'organizationName':
        case 'organizationAddress':
        case 'postalCity':
        case 'username':
          if (!value || value.trim() === '') {
            const displayName = name === 'username' ? 'username' : 
              name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            newErrors[name] = `${displayName} is required`;
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'contactPhone':
          if (!value || value.trim() === '') {
            newErrors[name] = `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else if (!/^[0-9]+$/.test(value)) {
            newErrors[name] = 'Phone number must contain only digits';
          } else if (value.length < 5) {
            newErrors[name] = 'Phone number must be at least 5 digits';
          } else if (value.length > 15) {
            newErrors[name] = 'Phone number must be at most 15 digits';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'email':
          if (!value || value.trim() === '') {
            newErrors[name] = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[name] = 'Invalid email format';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'password':
          if (!value) {
            newErrors[name] = 'Password is required';
          } else if (value.length < 8) {
            newErrors[name] = 'Password must be at least 8 characters';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            newErrors[name] = 'Password must include uppercase, lowercase, number, and special character';
          } else {
            delete newErrors[name];
          }
          
          if (touched.confirmPassword) {
            if (value !== formValues.current.confirmPassword) {
              newErrors.confirmPassword = 'Passwords must match';
            } else {
              delete newErrors.confirmPassword;
            }
          }
          break;
        
        case 'confirmPassword':
          if (!value) {
            newErrors[name] = 'Please confirm your password';
          } else if (value !== formValues.current.password) {
            newErrors[name] = 'Passwords must match';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'consent':
        case 'dataConsent':
          if (!value) {
            newErrors[name] = `You must accept the ${name === 'consent' ? 'terms and conditions' : 'data usage policy'}`;
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'organizationLogo':
          if (!value) {
            newErrors[name] = `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            const maxSize = 2 * 1024 * 1024;
            if (value.size > maxSize) {
              newErrors[name] = `File is too large (max ${maxSize / (1024 * 1024)}MB)`;
            } else {
              const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
                
              if (!validTypes.includes(value.type)) {
                newErrors[name] = `Unsupported file type (${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} only)`;
              } else {
                delete newErrors[name];
              }
            }
          }
          break;
          
        default:
          delete newErrors[name];
      }
      
      setErrors(newErrors);
      delete validationTimeoutsRef.current[name];
    }, 200);
  }, [errors, touched]);
  
  const validateCurrentStep = useCallback(() => {
    const currentFields = REQUIRED_FIELDS_BY_STEP[step] || [];
    
    const newTouched = { ...touched };
    currentFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    const newErrors = { ...errors };
    currentFields.forEach(field => {
      const value = formValues.current[field];
      
      switch (field) {
        case 'organizationName':
        case 'organizationAddress':
        case 'postalCity':
        case 'username':
          if (!value || value.trim() === '') {
            const displayName = field === 'username' ? 'username' : 
              field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            newErrors[field] = `${displayName} is required`;
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'contactPhone':
          if (!value || value.trim() === '') {
            newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else if (!/^[0-9]+$/.test(value)) {
            newErrors[field] = 'Phone number must contain only digits';
          } else if (value.length < 5) {
            newErrors[field] = 'Phone number must be at least 5 digits';
          } else if (value.length > 15) {
            newErrors[field] = 'Phone number must be at most 15 digits';
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'email':
          if (!value || value.trim() === '') {
            newErrors[field] = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors[field] = 'Invalid email format';
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'password':
          if (!value) {
            newErrors[field] = 'Password is required';
          } else if (value.length < 8) {
            newErrors[field] = 'Password must be at least 8 characters';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            newErrors[field] = 'Password must include uppercase, lowercase, number, and special character';
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'confirmPassword':
          if (!value) {
            newErrors[field] = 'Please confirm your password';
          } else if (value !== formValues.current.password) {
            newErrors[field] = 'Passwords must match';
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'consent':
        case 'dataConsent':
          if (!value) {
            newErrors[field] = `You must accept the ${field === 'consent' ? 'terms and conditions' : 'data usage policy'}`;
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'organizationLogo':
          if (!value) {
            newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            const maxSize = 2 * 1024 * 1024;
            if (value.size > maxSize) {
              newErrors[field] = `File is too large (max ${maxSize / (1024 * 1024)}MB)`;
            } else {
              const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
                
              if (!validTypes.includes(value.type)) {
                newErrors[field] = `Unsupported file type (${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} only)`;
              } else {
                delete newErrors[field];
              }
            }
          }
          break;
      }
    });
    
    setErrors(newErrors);
    
    const hasErrors = currentFields.some(field => !!newErrors[field]);
    return !hasErrors;
  }, [step, errors, touched]);
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cachedData = localStorage.getItem('countries-cache');
        const cacheTimestamp = localStorage.getItem('countries-cache-timestamp');
        
        if (cachedData && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < 24 * 60 * 60 * 1000) {
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setCountries(parsedData);
              setIsLoadingCountries(false);
              return;
            }
          }
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        const data = await response.json();
        
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
        
        const TunisiaIndex = formattedCountries.findIndex(c => c.name === 'Tunisia');
        if (TunisiaIndex > 0) {
          const Tunisia = formattedCountries.splice(TunisiaIndex, 1)[0];
          formattedCountries.unshift(Tunisia);
        }
        
        try {
          localStorage.setItem('countries-cache', JSON.stringify(formattedCountries));
          localStorage.setItem('countries-cache-timestamp', Date.now().toString());
        } catch (e) {
          console.warn("Could not cache countries data:", e);
        }
        
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error loading countries:", error);
        setCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files.length > 0) {
      formValues.current[name] = files[0];
    } else if (type === 'checkbox') {
      formValues.current[name] = checked;
    } else {
      formValues.current[name] = value;
    }
    
    if (touched[name]) {
      validateField(name, formValues.current[name]);
    }
  }, [touched, validateField]);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formValues.current[name]);
  }, [validateField]);
  
  const handleCountryChange = useCallback((countryName) => {
    const selectedCountry = countries.find(c => c.name === countryName);
    
    if (selectedCountry) {
      formValues.current.country = countryName;
      formValues.current.contactPhoneCode = selectedCountry.code;
      
      if (touched.country) {
        validateField('country', countryName);
      }
    }
  }, [countries, touched.country, validateField]);
  
  const handlePhoneCodeChange = useCallback((fieldName, code) => {
    formValues.current[fieldName] = code;
    
    if (touched[fieldName]) {
      validateField(fieldName, code);
    }
  }, [touched, validateField]);
  
  const nextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    
    if (isValid && step < 1) {
      window.scrollTo(0, 0);
      setStep(prev => prev + 1);
    } else if (!isValid) {
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find(field => !!errors[field]);
        if (firstErrorField) {
          const element = document.getElementsByName(firstErrorField)[0];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }, 100);
      
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form before proceeding.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [step, validateCurrentStep, errors, toast]);
  
  const prevStep = useCallback(() => {
    if (step > 0) {
      window.scrollTo(0, 0);
      setStep(prev => prev - 1);
    }
  }, [step]);
  
  const resetForm = useCallback(() => {
    formValues.current = {...ORGANIZER_FORM_FIELDS};
    
    setStep(0);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setRegistrationStatus(null);
    setErrorMessage('');
    
    Object.keys(validationTimeoutsRef.current).forEach(key => {
      clearTimeout(validationTimeoutsRef.current[key]);
    });
    validationTimeoutsRef.current = {};
    
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.reset();
    }, 0);
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find(field => !!errors[field]);
        if (firstErrorField) {
          const element = document.getElementsByName(firstErrorField)[0];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }, 100);
      
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form before submitting.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationStatus(null);
    setErrorMessage('');
    
    try {
      const data = new FormData();
      
      if (formValues.current.organizationLogo) {
        data.append('organizationLogo', formValues.current.organizationLogo);
      }
      
      const fieldsToSubmit = {
        organizationName: formValues.current.organizationName,
        organizationAddress: formValues.current.organizationAddress,
        postalCity: formValues.current.postalCity,
        country: formValues.current.country,
        contactPhone: formValues.current.contactPhone,
        contactPhoneCode: formValues.current.contactPhoneCode,
        website: formValues.current.website || '',
        organizationDescription: formValues.current.organizationDescription || '',
        username: formValues.current.username,
        email: formValues.current.email,
        password: formValues.current.password,
        consent: formValues.current.consent,
        dataConsent: formValues.current.dataConsent
      };
      
      Object.entries(fieldsToSubmit).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            data.append(key, value.toString());
          } else {
            data.append(key, value);
          }
        }
      });
      
      console.log("Form data being sent for organizer:");
      for (let pair of data.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      toast({
        title: 'Submitting Registration',
        description: 'Please wait while we process your registration...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      // Correction de l'URL pour utiliser le bon endpoint
      const response = await axios.post(`${API_URL}/auth/organizer-signup`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      
      console.log('Registration successful!', response.data);
      
      setIsSubmitted(true);
      setRegistrationStatus('SUCCESS');
      
      toast({
        title: 'Registration Successful',
        description: 'Your account is created. Please check your email to verify your account within 24 hours.',
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMsg = 'Registration failed. Please try again.';
      
      if (error.response) {
        console.error('Server response:', error.response.data);
        
        if (error.response.status === 409) {
          errorMsg = 'This email address is already in use. Please use a different email address.';
          setErrors(prev => ({...prev, email: 'This email address is already in use.'}));
          
          const emailField = document.getElementsByName('email')[0];
          if (emailField) {
            emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailField.focus();
          }
        } else if (error.response.data && error.response.data.message) {
          errorMsg = typeof error.response.data.message === 'string' 
            ? error.response.data.message 
            : JSON.stringify(error.response.data.message);
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'The request took too long to process. Your registration might still be successful.';
        setIsSubmitted(true);
        setRegistrationStatus('PENDING');
      } else if (!error.response) {
        errorMsg = 'Server communication error. Please try again later.';
        setRegistrationStatus('FAILED');
      }
      
      setErrorMessage(errorMsg);
      
      if (registrationStatus !== 'PENDING') {
        setRegistrationStatus('FAILED');
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMsg,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateCurrentStep, errors, toast, registrationStatus]);
  
  return {
    step,
    formData: formValues.current,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    countries,
    isLoadingCountries,
    registrationStatus,
    errorMessage,
    handleChange,
    handleBlur,
    handleCountryChange,
    handlePhoneCodeChange,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    getFormValue: (name) => formValues.current[name],
  };
};

export default useOrganizerSignup;