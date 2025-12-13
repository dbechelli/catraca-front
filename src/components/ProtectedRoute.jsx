import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null
}) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Verificando acesso...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar role se necessário
  if (requiredRole && user.role !== requiredRole && user.role !== 'superadmin') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#c33'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>❌ Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <a href="/dashboard" style={{ color: '#667eea', textDecoration: 'underline' }}>
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
