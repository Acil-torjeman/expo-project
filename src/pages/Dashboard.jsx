// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Spinner, Flex, Text, Alert, AlertIcon, AlertTitle, Button } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

/**
 * Composant Dashboard générique
 * Redirige automatiquement vers le dashboard spécifique au rôle de l'utilisateur
 */
const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectFailed, setRedirectFailed] = useState(false);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Validation du rôle
      const validRoles = ['admin', 'organizer', 'exhibitor'];
      
      if (validRoles.includes(user.role)) {
        // Délai court pour s'assurer que tout est chargé
        const dashboardPath = `/${user.role}/dashboard`;
        console.log(`Redirecting to role-specific dashboard: ${dashboardPath}`);
        navigate(dashboardPath, { replace: true });
      } else {
        console.error('User has invalid role:', user.role);
        setRedirectFailed(true);
      }
    } else if (!isLoading && !isAuthenticated) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      navigate('/login', { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);
  
  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh" direction="column">
        <Spinner size="xl" color="teal.500" thickness="4px" mb={4} />
        <Text>Loading...</Text>
      </Flex>
    );
  }
  
  // Si la redirection a échoué, afficher un message d'erreur
  if (redirectFailed) {
    return (
      <Flex justify="center" align="center" minH="100vh" p={6}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="auto"
          maxWidth="md"
          borderRadius="md"
          p={6}
        >
          <AlertIcon boxSize="40px" mr={0} mb={4} />
          <AlertTitle mb={4} fontSize="lg">Erreur de rôle utilisateur</AlertTitle>
          <Text mb={4}>
            Votre compte utilisateur n'a pas un rôle valide ou n'a pas les permissions nécessaires pour accéder au tableau de bord.
          </Text>
          <Button onClick={() => navigate('/login')} colorScheme="red" size="sm">
            Retourner à la page de connexion
          </Button>
        </Alert>
      </Flex>
    );
  }
  
  // Cette partie ne devrait jamais s'afficher car l'utilisateur est redirigé
  return (
    <Flex justify="center" align="center" minH="100vh" direction="column">
      <Spinner size="xl" color="teal.500" thickness="4px" mb={4} />
      <Text>Redirection vers votre tableau de bord...</Text>
    </Flex>
  );
};

export default Dashboard;