import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import industrySectors from '../constants/industrySectors';

// URL de l'API backend
const API_URL =  import.meta.env.VITE_API_BASE_URL;

// Liste de pays de secours si l'API échoue
const fallbackCountries = [
  { name: 'France', code: '+33', flag: 'https://flagcdn.com/w320/fr.png' },
  { name: 'United States', code: '+1', flag: 'https://flagcdn.com/w320/us.png' },
  { name: 'United Kingdom', code: '+44', flag: 'https://flagcdn.com/w320/gb.png' },
  { name: 'Germany', code: '+49', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Spain', code: '+34', flag: 'https://flagcdn.com/w320/es.png' },
  { name: 'Italy', code: '+39', flag: 'https://flagcdn.com/w320/it.png' },
  { name: 'China', code: '+86', flag: 'https://flagcdn.com/w320/cn.png' },
  { name: 'Japan', code: '+81', flag: 'https://flagcdn.com/w320/jp.png' },
  { name: 'India', code: '+91', flag: 'https://flagcdn.com/w320/in.png' },
  { name: 'Tunisia', code: '+216', flag: 'https://flagcdn.com/w320/tn.png' },
];

/**
 * Hook de gestion de formulaire utilisant une approche non-contrôlée 
 * pour une performance maximale
 */
const useSignup = () => {
  const toast = useToast();
  
  // États minimaux pour contrôler l'interface utilisateur
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countries, setCountries] = useState(fallbackCountries);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  // États pour la validation uniquement (pas pour contrôler les inputs)
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Référence pour stocker les valeurs du formulaire SANS déclencher de re-renders
  const formValues = useRef({
    // Company details
    companyName: '',
    tradeName: '',
    companyAddress: '',
    postalCity: '',
    country: 'Tunisia',
    sector: '',
    subsector: '',
    registrationNumber: '',
    companySize: '',
    website: '',
    contactPhone: '',
    contactPhoneCode: '+216',
    companyDescription: '',
    kbisDocument: null,
    companyLogo: null,
    insuranceCertificate: null,
    
    // Representative details
    username: '', // Nom du représentant (strictement en minuscule)
    representativeFunction: '',
    personalPhone: '',
    personalPhoneCode: '+216',
    
    // Account details
    email: '',
    password: '',
    confirmPassword: '',
    consent: false,
    dataConsent: false,
  });
  
  // Références pour l'efficacité
  const validationTimeoutsRef = useRef({});
  
  // Fonction de validation simplifiée (règles de base sans Yup)
  const validateField = useCallback((name, value) => {
    // Annuler la validation précédente pour ce champ
    if (validationTimeoutsRef.current[name]) {
      clearTimeout(validationTimeoutsRef.current[name]);
    }
    
    validationTimeoutsRef.current[name] = setTimeout(() => {
      const newErrors = { ...errors };
      
      // Validation simplifiée basée sur des règles manuelles
      switch (name) {
        case 'companyName':
        case 'companyAddress':
        case 'postalCity':
        case 'sector':
        case 'subsector':
        case 'registrationNumber':
        case 'username': // Nom d'utilisateur (représentant)
        case 'representativeFunction':
          if (!value || value.trim() === '') {
            newErrors[name] = `${name === 'username' ? 'Representative Name' : name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'contactPhone':
        case 'personalPhone':
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
          
          // Valider aussi confirmPassword si déjà touché
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
        
        case 'kbisDocument':
        case 'companyLogo':
        case 'insuranceCertificate':
          if (!value) {
            newErrors[name] = `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            // Vérification de la taille du fichier
            const maxSize = name === 'companyLogo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB ou 5MB
            if (value.size > maxSize) {
              newErrors[name] = `File is too large (max ${maxSize / (1024 * 1024)}MB)`;
            } else {
              // Vérification du type de fichier
              const validTypes = name === 'companyLogo' 
                ? ['image/png', 'image/jpeg'] 
                : ['application/pdf', 'image/png', 'image/jpeg'];
                
              if (!validTypes.includes(value.type)) {
                newErrors[name] = `Unsupported file type (${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} only)`;
              } else {
                delete newErrors[name];
              }
            }
          }
          break;
          
        default:
          // Pour les autres champs, pas de validation spécifique
          delete newErrors[name];
      }
      
      setErrors(newErrors);
      delete validationTimeoutsRef.current[name];
    }, 200); // Délai réduit pour la validation
  }, [errors, touched]);
  
  // Valider l'étape actuelle
  const validateCurrentStep = useCallback(() => {
    const currentFields = (() => {
      switch (step) {
        case 0: // Company details
          return [
            'companyName', 'companyAddress', 'postalCity', 'country', 
            'sector', 'subsector', 'registrationNumber', 'contactPhone',
            'kbisDocument', 'companyLogo', 'insuranceCertificate'
          ];
        case 1: // Representative details
          return [
            'username', // Nom du représentant (en minuscule)
            'representativeFunction', 
            'personalPhone', 'personalPhoneCode'
          ];
        case 2: // Account details
          return [
            'email', 'password', 'confirmPassword', 
            'consent', 'dataConsent'
          ];
        default:
          return [];
      }
    })();
    
    // Marquer tous les champs de cette étape comme touchés
    const newTouched = { ...touched };
    currentFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    // Valider tous les champs de cette étape
    const newErrors = { ...errors };
    currentFields.forEach(field => {
      const value = formValues.current[field];
      
      // Réutiliser le même code de validation mais sans délai et synchrone
      switch (field) {
        case 'companyName':
        case 'companyAddress':
        case 'postalCity':
        case 'sector':
        case 'subsector':
        case 'registrationNumber':
        case 'username': // Nom du représentant
        case 'representativeFunction':
          if (!value || value.trim() === '') {
            newErrors[field] = `${field === 'username' ? 'Representative Name' : field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            delete newErrors[field];
          }
          break;
        
        case 'contactPhone':
        case 'personalPhone':
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
        
        case 'kbisDocument':
        case 'companyLogo':
        case 'insuranceCertificate':
          if (!value) {
            newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
          } else {
            // Vérification de la taille du fichier
            const maxSize = field === 'companyLogo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB ou 5MB
            if (value.size > maxSize) {
              newErrors[field] = `File is too large (max ${maxSize / (1024 * 1024)}MB)`;
            } else {
              // Vérification du type de fichier
              const validTypes = field === 'companyLogo' 
                ? ['image/png', 'image/jpeg'] 
                : ['application/pdf', 'image/png', 'image/jpeg'];
                
              if (!validTypes.includes(value.type)) {
                newErrors[field] = `Unsupported file type (${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} only)`;
              } else {
                delete newErrors[field];
              }
            }
          }
          break;
          
        default:
          // Pas de validation pour les autres champs
          break;
      }
    });
    
    setErrors(newErrors);
    
    // Vérifier s'il y a des erreurs pour les champs de cette étape
    const hasErrors = currentFields.some(field => !!newErrors[field]);
    return !hasErrors;
  }, [step, errors, touched]);
  
  // Chargement des pays depuis l'API avec mise en cache
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Vérifier le cache local
        const cachedData = localStorage.getItem('countries-cache');
        const cacheTimestamp = localStorage.getItem('countries-cache-timestamp');
        
        // Si les données sont en cache et récentes (< 24h)
        if (cachedData && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < 24 * 60 * 60 * 1000) { // 24 heures
            const parsedData = JSON.parse(cachedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log("Using cached countries data");
              setCountries(parsedData);
              setIsLoadingCountries(false);
              return;
            }
          }
        }
        
        // Pas de cache valide, charger depuis l'API
        console.log("Fetching countries data...");
        
        // Ajouter un timeout pour éviter de bloquer trop longtemps
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Traiter les données
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
        
        // Placer la Tunisie en premier
        const TunisiaIndex = formattedCountries.findIndex(c => c.name === 'Tunisia');
        if (TunisiaIndex > 0) {
          const Tunisia = formattedCountries.splice(TunisiaIndex, 1)[0];
          formattedCountries.unshift(Tunisia);
        }
        
        // Mettre en cache
        try {
          localStorage.setItem('countries-cache', JSON.stringify(formattedCountries));
          localStorage.setItem('countries-cache-timestamp', Date.now().toString());
        } catch (e) {
          console.warn("Could not cache countries data:", e);
        }
        
        setCountries(formattedCountries);
        console.log(`Loaded ${formattedCountries.length} countries`);
      } catch (error) {
        console.error("Error loading countries:", error);
        // Utiliser la liste de secours
        setCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  // Gérer les changements de champs (SANS CONTRÔLER LES INPUTS)
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Mettre à jour les valeurs dans la référence (pas d'état React)
    if (type === 'file' && files.length > 0) {
      formValues.current[name] = files[0];
    } else if (type === 'checkbox') {
      formValues.current[name] = checked;
    } else {
      formValues.current[name] = value;
    }
    
    // Si le champ a déjà été touché, valider
    if (touched[name]) {
      validateField(name, formValues.current[name]);
    }
  }, [touched, validateField]);
  
  // Gérer la perte de focus
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Valider le champ
    validateField(name, formValues.current[name]);
  }, [validateField]);
  
  // Gérer le changement de pays
  const handleCountryChange = useCallback((countryName) => {
    const selectedCountry = countries.find(c => c.name === countryName);
    
    if (selectedCountry) {
      formValues.current.country = countryName;
      formValues.current.contactPhoneCode = selectedCountry.code;
      formValues.current.personalPhoneCode = selectedCountry.code;
      
      // Valider si nécessaire
      if (touched.country) {
        validateField('country', countryName);
      }
    }
  }, [countries, touched.country, validateField]);
  
  // Gérer le changement de code téléphonique
  const handlePhoneCodeChange = useCallback((fieldName, code) => {
    formValues.current[fieldName] = code;
    
    if (touched[fieldName]) {
      validateField(fieldName, code);
    }
  }, [touched, validateField]);
  
  // Gérer le changement de secteur
  const handleSectorChange = useCallback((e) => {
    const sectorValue = e.target.value;
    formValues.current.sector = sectorValue;
    formValues.current.subsector = ''; // Réinitialiser le sous-secteur
    
    if (touched.sector) {
      validateField('sector', sectorValue);
    }
  }, [touched.sector, validateField]);
  
  // Aller à l'étape suivante
  const nextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    
    if (isValid && step < 2) {
      window.scrollTo(0, 0);
      setStep(prev => prev + 1);
    } else if (!isValid) {
      // Scroller vers la première erreur
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
  
  // Retourner à l'étape précédente
  const prevStep = useCallback(() => {
    if (step > 0) {
      window.scrollTo(0, 0);
      setStep(prev => prev - 1);
    }
  }, [step]);
  
  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    // Réinitialiser les valeurs
    formValues.current = {
      companyName: '',
      tradeName: '',
      companyAddress: '',
      postalCity: '',
      country: 'Tunisia',
      sector: '',
      subsector: '',
      registrationNumber: '',
      companySize: '',
      website: '',
      contactPhone: '',
      contactPhoneCode: '+33',
      companyDescription: '',
      kbisDocument: null,
      companyLogo: null,
      insuranceCertificate: null,
      username: '', // Nom du représentant
      representativeFunction: '',
      personalPhone: '',
      personalPhoneCode: '+216',
      email: '',
      password: '',
      confirmPassword: '',
      consent: false,
      dataConsent: false,
    };
    
    // Réinitialiser les états React
    setStep(0);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setRegistrationStatus(null);
    setErrorMessage('');
    
    // Annuler tous les timeouts en cours
    Object.keys(validationTimeoutsRef.current).forEach(key => {
      clearTimeout(validationTimeoutsRef.current[key]);
    });
    validationTimeoutsRef.current = {};
    
    // Scroller vers le haut
    window.scrollTo(0, 0);
    
    // Réinitialiser tous les champs de formulaire
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.reset();
    }, 0);
  }, []);
  
  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Valider d'abord l'étape actuelle
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
      // Préparer les données pour l'envoi
      const data = new FormData();
      
      // Liste explicite des champs à envoyer
      const formFields = {
        // Company details
        companyName: formValues.current.companyName,
        tradeName: formValues.current.tradeName,
        companyAddress: formValues.current.companyAddress,
        postalCity: formValues.current.postalCity,
        country: formValues.current.country,
        sector: formValues.current.sector,
        subsector: formValues.current.subsector,
        registrationNumber: formValues.current.registrationNumber,
        companySize: formValues.current.companySize,
        website: formValues.current.website,
        contactPhone: formValues.current.contactPhone,
        contactPhoneCode: formValues.current.contactPhoneCode,
        companyDescription: formValues.current.companyDescription,
        
        // Representative details
        username: formValues.current.username, // Envoi du nom du représentant
        representativeFunction: formValues.current.representativeFunction,
        personalPhone: formValues.current.personalPhone,
        personalPhoneCode: formValues.current.personalPhoneCode,
        
        // Account details
        email: formValues.current.email,
        password: formValues.current.password,
        consent: formValues.current.consent,
        dataConsent: formValues.current.dataConsent
      };
      
      // Ajouter les fichiers
      if (formValues.current.kbisDocument) {
        data.append('kbisDocument', formValues.current.kbisDocument);
      }
      
      if (formValues.current.companyLogo) {
        data.append('companyLogo', formValues.current.companyLogo);
      }
      
      if (formValues.current.insuranceCertificate) {
        data.append('insuranceCertificate', formValues.current.insuranceCertificate);
      }
      
      // Ajouter tous les autres champs
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            data.append(key, value.toString());
          } else {
            data.append(key, value);
          }
        }
      });
      
      // Log de débogage pour voir les données envoyées
      console.log("Form data being sent:");
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
      
      // Envoyer la requête
      const response = await axios.post(`${API_URL}/auth/exhibitor-signup`, data, {
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
  
  // Exposer l'API du hook
  return {
    step,
    formData: formValues.current, // Pour la compatibilité, mais ne déclenche pas de re-render
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
    handleSectorChange,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
    
    // Ajout pour avoir les values actuelles dans les composants
    getFormValue: (name) => formValues.current[name],
  };
};

export default useSignup;