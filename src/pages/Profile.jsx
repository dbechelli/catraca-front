import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Sidebar from '../components/Sidebar';
import { ArrowLeft } from 'lucide-react';
import '../styles/Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword) {
      setError('Senha atual é obrigatória');
      return;
    }

    if (!formData.newPassword) {
      setError('Nova senha é obrigatória');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Senhas não conferem');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      setSuccess('Senha alterada com sucesso!');
      setFormData({
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-layout">
      <Sidebar />

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <button 
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="icon" />
              Voltar
            </button>
            <h1>Editar Perfil</h1>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="profile-content">
            {/* Informações do Usuário */}
            <section className="profile-section">
              <h2>Informações da Conta</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome de Usuário</label>
                  <div className="info-value">{user?.username}</div>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <div className="info-value">
                    <span className={`badge badge-${user?.role}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <div className="info-value">
                    <span className="badge badge-success">Ativo</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Alterar Senha */}
            <section className="profile-section">
              <div className="section-header">
                <h2>Segurança</h2>
                {!showPasswordForm && (
                  <button
                    className="btn-secondary"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Alterar Senha
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label>Senha Atual</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        currentPassword: e.target.value 
                      })}
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nova Senha</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        newPassword: e.target.value 
                      })}
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        confirmPassword: e.target.value 
                      })}
                      placeholder="Confirme a nova senha"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
