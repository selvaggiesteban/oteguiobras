import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)',
        marginTop: 70,
        backgroundColor: '#fff',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <span
        style={{
          fontSize: '8rem',
          fontWeight: 700,
          lineHeight: 1,
          color: '#6b5e50',
        }}
      >
        404
      </span>
      <p
        style={{
          fontSize: '1.5rem',
          color: '#3e3529',
          margin: '1rem 0 2rem',
        }}
      >
        Página no encontrada
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 2rem',
          backgroundColor: '#6b5e50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 4,
          fontSize: '1rem',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3e3529')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b5e50')}
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFound;
