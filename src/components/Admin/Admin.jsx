import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminHome from './AdminHome';
import AdminObras from './AdminObras';
import AdminObrasDestacadas from './AdminObrasDestacadas';
import AdminClientes from './AdminClientes';
import AdminFAQ from './AdminFAQ';
import AdminEquipo from './AdminEquipo';
import AdminMensajes from './AdminMensajes';
import AdminPostulaciones from './AdminPostulaciones';
import './Admin.css';

// SVG Icons
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <rect x="9" y="14" width="6" height="8"/>
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconQuestion = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconConstruction = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',              icon: <IconHome />,         desc: 'Configuración del hero y métricas' },
  { id: 'destacadas', label: 'Obras Destacadas',   icon: <IconStar />,         desc: 'Obras que aparecen en el Home' },
  { id: 'obras',      label: 'Todas las Obras',    icon: <IconConstruction />, desc: 'Catálogo completo de obras' },
  { id: 'clientes',   label: 'Clientes',           icon: <IconBuilding />,     desc: 'Logos del carrusel de clientes' },
  { id: 'faq',        label: 'Preguntas FAQ',       icon: <IconQuestion />,     desc: 'Preguntas frecuentes del sitio' },
  { id: 'equipo',     label: 'Equipo',             icon: <IconUsers />,        desc: 'Miembros del equipo de trabajo' },
  { id: 'mensajes',       label: 'Mensajes',           icon: <IconInbox />,        desc: 'Consultas recibidas del formulario de contacto' },
  { id: 'postulaciones',  label: 'Postulaciones',      icon: <IconBriefcase />,    desc: 'CVs recibidos desde "Trabajá con nosotros"' },
];

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('home');
  const { user, logout } = useAuth();

  const seccionInfo = NAV_ITEMS.find(n => n.id === seccionActiva);

  return (
    <div className="admin-shell">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">OO</div>
          <div className="brand-text">
            <span className="brand-name">Otegui Obras</span>
            <span className="brand-sub">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Contenido</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${seccionActiva === item.id ? ' active' : ''}`}
              onClick={() => setSeccionActiva(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Volver al sitio</span>
          </Link>
          <button onClick={logout} className="sidebar-back-link" style={{background:'none',border:'none',cursor:'pointer'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>{seccionInfo?.label}</h1>
            <p>{seccionInfo?.desc}</p>
          </div>
          <div className="topbar-right">
            <span className="topbar-user" style={{fontSize:'0.85rem',color:'#888'}}>{user?.email}</span>
            <span className="topbar-badge">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>
              Producción
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-page-content">

          {seccionActiva === 'home' && <AdminHome />}
          {seccionActiva === 'destacadas' && <AdminObrasDestacadas />}
          {seccionActiva === 'clientes' && <AdminClientes />}
          {seccionActiva === 'faq' && <AdminFAQ />}
          {seccionActiva === 'obras' && <AdminObras />}
          {seccionActiva === 'mensajes' && <AdminMensajes />}
          {seccionActiva === 'postulaciones' && <AdminPostulaciones />}

          {seccionActiva === 'equipo' && <AdminEquipo />}
        </div>
      </div>
    </div>
  );
}

export default Admin;
