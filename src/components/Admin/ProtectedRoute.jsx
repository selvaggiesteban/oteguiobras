import { useAuth } from '../../hooks/useAuth';
import Login from './Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1a1a2e',
        color: '#d4a574',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>OO</div>
          <div>Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return children;
}

export default ProtectedRoute;
