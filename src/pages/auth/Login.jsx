// src/pages/auth/Login.jsx
import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import PublicLayout from '../../layouts/PublicLayout';

const Login = () => {
  return (
    <PublicLayout isFullHeight={true}>
      <LoginForm />
    </PublicLayout>
  );
};

export default Login;