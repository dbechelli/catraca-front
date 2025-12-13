import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import authService from '../services/authService';
import permissionsService from '../services/permissionsService';
import '../styles/AdminPermissions.css';

export default function AdminPermissions() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal de gerenciamento de páginas
  const [showManageModal, setShowManageModal] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: '', description: '', icon: '📄' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Carregar usuários
      const usersRes = await authService.listUsers();
      const usersList = usersRes.users || [];
      setUsers(usersList);

      // Carregar permissões
      const permsList = await permissionsService.getAllPermissions();
      setPermissions(permsList);

      // Carregar permissões de cada usuário
      const userPerms = {};
      for (const user of usersList) {
        try {
          const userPermsRes = await permissionsService.getUserPermissions(user.id);
          // Extrair IDs de cada permissão (podem ser objetos ou números)
          userPerms[user.id] = userPermsRes.map(p => {
            if (typeof p === 'object' && p !== null) {
              return p.id || p.permission_id;
            }
            return p;
          });
        } catch (err) {
          console.error(`Erro ao carregar perms de ${user.id}:`, err);
          userPerms[user.id] = [];
        }
      }
      setUserPermissions(userPerms);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (userId, permissionId) => {
    const currentPerms = userPermissions[userId] || [];
    const hasPermission = currentPerms.includes(permissionId);

    try {
      if (hasPermission) {
        await permissionsService.removeUserPermission(userId, permissionId);
        setUserPermissions({
          ...userPermissions,
          [userId]: currentPerms.filter(p => p !== permissionId)
        });
      } else {
        await permissionsService.addUserPermission(userId, permissionId);
        setUserPermissions({
          ...userPermissions,
          [userId]: [...currentPerms, permissionId]
        });
      }
      setSuccess('Permissão atualizada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || 'Erro ao atualizar permissão');
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      await permissionsService.createPermission(newPermission);
      setSuccess('Página adicionada com sucesso!');
      setNewPermission({ name: '', description: '', icon: '📄' });
      loadData(); // Recarregar tudo
    } catch (err) {
      setError(err.error || 'Erro ao criar página');
    }
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Tem certeza? Isso removerá o acesso de todos os usuários a esta página.')) return;
    try {
      await permissionsService.deletePermission(id);
      setSuccess('Página removida com sucesso!');
      loadData();
    } catch (err) {
      setError(err.error || 'Erro ao remover página');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="min-h-screen bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="admin-permissions-container">
            <div className="admin-permissions-header mb-6 flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🔐 Gerenciar Permissões</h1>
              <button 
                onClick={() => setShowManageModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Gerenciar Páginas
              </button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}
            {success && <div className="alert alert-success mb-4">{success}</div>}

            {loading ? (
              <div className="loading text-center py-8">Carregando dados...</div>
            ) : (
              <div className="permissions-table-container bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="permissions-table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                        Usuário
                      </th>
                      {permissions.map(perm => (
                        <th
                          key={perm.id}
                          className="px-2 py-3 text-center font-semibold text-gray-700 whitespace-nowrap"
                          title={perm.description}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{perm.icon}</span>
                            <span className="text-xs">{perm.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {user.username.substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span>{user.username}</span>
                              <span className="text-xs text-gray-500 font-normal">{user.role === 'superadmin' ? '👑 Superadmin' : '👤 Usuário'}</span>
                            </div>
                          </div>
                        </td>
                        {permissions.map(perm => {
                          // Check if user has permission (handle both ID and Name)
                          const userPerms = userPermissions[user.id] || [];
                          const hasPerm = userPerms.includes(perm.id) || userPerms.includes(perm.name);
                          const isSuperAdmin = user.role === 'superadmin';
                          
                          return (
                            <td key={`${user.id}-${perm.id}`} className="px-2 py-3 text-center">
                              <input
                                type="checkbox"
                                disabled={isSuperAdmin}
                                checked={isSuperAdmin || hasPerm}
                                onChange={() => handleTogglePermission(user.id, perm.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isSuperAdmin ? "Superadmin tem acesso total" : `Alternar acesso a ${perm.description}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {users.length === 0 && (
                       <tr><td colSpan={permissions.length + 1} className="text-center py-8 text-gray-500">Nenhum usuário encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

      {/* Modal Gerenciar Páginas */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Gerenciar Páginas do Sistema</h2>
              <button onClick={() => setShowManageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Form Adicionar */}
              <form onSubmit={handleCreatePermission} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Adicionar Nova Página</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Chave (ex: conferencia)</label>
                    <input 
                      type="text" 
                      required
                      value={newPermission.name}
                      onChange={e => setNewPermission({...newPermission, name: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="nome_da_permissao"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descrição (ex: Conferência ICMS)</label>
                    <input 
                      type="text" 
                      required
                      value={newPermission.description}
                      onChange={e => setNewPermission({...newPermission, description: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nome visível"
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ícone (Emoji)</label>
                      <input 
                        type="text" 
                        value={newPermission.icon}
                        onChange={e => setNewPermission({...newPermission, icon: e.target.value})}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-center"
                        placeholder="📄"
                      />
                    </div>
                    <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 h-[42px] px-4">
                      Adicionar
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Páginas Existentes</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-medium">
                      <tr>
                        <th className="p-3">Ícone</th>
                        <th className="p-3">Chave</th>
                        <th className="p-3">Descrição</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {permissions.map(perm => (
                        <tr key={perm.id} className="hover:bg-gray-50">
                          <td className="p-3 text-center text-lg">{perm.icon}</td>
                          <td className="p-3 font-mono text-xs text-blue-600">{perm.name}</td>
                          <td className="p-3">{perm.description}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleDeletePermission(perm.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remover página"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {permissions.length === 0 && (
                        <tr>
                          <td colspan="4" className="p-4 text-center text-gray-500">Nenhuma página cadastrada</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
