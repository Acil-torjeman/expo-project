// src/pages/auth/ForgotPassword.jsx
import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPassword';
import PublicLayout from '../../layouts/PublicLayout';

const ForgotPasswordPage = () => {
  return (
    <PublicLayout isFullHeight={true}>
      <ForgotPasswordForm />
    </PublicLayout>
  );
};

export default ForgotPasswordPage;