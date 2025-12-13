import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children, requiredRole = null }) {
  const { user, isLoading, logout } = useContext(AuthContext);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Aguardar loading terminar
    if (!isLoading) {
      setReady(true);
    }
  }, [isLoading]);

  useEffect(() => {
    // Se receber erro 401, fazer logout
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token foi removido - usuario foi deslogado
        logout();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  if (!ready || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar role se necessário
  if (requiredRole && user.role !== requiredRole && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
