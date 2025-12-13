import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import permissionsService from '../services/permissionsService';

export default function PermissionRoute({ 
  children, 
  requiredPermission
}) {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const [hasPermission, setHasPermission] = useState(null); // null = loading
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setChecking(false);
        return;
      }

      if (user.role === 'superadmin') {
        setHasPermission(true);
        setChecking(false);
        return;
      }

      try {
        const [allPerms, userPermsData] = await Promise.all([
            permissionsService.getAllPermissions(),
            permissionsService.getUserPermissions(user.id)
        ]);

        console.log('PermissionRoute Debug:', {
            requiredPermission,
            userRole: user.role,
            allPerms,
            userPermsData
        });
        
        const permMap = {};
        allPerms.forEach(p => permMap[p.id] = p.name);
        
        const userPermNames = userPermsData.map(p => {
            // Case 1: Object with name
            if (typeof p === 'object' && p.name) return p.name;
            
            // Case 2: Object with ID
            if (typeof p === 'object') {
                const id = p.id || p.permission_id;
                return permMap[id];
            }
            
            // Case 3: Primitive ID
            if (permMap[p]) return permMap[p];
            
            // Case 4: Primitive Name (already a permission name)
            // Check if p is one of the known permission names
            if (Object.values(permMap).includes(p)) return p;
            
            return null;
        }).filter(Boolean);

        console.log('Resolved User Permissions:', userPermNames);

        if (userPermNames.includes(requiredPermission)) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Error checking permission", error);
        setHasPermission(false);
      } finally {
        setChecking(false);
      }
    }

    if (!authLoading) {
      checkPermission();
    }
  }, [user, authLoading, requiredPermission]);

  if (authLoading || checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Verificando permissões...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission) {
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
