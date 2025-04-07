// src/pages/auth/ResetPassword.jsx
import React from 'react';
import ResetPasswordForm from '../../components/auth/ResetPassword';
import PublicLayout from '../../layouts/PublicLayout';

const ResetPasswordPage = () => {
  return (
    <PublicLayout isFullHeight={true}>
      <ResetPasswordForm />
    </PublicLayout>
  );
};

export default ResetPasswordPage;