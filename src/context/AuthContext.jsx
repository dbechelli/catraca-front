import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar usuário do localStorage ao montar o componente
  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      // Se houver token e user no storage, restaurar
      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      // Limpar se houver erro
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresIn');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(username, password);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      const errorMsg = err.error || 'Erro ao fazer login';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      // Mesmo com erro, limpar o user localmente
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
