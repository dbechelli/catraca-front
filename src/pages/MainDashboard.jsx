import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/MainDashboard.css';

export default function MainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardContent = () => {
    if (!user) {
      return (
        <div className="dashboard-content">
          <div className="loading">Carregando...</div>
        </div>
      );
    }

    if (user?.role === 'superadmin') {
      return (
        <div className="dashboard-content">
          <div className="welcome-section">
            <h1>👋 Bem-vindo, {user?.username}!</h1>
            <p className="subtitle">Você é um SuperAdmin - acesso total ao sistema</p>
          </div>

          <div className="quick-actions">
            <button 
              className="action-card"
              onClick={() => navigate('/admin/users')}
            >
              <div className="card-icon">👥</div>
              <h3>Gerenciar Usuários</h3>
              <p>Criar, editar e deletar usuários</p>
            </button>
          </div>

          <div className="info-section">
            <h2>⚙️ Panel de Controle</h2>
            <p>Use o menu lateral para acessar todas as funcionalidades do sistema.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>👋 Bem-vindo, {user?.username}!</h1>
          <p className="subtitle">Dashboard Principal</p>
        </div>

        <div className="info-section">
          <h2>📋 Suas Páginas Disponíveis</h2>
          <p>Use o menu lateral para acessar as páginas que você tem permissão.</p>
          <p className="info-hint">Se você não conseguir encontrar uma página que deveria ter acesso, entre em contato com o administrador.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="main-dashboard-layout">
      <Sidebar />
      <main className="main-dashboard">
        {getDashboardContent()}
      </main>
    </div>
  );
}
