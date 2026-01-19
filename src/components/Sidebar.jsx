import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import permissionsService from '../services/permissionsService';
import { LogOut, User, Menu, X } from 'lucide-react';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    async function loadPermissions() {
      if (user && user.role !== 'superadmin') {
        try {
          const [allPerms, userPermsData] = await Promise.all([
            permissionsService.getAllPermissions(),
            permissionsService.getUserPermissions(user.id)
          ]);
          
          // Build map of ID -> Name
          const permMap = {};
          allPerms.forEach(p => permMap[p.id] = p.name);
          
          // Get user permission names
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
            
            // Case 4: Primitive Name
            if (Object.values(permMap).includes(p)) return p;
            
            return null;
          }).filter(Boolean);
          
          setUserPermissions(userPermNames);
        } catch (error) {
          console.error("Error loading permissions", error);
        }
      }
    }
    loadPermissions();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mapeamento de permissões para rotas e ícones
  const menuItems = [
    {
      label: 'Dashboard',
      icon: '📊',
      permission: 'dashboard',
      path: '/dashboard'
    },
    {
      label: 'Catracas',
      icon: '🚪',
      permission: 'catraca',
      path: '/catraca'
    },
    {
      label: 'Conferência ICMS',
      icon: '🚚',
      permission: 'conferencia',
      path: '/conferencia-icms'
    },
    {
      label: 'Gestão Operacional',
      icon: '💰',
      path: '/gestao-operacional'
    }
  ];

  // Para superadmin, mostrar todas as páginas + admin
  const adminMenuItems = [
    {
      label: 'Usuários',
      icon: '👥',
      path: '/admin/users'
    },
    {
      label: 'Permissões',
      icon: '🔐',
      path: '/admin/permissions'
    }
  ];

  // Itens disponíveis baseado no role
  const availableMenuItems = user?.role === 'superadmin' 
    ? [...menuItems, ...adminMenuItems]
    : menuItems.filter(item => !item.permission || userPermissions.includes(item.permission));

  return (
    <>
      {/* Toggle mobile */}
      <button 
        className="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-emoji">☁️</span>
            <span className="logo-text">Transleg</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          {availableMenuItems.length === 0 ? (
            <div className="empty">Sem permissões</div>
          ) : (
            <ul className="menu-list">
              {availableMenuItems.map(item => (
                <li key={item.path}>
                  <button
                    className="menu-item"
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.username && user.username[0].toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.username || 'Usuário'}</div>
                <div className="user-role">{user.role || 'user'}</div>
              </div>
            </div>
          )}

          <button
            className="profile-btn"
            onClick={() => {
              navigate('/perfil');
              setMobileOpen(false);
            }}
            title="Editar Perfil"
          >
            <User className="icon" />
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Fazer Logout"
          >
            <LogOut className="icon" />
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
