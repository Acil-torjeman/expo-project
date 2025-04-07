import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Spinner,
  Link,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningTwoIcon, InfoIcon } from '@chakra-ui/icons';
import backgroundImage from '../../assets/images/registerback.svg';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'expired', 'already-verified', 'error'
  const [message, setMessage] = useState('');
  
  // Utiliser un ref pour éviter de faire plusieurs requêtes
  const verificationAttempted = useRef(false);
  
  useEffect(() => {
    // Fonction pour vérifier l'email
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      // Ne pas tenter la vérification si elle a déjà été effectuée
      if (verificationAttempted.current) return;
      
      // Marquer que nous avons tenté la vérification
      verificationAttempted.current = true;
      
      try {
        console.log('Verifying email with token:', token);
        
        // Faire une requête au backend
        const response = await fetch(`http://localhost:5001/auth/verify-email?token=${encodeURIComponent(token)}`);
        
        console.log('Response status:', response.status);
        
        // Obtenir le texte brut de la réponse d'abord pour déboguer
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Essayer de parser le JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } catch (parseError) {
          console.error('Error parsing response as JSON:', parseError);
          // Si le parsing échoue, utiliser le texte brut comme message
          data = { message: responseText };
        }
        
        // Vérifier si la requête a réussi
        if (!response.ok) {
          // Gérer les différents codes d'erreur HTTP
          if (response.status === 400) {
            // Vérifier si le token est expiré
            if (data.message && data.message.includes('expired')) {
              setStatus('expired');
              setMessage(data.message || 'Your verification link has expired. Please register again.');
            } 
            // Vérifier si l'email est déjà vérifié
            else if (data.message && data.message.includes('already verified')) {
              setStatus('already-verified');
              setMessage(data.message || 'This email has already been verified. You can now log in.');
            } 
            // Vérifier si le token est invalide ou déjà utilisé
            else if (data.message && (data.message.includes('already been used') || data.message.includes('invalid'))) {
              setStatus('error');
              setMessage(data.message || 'This verification link has already been used or is invalid.');
            }
            // Autres erreurs de validation
            else {
              setStatus('error');
              setMessage(data.message || 'There was a problem with your verification link.');
            }
          } else {
            // Erreurs serveur ou autres
            setStatus('error');
            setMessage(data.message || 'An error occurred during verification. Please try again later or contact support.');
          }
          return;
        }
        
        console.log('Server response:', data);
        
        // Mettre à jour le statut et le message
        setStatus('success');
        setMessage(data.message || 'Your email has been successfully verified. You can now log in to your account.');
        
        // Afficher un toast de réussite
        toast({
          title: 'Email Verified',
          description: 'Your email has been successfully verified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error during verification:', error);
        
        // Si la requête a échoué (e.g., serveur inaccessible)
        setStatus('error');
        setMessage('The server is not responding. Please try again later or contact support.');
        
        toast({
          title: 'Verification Failed',
          description: 'Unable to connect to the server. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Exécuter la vérification si le statut est 'loading' et si un token est présent
    if (status === 'loading' && token) {
      verifyEmailToken();
    }
  }, [token, status, toast]);

  // Rediriger vers la page de connexion
  const goToLogin = () => {
    navigate('/login');
  };

  // Rediriger vers la page d'inscription
  const goToSignup = () => {
    navigate('/signup/exhibitor');
  };

  // Contenu basé sur le statut
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <VStack spacing={8} align="center">
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text fontSize="lg">Verifying your email...</Text>
          </VStack>
        );
      
      case 'success':
        return (
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={6}
            borderRadius="md"
          >
            <CheckCircleIcon boxSize="50px" color="green.500" mb={4} />
            <AlertTitle fontSize="xl" mb={2}>Email Verified!</AlertTitle>
            <AlertDescription maxWidth="md">
              <Text mb={4}>{message}</Text>
              <Button colorScheme="teal" size="lg" onClick={goToLogin} mt={4}>
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'expired':
        return (
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={6}
            borderRadius="md"
          >
            <WarningTwoIcon boxSize="50px" color="orange.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2}>Verification Link Expired</AlertTitle>
            <AlertDescription maxWidth="md">
              <Text mb={4}>{message}</Text>
              <Text mb={4}>
                If you still want to register, please create a new account.
              </Text>
              <Button colorScheme="teal" size="lg" onClick={goToSignup} mt={4}>
                Create New Account
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'already-verified':
        return (
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={6}
            borderRadius="md"
          >
            <InfoIcon boxSize="50px" color="blue.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2}>Already Verified</AlertTitle>
            <AlertDescription maxWidth="md">
              <Text mb={4}>{message}</Text>
              <Button colorScheme="teal" size="lg" onClick={goToLogin} mt={4}>
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'error':
        return (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={6}
            borderRadius="md"
          >
            <WarningTwoIcon boxSize="50px" color="red.400" mb={4} />
            <AlertTitle fontSize="xl" mb={2}>Verification Failed</AlertTitle>
            <AlertDescription maxWidth="md">
              <Text mb={4}>{message}</Text>
              <VStack spacing={4} mt={4}>
                <Button colorScheme="teal" size="lg" onClick={goToSignup}>
                  Create New Account
                </Button>
              </VStack>
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container
      maxW="full"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      py={10}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        backgroundImage={`url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(0px)"
        zIndex={-1}
      />
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="xl"
        w="90%"
        maxW="600px"
        height="auto"
        zIndex={1}
      >
        <Box
          bg="teal.500"
          color="white"
          p={4}
          textAlign="center"
          fontWeight="bold"
          mb={6}
          borderRadius="md"
        >
          <Heading size="md">Email Verification</Heading>
        </Box>
        
        {renderContent()}
        
        <Box mt={8} textAlign="center">
          <Text color="gray.600">
            Need help? <Link color="teal.500" href="mailto:support@expoplatform.com">Contact Support</Link>
          </Text>
        </Box>
      </Box>
    </Container>
  );
};

export default VerifyEmail;