import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lock, Unlock, X, Key } from 'lucide-react';
import authService from '../services/authService';
import permissionsService from '../services/permissionsService';
import Sidebar from '../components/Sidebar';
import '../styles/AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // State reset senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ userId: null, username: '', newPassword: '' });

  // Form para criar usuário
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    loadUsers();
    loadPermissions();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await authService.listUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await permissionsService.getAllPermissions();
      // Garantir que é um array
      const permsList = Array.isArray(response) ? response : (response.permissions || []);
      setPermissions(permsList);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username.trim()) {
      setError('Nome de usuário é obrigatório');
      return;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }

    try {
      await authService.createUser(formData.username, formData.password, formData.role);
      setSuccess('Usuário criado com sucesso!');
      setFormData({ username: '', password: '', role: 'user' });
      setShowCreateModal(false);
      loadUsers();
    } catch (err) {
      setError(err.error || 'Erro ao criar usuário');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await authService.deleteUser(userId);
        setSuccess('Usuário deletado com sucesso!');
        loadUsers();
      } catch (err) {
        setError(err.error || 'Erro ao deletar usuário');
      }
    }
  };

  const handleOpenPermissionsModal = async (user) => {
    setSelectedUser(user);
    try {
      const userPermissions = await permissionsService.getUserPermissions(user.id);
      
      // Create a map of Name -> ID from the loaded 'permissions' state
      const nameToIdMap = {};
      permissions.forEach(p => nameToIdMap[p.name] = p.id);

      // Garantir que é um array de IDs (não de objetos)
      const permIds = userPermissions.map(p => {
        if (typeof p === 'object') {
          return p.id || p.permission_id;
        }
        // If p is a string and looks like a name (exists in map), return the ID
        if (typeof p === 'string' && nameToIdMap[p]) {
            return nameToIdMap[p];
        }
        return p;
      });
      setSelectedPermissions(permIds);
    } catch (err) {
      setError('Erro ao carregar permissões do usuário');
    }
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      await permissionsService.updateUserPermissions(selectedUser.id, selectedPermissions);
      setSuccess('Permissões atualizadas com sucesso!');
      setShowPermissionsModal(false);
      loadUsers();
    } catch (err) {
      setError(err.error || 'Erro ao salvar permissões');
    }
  };

  const handleOpenResetModal = (user) => {
    setResetPasswordData({ userId: user.id, username: user.username, newPassword: '' });
    setShowResetModal(true);
    setError('');
    setSuccess('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetPasswordData.newPassword) {
        setError('A nova senha é obrigatória');
        return;
    }

    try {
        await authService.resetUserPassword(resetPasswordData.userId, resetPasswordData.newPassword);
        setSuccess(`Senha do usuário ${resetPasswordData.username} resetada com sucesso!`);
        setShowResetModal(false);
    } catch (err) {
        setError(err.error || 'Erro ao resetar senha');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="min-h-screen bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="admin-users-container">
      <div className="admin-users-header mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">👥 Gerenciamento de Usuários</h1>
        <button 
          className="btn-primary mt-4 sm:mt-0" 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="icon" /> Novo Usuário
        </button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      {loading ? (
        <div className="loading text-center py-8">Carregando usuários...</div>
      ) : (
        <div className="users-table-container bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="users-table w-full text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Role</th>
                <th>Ativo</th>
                <th>Permissões</th>
                <th>Último Login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.active ? (
                        <span className="badge badge-success">Ativo</span>
                      ) : (
                        <span className="badge badge-inactive">Inativo</span>
                      )}
                    </td>
                    <td>
                      <span className="permissions-count">
                        {user.permissions?.length || 0} permissões
                      </span>
                    </td>
                    <td>
                      {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-permissions"
                        onClick={() => handleOpenPermissionsModal(user)}
                        title="Gerenciar Permissões"
                      >
                        <Lock className="icon" />
                      </button>
                      <button
                        className="btn-icon btn-reset"
                        onClick={() => handleOpenResetModal(user)}
                        title="Resetar Senha"
                      >
                        <Key className="icon" />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Deletar"
                      >
                        <Trash2 className="icon" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Usuário</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowCreateModal(false)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Nome de Usuário</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Digite o nome de usuário"
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Usuário</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Permissões */}
      {showPermissionsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Permissões de {selectedUser.username}</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowPermissionsModal(false)}
              >
                <X />
              </button>
            </div>

            <div className="permissions-grid">
              {permissions.map(permission => (
                <div key={permission.id} className="permission-item">
                  <label className="permission-label">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handleTogglePermission(permission.id)}
                    />
                    <span>{permission.name}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowPermissionsModal(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleSavePermissions}
              >
                Salvar Permissões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Senha */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resetar Senha - {resetPasswordData.username}</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowResetModal(false)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={e => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                  placeholder="Digite a nova senha"
                  required
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
