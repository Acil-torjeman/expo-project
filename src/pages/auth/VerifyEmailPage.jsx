// src/pages/auth/VerifyEmailPage.jsx
import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import PublicLayout from '../../layouts/PublicLayout';
import VerifyEmail from '../../components/auth/VerifyEmail';

/**
 * Page de vérification d'email qui utilise le composant VerifyEmail
 * avec le layout public pour garantir un fond correct en mode sombre
 */
const VerifyEmailPage = () => {
  const bgColor = useColorModeValue('transparent', 'gray.900');

  return (
    <PublicLayout isFullHeight={true}>
      <Box 
        width="100%" 
        py={8} 
        display="flex" 
        justifyContent="center"
        bg={bgColor}
      >
        <VerifyEmail />
      </Box>
    </PublicLayout>
  );
};

export default VerifyEmailPage;