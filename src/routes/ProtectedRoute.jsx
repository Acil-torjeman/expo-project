// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

/**
 * Composant pour protéger les routes en fonction de l'authentification et du rôle
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composant à rendre si l'accès est autorisé
 * @param {string} [props.requiredRole] - Rôle requis pour accéder à cette route (optionnel)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Use a ref to track if we've already shown a toast for this route
  const hasShownToast = React.useRef(false);
  
  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh" direction="column">
        <Spinner size="xl" color="teal.500" thickness="4px" mb={4} />
        <Text>Vérification des autorisations...</Text>
      </Flex>
    );
  }
  
  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    // Sauvegarder la page actuelle pour rediriger après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
    const redirectPath = user?.role 
      ? `/${user.role}/dashboard` 
      : '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }
  
  // Si tout est ok, afficher le contenu de la route
  return children;
};

export default ProtectedRoute;