import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import Dashboard from './pages/Dashboard';
import ConferenciaICMS from './pages/ConferenciaICMS';
import AdminUsers from './pages/AdminUsers';
import AdminPermissions from './pages/AdminPermissions';
import Profile from './pages/Profile';
import GestaoOperacional from './pages/GestaoOperacional/GestaoOperacional';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard Principal (com sidebar) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainDashboard />
              </PrivateRoute>
            }
          />

          {/* Dashboard da Catraca (old) */}
          <Route
            path="/catraca"
            element={
              <PermissionRoute requiredPermission="catraca">
                <Dashboard />
              </PermissionRoute>
            }
          />

          {/* Gestão Operacional */}
          <Route
            path="/gestao-operacional"
            element={
              <PrivateRoute>
                <GestaoOperacional />
              </PrivateRoute>
            }
          />

          {/* Conferência ICMS */}
          <Route
            path="/conferencia-icms"
            element={
              <PermissionRoute requiredPermission="conferencia">
                <ConferenciaICMS />
              </PermissionRoute>
            }
          />

          {/* Perfil do Usuário */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Rota protegida por role (apenas superadmin) */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Rota de Permissões (apenas superadmin) */}
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <AdminPermissions />
              </ProtectedRoute>
            }
          />

          {/* Redirecionar raiz para dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Página não encontrada */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
